/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../../utils/ckeditorerror.js';
import Range from './range.js';
import Position from './position.js';
import utils from '../../utils/utils.js';
import EmitterMixin from '../../utils/emittermixin.js';

/**
 * Class representing selection in tree view.
 *
 * @memberOf engine.treeView
 */
export default class Selection {
	/**
	 * Creates new selection instance.
	 */
	constructor() {
		/**
		 * Stores all ranges that are selected.
		 *
		 * @private
		 * @member {Array.<engine.treeView.Range>} engine.treeView.Selection#_ranges
		 */
		this._ranges = [];

		/**
		 * Specifies whether the last added range was added as a backward or forward range.
		 *
		 * @private
		 * @member {Boolean} engine.treeView.Selection#_lastRangeBackward
		 */
		this._lastRangeBackward = false;
	}

	/**
	 * Selection anchor. Anchor may be described as a position where the selection starts. Together with
	 * {@link engine.treeView.Selection#focus focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. Anchor is always the start or end of the most recent added range.
	 * It may be a bit unintuitive when there are multiple ranges in selection.
	 *
	 * @see engine.treeView.Selection#focus
	 * @type {engine.treeView.Position}
	 */
	get anchor() {
		if ( !this._ranges.length ) {
			return null;
		}
		const range = this._ranges[ this._ranges.length - 1 ];
		const anchor = this._lastRangeBackward ? range.end : range.start;

		return Position.createFromPosition( anchor );
	}

	/**
	 * Selection focus. Focus is a position where the selection ends.
	 *
	 * @see engine.treeView.Selection#anchor
	 * @type {engine.treeView.Position}
	 */
	get focus() {
		if ( !this._ranges.length ) {
			return null;
		}
		const range = this._ranges[ this._ranges.length - 1 ];
		const focus = this._lastRangeBackward ? range.start : range.end;

		return Position.createFromPosition( focus );
	}

	/**
	 * Returns whether the selection is collapsed. Selection is collapsed when all it's ranges are collapsed.
	 *
	 * @type {Boolean}
	 */
	get isCollapsed() {
		for ( let range of this._ranges ) {
			if ( !range.isCollapsed ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Returns number of ranges in selection.
	 *
	 * @type {Number}
     */
	get rangeCount() {
		return this._ranges.length;
	}

	/**
	 * Adds a range to the selection. Added range is copied. This means that passed range is not saved in the
	 * selection instance and you can safely operate on it.
	 *
	 * Accepts a flag describing in which way the selection is made - passed range might be selected from
	 * {@link engine.treeView.Range#start start} to {@link engine.treeView.Range#end end}
	 * or from {@link engine.treeView.Range#end end} to {@link engine.treeView.Range#start start}.
	 * The flag is used to set {@link engine.treeView.Selection#anchor anchor} and
	 * {@link engine.treeView.Selection#focus focus} properties.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `view-selection-range-intersects` if added range intersects
	 * with ranges already stored in Selection instance.
	 *
	 * @fires engine.treeView.Selection#change
	 * @param {engine.treeView.Range} range
	 */
	addRange( range, isBackward ) {
		this._pushRange( range );
		this._lastRangeBackward = !!isBackward;
		this.fire( 'change' );
	}

	/**
	 * Returns an array of ranges added to the selection. The method returns a copy of internal array, so
	 * it will not change when ranges get added or removed from selection.
	 *
	 * @returns {Array.<engine.treeView.Range>}
	 */
	getRanges() {
		return this._ranges.slice();
	}

	/**
	 * Returns copy of a range at specified index, or `null` if there is no range under that index.
	 *
	 * @param {Number} index Index of range in selection.
	 * @returns {engine.treeView.Range|null}
	 */
	getRangeAt( index ) {
		const range = this._ranges[ index ];

		return range ? Range.createFromRange( range ) : null;
	}

	/**
	 * Returns copy of the first range in the selection. First range is the one which
	 * {@link engine.treeView.Range#start start} position {@link engine.treeView.Position#isBefore is before} start
	 * position of all other ranges (not to confuse with the first range added to the selection).
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {engine.treeView.Range|null}
	 */
	getFirstRange() {
		let first = null;

		for ( let range of this._ranges ) {
			if ( !first || range.start.isBefore( first.start ) ) {
				first = range;
			}
		}

		return first ? Range.createFromRange( first ) : null;
	}

	/**
	 * Returns copy of the last range in the selection. Last range is the one which {@link engine.treeView.Range#end end}
	 * position {@link engine.treeView.Position#isAfter is after} end position of all other ranges (not to confuse
	 * with the last range added to the selection). Returns `null` if no ranges are added to selection.
	 *
	 * @returns {engine.treeView.Range|null}
	 */
	getLastRange() {
		let last = null;

		for ( let range of this._ranges ) {
			if ( !last || range.end.isAfter( last.end ) ) {
				last = range;
			}
		}

		return last ? Range.createFromRange( last ) : null;
	}

	/**
	 * Returns copy of the first position in the selection. First position is the position that
	 * {@link engine.treeView.Position#isBefore is before} any other position in the selection ranges.
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {engine.treeView.Position|null}
	 */
	getFirstPosition() {
		const firstRange = this.getFirstRange();

		return firstRange ? Position.createFromPosition( firstRange.start ) : null;
	}

	/**
	 * Returns copy of the last position in the selection. Last position is the position that
	 * {@link engine.treeView.Position#isAfter is after} any other position in the selection ranges.
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {engine.treeView.Position|null}
	 */
	getLastPosition() {
		const lastRange = this.getLastRange();

		return lastRange ? Position.createFromPosition( lastRange.end ) : null;
	}

	/**
	 * Removes range at given index.
	 *
	 * @fires engine.treeView.Selection#change
	 * @param {Number} index
	 * @returns {engine.treeView.Range|null} Returns removed range or `null` if there is no range under given index.
	 */
	removeRangeAt( index ) {
		const removed = this._ranges.splice( index, 1 );

		if ( removed.length ) {
			this.fire( 'change' );

			return removed[ 0 ];
		}

		return null;
	}

	/**
	 * Removes all ranges that were added to the selection.
	 *
	 * @fires engine.treeView.Selection#change
	 */
	removeAllRanges() {
		if ( this._ranges.length ) {
			this._ranges = [];
			this.fire( 'change' );
		}
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link engine.treeView.Selection#anchor anchor} and
	 * {@link engine.treeView.Selection#focus focus}. Accepts a flag describing in which way the selection is made
	 * (see {@link engine.treeView.Selection#addRange addRange}).
	 *
	 * @fires engine.treeView.Selection#change
	 * @param {Array.<engine.treeView.Range>} newRanges Array of ranges to set.
	 * @param {Boolean} [isLastBackward] Flag describing if last added range was selected forward - from start to end
	 * (`false`) or backward - from end to start (`true`). Defaults to `false`.
	 */
	setRanges( newRanges, isLastBackward ) {
		this._ranges = [];

		for ( let range of newRanges ) {
			this._pushRange( range );
		}

		this._lastRangeBackward = !!isLastBackward;
		this.fire( 'change' );
	}

	/**
	 * Collapses selection to the {@link engine.treeView.Selection#getFirstPosition first position} in stored ranges.
	 * All ranges will be removed beside one collapsed range. Nothing will be changed if there are no ranges stored
	 * inside selection.
	 *
	 * @fires engine.treeView.Selection#change
	 */
	collapseToStart() {
		const startPosition = this.getFirstPosition();

		if ( startPosition !== null ) {
			this.setRanges( [ new Range( startPosition, startPosition ) ] );
			this.fire( 'change' );
		}
	}

	/**
	 * Collapses selection to the {@link engine.treeView.Selection#getLastPosition last position} in stored ranges.
	 * All ranges will be removed beside one collapsed range. Nothing will be changed if there are no ranges stored
	 * inside selection.
	 *
	 * @fires engine.treeView.Selection#change
	 */
	collapseToEnd() {
		const endPosition = this.getLastPosition();

		if ( endPosition !== null ) {
			this.setRanges( [ new Range( endPosition, endPosition ) ] );
			this.fire( 'change' );
		}
	}

	/**
	 * Adds range to selection - creates copy of given range so it can be safely used and modified.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `view-selection-range-intersects` if added range intersects
	 * with ranges already stored in selection instance.
	 *
	 * @private
	 * @param {engine.treeView.Range} range
	 */
	_pushRange( range ) {
		for ( let storedRange of this._ranges ) {
			if ( range.isIntersecting( storedRange ) ) {
				/**
				 * Trying to add a range that intersects with another range from selection.
				 *
				 * @error view-selection-range-intersects
				 * @param {engine.treeView.Range} addedRange Range that was added to the selection.
				 * @param {engine.treeView.Range} intersectingRange Range from selection that intersects with `addedRange`.
				 */
				throw new CKEditorError(
					'view-selection-range-intersects: Trying to add a range that intersects with another range from selection.',
					{ addedRange: range, intersectingRange: storedRange }
				);
			}
		}

		this._ranges.push( Range.createFromRange( range ) );
	}
}

utils.mix( Selection, EmitterMixin );

/**
 * Fired whenever selection ranges are changed through {@link engine.treeView.Selection Selection API}.
 *
 * @event engine.treeView.Selection#change
 */