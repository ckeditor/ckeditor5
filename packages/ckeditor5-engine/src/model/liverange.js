/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Range from './range.js';
import EmitterMixin from '../../utils/emittermixin.js';
import mix from '../../utils/mix.js';

/**
 * `LiveRange` is a type of {@link engine.model.Range Range} that updates itself as {@link engine.model.Document document}
 * is changed through operations. It may be used as a bookmark.
 *
 * **Note:** Be very careful when dealing with `LiveRange`. Each `LiveRange` instance bind events that might
 * have to be unbound. Use {@link engine.model.LiveRange#detach detach} whenever you don't need `LiveRange` anymore.
 *
 * @memberOf engine.model
 */
export default class LiveRange extends Range {
	/**
	 * Creates a live range.
	 *
	 * @see engine.model.Range
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
	 * @see engine.model.Range.createIn
	 * @static
	 * @method engine.model.LiveRange.createIn
	 * @param {engine.model.Element} element
	 * @returns {engine.model.LiveRange}
	 */

	/**
	 * @see engine.model.Range.createFromPositionAndShift
	 * @static
	 * @method engine.model.LiveRange.createFromPositionAndShift
	 * @param {engine.model.Position} position
	 * @param {Number} shift
	 * @returns {engine.model.LiveRange}
	 */

	/**
	 * @see engine.model.Range.createFromParentsAndOffsets
	 * @static
	 * @method engine.model.LiveRange.createFromParentsAndOffsets
	 * @param {engine.model.Element} startElement
	 * @param {Number} startOffset
	 * @param {engine.model.Element} endElement
	 * @param {Number} endOffset
	 * @returns {engine.model.LiveRange}
	 */

	/**
	 * @see engine.model.Range.createFromRange
	 * @static
	 * @method engine.model.LiveRange.createFromRange
	 * @param {engine.model.Range} range
	 * @returns {engine.model.LiveRange}
	 */
}

/**
 * Binds this `LiveRange` to the {@link engine.model.Document document} that owns this range's {@link engine.model.Range#root root}.
 *
 * @ignore
 * @private
 * @method engine.model.LiveRange#bindWithDocument
 */
function bindWithDocument() {
	/*jshint validthis: true */

	this.listenTo(
		this.root.document,
		'change',
		( event, type, changes ) => {
			if ( supportedTypes.has( type ) ) {
				transform.call( this, type, changes.range, changes.sourcePosition );
			}
		}
	);
}

const supportedTypes = new Set( [ 'insert', 'move', 'remove', 'reinsert' ] );

/**
 * Updates this range accordingly to the updates applied to the model. Bases on change events.
 *
 * @ignore
 * @private
 * @method transform
 * @param {String} type Type of changes applied to the Tree Model.
 * @param {engine.model.Range} range Range containing the result of applied change.
 * @param {engine.model.Position} [position] Additional position parameter provided by some change events.
 */
function transform( type, range, position ) {
	/* jshint validthis: true */
	let updated;
	const howMany = range.end.offset - range.start.offset;

	switch ( type ) {
		case 'insert':
			updated = this._getTransformedByInsertion( range.start, howMany, false, true )[ 0 ];
			break;

		case 'move':
		case 'remove':
		case 'reinsert':
			const sourcePosition = position;

			// Range._getTransformedByMove is expecting `targetPosition` to be "before" move
			// (before transformation). `range.start` is already after the move happened.
			// We have to revert `range.start` to the state before the move.
			const targetPosition = range.start._getTransformedByInsertion( sourcePosition, howMany );

			const result = this._getTransformedByMove( sourcePosition, targetPosition, howMany, false, true );

			// First item in the array is the "difference" part, so a part of the range
			// that did not get moved. We use it as reference range and expand if possible.
			updated = result[ 0 ];

			// We will check if there is other range and if it is touching the reference range.
			// If it does, we will expand the reference range (at the beginning or at the end).
			// Keep in mind that without settings `spread` flag, `_getTransformedByMove` may
			// return maximum two ranges.
			if ( result.length > 1 ) {
				let otherRange = result[ 1 ];

				if ( updated.start.isTouching( otherRange.end ) ) {
					updated.start = otherRange.start;
				} else if ( updated.end.isTouching( otherRange.start ) ) {
					updated.end = otherRange.end;
				}
			}

			break;
	}

	this.start = updated.start;
	this.end = updated.end;
}

mix( LiveRange, EmitterMixin );
