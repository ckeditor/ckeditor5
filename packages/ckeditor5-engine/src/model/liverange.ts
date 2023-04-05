/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/liverange
 */

import Range from './range';

import type { ModelApplyOperationEvent } from './model';
import type DocumentFragment from './documentfragment';
import type Element from './element';
import type Item from './item';
import type MergeOperation from './operation/mergeoperation';
import type MoveOperation from './operation/moveoperation';
import type Operation from './operation/operation';
import type Position from './position';

import { EmitterMixin } from '@ckeditor/ckeditor5-utils';

/**
 * `LiveRange` is a type of {@link module:engine/model/range~Range Range}
 * that updates itself as {@link module:engine/model/document~Document document}
 * is changed through operations. It may be used as a bookmark.
 *
 * **Note:** Be very careful when dealing with `LiveRange`. Each `LiveRange` instance bind events that might
 * have to be unbound. Use {@link module:engine/model/liverange~LiveRange#detach detach} whenever you don't need `LiveRange` anymore.
 */
export default class LiveRange extends EmitterMixin( Range ) {
	/**
	 * Creates a live range.
	 *
	 * @see module:engine/model/range~Range
	 */
	constructor( start: Position, end?: Position | null ) {
		super( start, end );

		bindWithDocument.call( this );
	}

	/**
	 * Unbinds all events previously bound by `LiveRange`. Use it whenever you don't need `LiveRange` instance
	 * anymore (i.e. when leaving scope in which it was declared or before re-assigning variable that was
	 * referring to it).
	 */
	public detach(): void {
		this.stopListening();
	}

	/**
	 * Creates a {@link module:engine/model/range~Range range instance} that is equal to this live range.
	 */
	public toRange(): Range {
		return new Range( this.start, this.end );
	}

	/**
	 * Creates a `LiveRange` instance that is equal to the given range.
	 */
	public static fromRange( range: Range ): LiveRange {
		return new LiveRange( range.start, range.end );
	}

	/**
	 * @see module:engine/model/range~Range._createIn
	 * @internal
	 */

	declare public static readonly _createIn: ( element: Element | DocumentFragment ) => LiveRange;

	/**
	 * @see module:engine/model/range~Range._createOn
	 * @internal
	 */

	declare public static readonly _createOn: ( element: Item | DocumentFragment ) => LiveRange;

	/**
	 * @see module:engine/model/range~Range._createFromPositionAndShift
	 * @internal
	 */

	declare public static readonly _createFromPositionAndShift: ( position: Position, shift: number ) => LiveRange;
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
LiveRange.prototype.is = function( type: string ): boolean {
	return type === 'liveRange' || type === 'model:liveRange' ||
		// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
		type == 'range' || type === 'model:range';
};

/**
 * Fired when `LiveRange` instance boundaries have changed due to changes in the
 * {@link module:engine/model/document~Document document}.
 *
 * @eventName ~LiveRange#change:range
 * @param oldRange Range with start and end position equal to start and end position of this live
 * range before it got changed.
 * @param data Object with additional information about the change.
 * @param data.deletionPosition Source position for remove and merge changes.
 * Available if the range was moved to the graveyard root, `null` otherwise.
 */
export type LiveRangeChangeRangeEvent = {
	name: 'change' | 'change:range';
	args: [ range: Range, data: { deletionPosition: Position | null } ];
};

/**
 * Fired when `LiveRange` instance boundaries have not changed after a change in {@link module:engine/model/document~Document document}
 * but the change took place inside the range, effectively changing its content.
 *
 * @eventName ~LiveRange#change:content
 * @param range Range with start and end position equal to start and end position of
 * change range.
 * @param data Object with additional information about the change.
 * @param data.deletionPosition Due to the nature of this event, this property is always set to `null`. It is passed
 * for compatibility with the {@link module:engine/model/liverange~LiveRange#event:change:range} event.
 */
export type LiveRangeChangeContentEvent = {
	name: 'change' | 'change:content';
	args: [ range: Range, data: { deletionPosition: null } ];
};

/**
 * Describes `change:range` or `change:content` event.
 */
export type LiveRangeChangeEvent = {
	name: 'change' | 'change:range' | 'change:content';
	args: [ range: Range, data: { deletionPosition: Position | null } ];
};

/**
 * Binds this `LiveRange` to the {@link module:engine/model/document~Document document}
 * that owns this range's {@link module:engine/model/range~Range#root root}.
 */
function bindWithDocument( this: LiveRange ) {
	this.listenTo<ModelApplyOperationEvent>(
		this.root.document!.model,
		'applyOperation',
		( event, args ) => {
			const operation = args[ 0 ];

			if ( !operation.isDocumentOperation ) {
				return;
			}

			transform.call( this, operation );
		},
		{ priority: 'low' }
	);
}

/**
 * Updates this range accordingly to the updates applied to the model. Bases on change events.
 */
function transform( this: LiveRange, operation: Operation ) {
	// Transform the range by the operation. Join the result ranges if needed.
	const ranges = this.getTransformedByOperation( operation );
	const result = Range._createFromRanges( ranges );

	const boundariesChanged = !result.isEqual( this );
	const contentChanged = doesOperationChangeRangeContent( this, operation );

	let deletionPosition = null;

	if ( boundariesChanged ) {
		// If range boundaries have changed, fire `change:range` event.
		//
		if ( result.root.rootName == '$graveyard' ) {
			// If the range was moved to the graveyard root, set `deletionPosition`.
			if ( operation.type == 'remove' ) {
				deletionPosition = ( operation as MoveOperation ).sourcePosition;
			} else {
				// Merge operation.
				deletionPosition = ( operation as MergeOperation ).deletionPosition;
			}
		}

		const oldRange = this.toRange();

		( this as any ).start = result.start;
		( this as any ).end = result.end;

		this.fire<LiveRangeChangeRangeEvent>( 'change:range', oldRange, { deletionPosition } );
	} else if ( contentChanged ) {
		// If range boundaries have not changed, but there was change inside the range, fire `change:content` event.
		this.fire<LiveRangeChangeContentEvent>( 'change:content', this.toRange(), { deletionPosition } );
	}
}

/**
 * Checks whether given operation changes something inside the range (even if it does not change boundaries).
 */
function doesOperationChangeRangeContent( range: Range, operation: any ) {
	switch ( operation.type ) {
		case 'insert':
			return range.containsPosition( operation.position );
		case 'move':
		case 'remove':
		case 'reinsert':
		case 'merge':
			return range.containsPosition( operation.sourcePosition ) ||
				range.start.isEqual( operation.sourcePosition ) ||
				range.containsPosition( operation.targetPosition );
		case 'split':
			return range.containsPosition( operation.splitPosition ) || range.containsPosition( operation.insertionPosition );
	}

	return false;
}
