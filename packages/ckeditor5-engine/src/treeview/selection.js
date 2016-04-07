/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../../utils/ckeditorerror.js';
import Range from './range.js';
import Position from './position.js';

/**
 * @memberOf engine.treeModel
 */
export default class Selection {
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
	 * {@link engine.treeView.Selection#focus} they define the direction of selection, which is important
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

		return this._lastRangeBackward ? range.end : range.start;
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

		return this._lastRangeBackward ? range.start : range.end;
	}

	/**
	 * Returns whether the selection is collapsed. Selection is collapsed when all it's ranges are collapsed.
	 *
	 * @type {Boolean}
	 */
	get isCollapsed() {
		for ( let i = 0; i < this._ranges.length; i++ ) {
			if ( !this._ranges[ i ].isCollapsed ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Returns nuber of ranges in selection.
	 *
	 * @returns {Number}
     */
	get rangeCount() {
		return this._ranges.length;
	}

	/**
	 * Adds a range to the selection. Added range is copied. This means that passed range is not saved in the
	 * Selection instance and you can safely operate on it.
	 *
	 * Accepts a flag describing in which way the selection is made - passed range might be selected from
	 * {@link engine.treeView.Range#start} to {@link engine.treeView.Range#end} or from {@link engine.treeView.Range#end}
	 * to {@link engine.treeView.Range#start}. The flag is used to set {@link engine.treeView.Selection#anchor} and
	 * {@link engine.treeView.Selection#focus} properties.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `view-selection-range-intersects` if added range intersects
	 * with ranges already stored in Selection instance.
	 *
	 * @param {engine.treeView.Range} range
	 */
	addRange( range, isBackward ) {
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
		this._lastRangeBackward = !!isBackward;
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
	 * Returns the first range in the selection. First range is the one which {@link engine.treeView.Range#start start}
	 * position {@link engine.treeView.Position#isBefore is before} start position of all other ranges (not to confuse
	 * with the first range added to the selection). Returns `null` if no ranges are added to selection.
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
	 * Returns the first position in the selection. First position is the position that
	 * {@link engine.treeView.Position#isBefore is before} any other position in the selection ranges.
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {engine.treeView.Position|null}
	 */
	getFirstPosition() {
		const firstRange = this.getFirstRange();

		return firstRange ? Position.createFromPosition( this.getFirstRange().start ) : null;
	}

	/**
	 * Removes all ranges that were added to the selection.
	 */
	removeAllRanges() {
		this._ranges = [];
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link #anchor} and {@link #focus}. Accepts a flag
	 * describing in which way the selection is made (see {@link #addRange}).
	 *
	 * @param {Array.<engine.treeView.Range>} newRanges Array of ranges to set.
	 * @param {Boolean} [isLastBackward] Flag describing if last added range was selected forward - from start to end
	 * (`false`) or backward - from end to start (`true`). Defaults to `false`.
	 */
	setRanges( newRanges, isLastBackward ) {
		this.destroy();
		this._ranges = [];

		for ( let range of newRanges ) {
			this.addRange( range );
		}

		this._lastRangeBackward = !!isLastBackward;
	}
}
