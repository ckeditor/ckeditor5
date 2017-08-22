/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
	 * @see module:engine/model/range~Range.createIn
	 * @static
	 * @method module:engine/model/liverange~LiveRange.createIn
	 * @param {module:engine/model/element~Element} element
	 * @returns {module:engine/model/liverange~LiveRange}
	 */

	/**
	 * @see module:engine/model/range~Range.createFromPositionAndShift
	 * @static
	 * @method module:engine/model/liverange~LiveRange.createFromPositionAndShift
	 * @param {module:engine/model/position~Position} position
	 * @param {Number} shift
	 * @returns {module:engine/model/liverange~LiveRange}
	 */

	/**
	 * @see module:engine/model/range~Range.createFromParentsAndOffsets
	 * @static
	 * @method module:engine/model/liverange~LiveRange.createFromParentsAndOffsets
	 * @param {module:engine/model/element~Element} startElement
	 * @param {Number} startOffset
	 * @param {module:engine/model/element~Element} endElement
	 * @param {Number} endOffset
	 * @returns {module:engine/model/liverange~LiveRange}
	 */

	/**
	 * @see module:engine/model/range~Range.createFromRange
	 * @static
	 * @method module:engine/model/liverange~LiveRange.createFromRange
	 * @param {module:engine/model/range~Range} range
	 * @returns {module:engine/model/liverange~LiveRange}
	 */

	/**
	 * Fired when `LiveRange` instance boundaries have changed due to changes in the
	 * {@link module:engine/model/document~Document document}.
	 *
	 * @event change:range
	 * @param {module:engine/model/range~Range} oldRange Range with start and end position equal to start and end position of this live
	 * range before it got changed.
	 * @param {Object} data Object with additional information about the change. Those parameters are passed from
	 * {@link module:engine/model/document~Document#event:change document change event}.
	 * @param {String} data.type Change type.
	 * @param {module:engine/model/batch~Batch} data.batch Batch which changed the live range.
	 * @param {module:engine/model/range~Range} data.range Range containing the result of applied change.
	 * @param {module:engine/model/position~Position} data.sourcePosition Source position for move, remove and reinsert change types.
	 */

	/**
	 * Fired when `LiveRange` instance boundaries have not changed after a change in {@link module:engine/model/document~Document document}
	 * but the change took place inside the range, effectively changing its content.
	 *
	 * @event change:content
	 * @param {module:engine/model/range~Range} range Range with start and end position equal to start and end position of
	 * change range.
	 * @param {Object} data Object with additional information about the change. Those parameters are passed from
	 * {@link module:engine/model/document~Document#event:change document change event}.
	 * @param {String} data.type Change type.
	 * @param {module:engine/model/batch~Batch} data.batch Batch which changed the live range.
	 * @param {module:engine/model/range~Range} data.range Range containing the result of applied change.
	 * @param {module:engine/model/position~Position} data.sourcePosition Source position for move, remove and reinsert change types.
	 */
}

/**
 * Binds this `LiveRange` to the {@link module:engine/model/document~Document document}
 * that owns this range's {@link module:engine/model/range~Range#root root}.
 *
 * @ignore
 * @private
 * @method module:engine/model/liverange~LiveRange#bindWithDocument
 */
function bindWithDocument() {
	// Operation types that a range can be transformed by.
	const supportedTypes = new Set( [ 'insert', 'move', 'remove', 'reinsert' ] );

	this.listenTo(
		this.root.document,
		'change',
		( event, type, changes, batch, deltaType ) => {
			if ( supportedTypes.has( type ) ) {
				transform.call( this, type, deltaType, batch, changes.range, changes.sourcePosition );
			}
		},
		{ priority: 'high' }
	);
}

/**
 * Updates this range accordingly to the updates applied to the model. Bases on change events.
 *
 * @ignore
 * @private
 * @method transform
 * @param {String} [changeType] Type of change applied to the model document.
 * @param {String} [deltaType] Type of delta which introduced the change.
 * @param {module:engine/model/batch~Batch} batch Batch which changes the live range.
 * @param {module:engine/model/range~Range} targetRange Range containing the result of applied change.
 * @param {module:engine/model/position~Position} [sourcePosition] Source position for move, remove and reinsert change types.
 */
function transform( changeType, deltaType, batch, targetRange, sourcePosition ) {
	const howMany = targetRange.end.offset - targetRange.start.offset;
	let targetPosition = targetRange.start;

	if ( changeType == 'move' || changeType == 'remove' || changeType == 'reinsert' ) {
		// Range._getTransformedByDocumentChange is expecting `targetPosition` to be "before" move
		// (before transformation). `targetRange.start` is already after the move happened.
		// We have to revert `targetPosition` to the state before the move.
		targetPosition = targetPosition._getTransformedByInsertion( sourcePosition, howMany );
	}

	const result = this._getTransformedByDocumentChange( changeType, deltaType, targetPosition, howMany, sourcePosition );

	// Decide whether moved part should be included in the range.
	//
	// First, this concerns only `move` change, because insert change includes inserted part always (changeType == 'move').
	// Second, this is a case only if moved range was intersecting with this range and was inserted into this range (result.length == 3).
	if ( ( changeType == 'move' || changeType == 'remove' || changeType == 'reinsert' ) && result.length == 3 ) {
		// `result[ 2 ]` is a "common part" of this range and moved range. We substitute that common part with the whole
		// `targetRange` because we want to include whole `targetRange` in this range.
		result[ 2 ] = targetRange;
	}

	const updated = Range.createFromRanges( result );

	const boundariesChanged = !updated.isEqual( this );

	const rangeExpanded = this.containsPosition( targetPosition );
	const rangeShrunk = sourcePosition && ( this.containsPosition( sourcePosition ) || this.start.isEqual( sourcePosition ) );
	const contentChanged = rangeExpanded || rangeShrunk;

	if ( boundariesChanged ) {
		// If range boundaries have changed, fire `change:range` event.
		const oldRange = Range.createFromRange( this );

		this.start = updated.start;
		this.end = updated.end;

		this.fire( 'change:range', oldRange, {
			type: changeType,
			batch,
			range: targetRange,
			sourcePosition
		} );
	} else if ( contentChanged ) {
		// If range boundaries have not changed, but there was change inside the range, fire `change:content` event.
		this.fire( 'change:content', Range.createFromRange( this ), {
			type: changeType,
			batch,
			range: targetRange,
			sourcePosition
		} );
	}
}

mix( LiveRange, EmitterMixin );
