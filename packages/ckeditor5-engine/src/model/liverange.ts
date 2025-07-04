/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/liverange
 */

import { ModelRange } from './range.js';

import type { ModelApplyOperationEvent } from './model.js';
import { type ModelDocumentFragment } from './documentfragment.js';
import { type ModelElement } from './element.js';
import { type ModelItem } from './item.js';
import { type MergeOperation } from './operation/mergeoperation.js';
import { type MoveOperation } from './operation/moveoperation.js';
import { type Operation } from './operation/operation.js';
import { type ModelPosition } from './position.js';

import { EmitterMixin } from '@ckeditor/ckeditor5-utils';

/**
 * `ModelLiveRange` is a type of {@link module:engine/model/range~ModelRange Range}
 * that updates itself as {@link module:engine/model/document~ModelDocument document}
 * is changed through operations. It may be used as a bookmark.
 *
 * **Note:** Be very careful when dealing with `ModelLiveRange`. Each `ModelLiveRange` instance bind events that might
 * have to be unbound. Use {@link module:engine/model/liverange~ModelLiveRange#detach detach} whenever you don't need
 * `ModelLiveRange` anymore.
 */
export class ModelLiveRange extends /* #__PURE__ */ EmitterMixin( ModelRange ) {
	/**
	 * Creates a live range.
	 *
	 * @see module:engine/model/range~ModelRange
	 */
	constructor( start: ModelPosition, end?: ModelPosition | null ) {
		super( start, end );

		bindWithDocument.call( this );
	}

	/**
	 * Unbinds all events previously bound by `ModelLiveRange`. Use it whenever you don't need `ModelLiveRange` instance
	 * anymore (i.e. when leaving scope in which it was declared or before re-assigning variable that was
	 * referring to it).
	 */
	public detach(): void {
		this.stopListening();
	}

	/**
	 * Creates a {@link module:engine/model/range~ModelRange range instance} that is equal to this live range.
	 */
	public toRange(): ModelRange {
		return new ModelRange( this.start, this.end );
	}

	/**
	 * Creates a `ModelLiveRange` instance that is equal to the given range.
	 */
	public static fromRange( range: ModelRange ): ModelLiveRange {
		return new ModelLiveRange( range.start, range.end );
	}

	/**
	 * @see module:engine/model/range~ModelRange._createIn
	 * @internal
	 */

	declare public static readonly _createIn: ( element: ModelElement | ModelDocumentFragment ) => ModelLiveRange;

	/**
	 * @see module:engine/model/range~ModelRange._createOn
	 * @internal
	 */

	declare public static readonly _createOn: ( element: ModelItem | ModelDocumentFragment ) => ModelLiveRange;

	/**
	 * @see module:engine/model/range~ModelRange._createFromPositionAndShift
	 * @internal
	 */

	declare public static readonly _createFromPositionAndShift: ( position: ModelPosition, shift: number ) => ModelLiveRange;
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ModelLiveRange.prototype.is = function( type: string ): boolean {
	return type === 'liveRange' || type === 'model:liveRange' ||
		// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
		type == 'range' || type === 'model:range';
};

/**
 * Fired when `ModelLiveRange` instance boundaries have changed due to changes in the
 * {@link module:engine/model/document~ModelDocument document}.
 *
 * @eventName ~ModelLiveRange#change:range
 * @param oldRange Range with start and end position equal to start and end position of this live
 * range before it got changed.
 * @param data Object with additional information about the change.
 * @param data.deletionPosition Source position for remove and merge changes.
 * Available if the range was moved to the graveyard root, `null` otherwise.
 */
export type ModelLiveRangeChangeRangeEvent = {
	name: 'change' | 'change:range';
	args: [ range: ModelRange, data: { deletionPosition: ModelPosition | null } ];
};

/**
 * Fired when `ModelLiveRange` instance boundaries have not changed after
 * a change in {@link module:engine/model/document~ModelDocument document}
 * but the change took place inside the range, effectively changing its content.
 *
 * @eventName ~ModelLiveRange#change:content
 * @param range Range with start and end position equal to start and end position of
 * change range.
 * @param data Object with additional information about the change.
 * @param data.deletionPosition Due to the nature of this event, this property is always set to `null`. It is passed
 * for compatibility with the {@link module:engine/model/liverange~ModelLiveRange#event:change:range} event.
 */
export type ModelLiveRangeChangeContentEvent = {
	name: 'change' | 'change:content';
	args: [ range: ModelRange, data: { deletionPosition: null } ];
};

/**
 * Describes `change:range` or `change:content` event.
 *
 * @eventName ~ModelLiveRange#change
 */
export type ModelLiveRangeChangeEvent = {
	name: 'change' | 'change:range' | 'change:content';
	args: [ range: ModelRange, data: { deletionPosition: ModelPosition | null } ];
};

/**
 * Binds this `ModelLiveRange` to the {@link module:engine/model/document~ModelDocument document}
 * that owns this range's {@link module:engine/model/range~ModelRange#root root}.
 */
function bindWithDocument( this: ModelLiveRange ) {
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
function transform( this: ModelLiveRange, operation: Operation ) {
	// Transform the range by the operation. Join the result ranges if needed.
	const ranges = this.getTransformedByOperation( operation );
	const result = ModelRange._createFromRanges( ranges );

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

		this.fire<ModelLiveRangeChangeRangeEvent>( 'change:range', oldRange, { deletionPosition } );
	} else if ( contentChanged ) {
		// If range boundaries have not changed, but there was change inside the range, fire `change:content` event.
		this.fire<ModelLiveRangeChangeContentEvent>( 'change:content', this.toRange(), { deletionPosition } );
	}
}

/**
 * Checks whether given operation changes something inside the range (even if it does not change boundaries).
 */
function doesOperationChangeRangeContent( range: ModelRange, operation: any ) {
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
