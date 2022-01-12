/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/liverange
 */

import Range from './range';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * `LiveRange` is a type of {@link module:engine/model/range~Range Range}
 * that updates itself as {@link module:engine/model/document~Document document}
 * is changed through operations. It may be used as a bookmark.
 *
 * **Note:** Be very careful when dealing with `LiveRange`. Each `LiveRange` instance bind events that might
 * have to be unbound. Use {@link module:engine/model/liverange~LiveRange#detach detach} whenever you don't need `LiveRange` anymore.
 */
export default class LiveRange extends Range {
	/**
	 * Creates a live range.
	 *
	 * @see module:engine/model/range~Range
	 */
	constructor( start, end ) {
		super( start, end );

		bindWithDocument.call( this );
	}

	/**
	 * Unbinds all events previously bound by `LiveRange`. Use it whenever you don't need `LiveRange` instance
	 * anymore (i.e. when leaving scope in which it was declared or before re-assigning variable that was
	 * referring to it).
	 */
	detach() {
		this.stopListening();
	}

	/**
	 * Checks whether this object is of the given.
	 *
	 *		liveRange.is( 'range' ); // -> true
	 *		liveRange.is( 'model:range' ); // -> true
	 *		liveRange.is( 'liveRange' ); // -> true
	 *		liveRange.is( 'model:liveRange' ); // -> true
	 *
	 *		liveRange.is( 'view:range' ); // -> false
	 *		liveRange.is( 'documentSelection' ); // -> false
	 *
	 * {@link module:engine/model/node~Node#is Check the entire list of model objects} which implement the `is()` method.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	is( type ) {
		return type === 'liveRange' || type === 'model:liveRange' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type == 'range' || type === 'model:range';
	}

	/**
	 * Creates a {@link module:engine/model/range~Range range instance} that is equal to this live range.
	 *
	 * @returns {module:engine/model/range~Range}
	 */
	toRange() {
		return new Range( this.start, this.end );
	}

	/**
	 * Creates a `LiveRange` instance that is equal to the given range.
	 *
	 * @param {module:engine/model/range~Range} range
	 * @returns {module:engine/model/liverange~LiveRange}
	 */
	static fromRange( range ) {
		return new LiveRange( range.start, range.end );
	}

	/**
	 * @see module:engine/model/range~Range._createIn
	 * @static
	 * @protected
	 * @method module:engine/model/liverange~LiveRange._createIn
	 * @param {module:engine/model/element~Element} element
	 * @returns {module:engine/model/liverange~LiveRange}
	 */

	/**
	 * @see module:engine/model/range~Range._createOn
	 * @static
	 * @protected
	 * @method module:engine/model/liverange~LiveRange._createOn
	 * @param {module:engine/model/element~Element} element
	 * @returns {module:engine/model/liverange~LiveRange}
	 */

	/**
	 * @see module:engine/model/range~Range._createFromPositionAndShift
	 * @static
	 * @protected
	 * @method module:engine/model/liverange~LiveRange._createFromPositionAndShift
	 * @param {module:engine/model/position~Position} position
	 * @param {Number} shift
	 * @returns {module:engine/model/liverange~LiveRange}
	 */

	/**
	 * Fired when `LiveRange` instance boundaries have changed due to changes in the
	 * {@link module:engine/model/document~Document document}.
	 *
	 * @event change:range
	 * @param {module:engine/model/range~Range} oldRange Range with start and end position equal to start and end position of this live
	 * range before it got changed.
	 * @param {Object} data Object with additional information about the change.
	 * @param {module:engine/model/position~Position|null} data.deletionPosition Source position for remove and merge changes.
	 * Available if the range was moved to the graveyard root, `null` otherwise.
	 */

	/**
	 * Fired when `LiveRange` instance boundaries have not changed after a change in {@link module:engine/model/document~Document document}
	 * but the change took place inside the range, effectively changing its content.
	 *
	 * @event change:content
	 * @param {module:engine/model/range~Range} range Range with start and end position equal to start and end position of
	 * change range.
	 * @param {Object} data Object with additional information about the change.
	 * @param {null} data.deletionPosition Due to the nature of this event, this property is always set to `null`. It is passed
	 * for compatibility with the {@link module:engine/model/liverange~LiveRange#event:change:range} event.
	 */
}

// Binds this `LiveRange` to the {@link module:engine/model/document~Document document}
// that owns this range's {@link module:engine/model/range~Range#root root}.
//
// @private
function bindWithDocument() {
	this.listenTo(
		this.root.document.model,
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

// Updates this range accordingly to the updates applied to the model. Bases on change events.
//
// @private
// @param {module:engine/model/operation/operation~Operation} operation Executed operation.
function transform( operation ) {
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
				deletionPosition = operation.sourcePosition;
			} else {
				// Merge operation.
				deletionPosition = operation.deletionPosition;
			}
		}

		const oldRange = this.toRange();

		this.start = result.start;
		this.end = result.end;

		this.fire( 'change:range', oldRange, { deletionPosition } );
	} else if ( contentChanged ) {
		// If range boundaries have not changed, but there was change inside the range, fire `change:content` event.
		this.fire( 'change:content', this.toRange(), { deletionPosition } );
	}
}

// Checks whether given operation changes something inside the range (even if it does not change boundaries).
//
// @private
// @param {module:engine/model/range~Range} range Range to check.
// @param {module:engine/model/operation/operation~Operation} operation Executed operation.
// @returns {Boolean}
function doesOperationChangeRangeContent( range, operation ) {
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

mix( LiveRange, EmitterMixin );
