/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../../utils/ckeditorerror.js';
import Range from './range.js';

export default class Selection {
	constructor() {
		/**
		 * Stores all ranges that are selected.
		 *
		 * @private
		 * @member {Array.<engine.treeViewRange>} engine.treeView.Selection#_ranges
		 */
		this._ranges = [];
	}

	/**
	 * Adds range to the selection. Passed range is copied and not saved in the Selection instance and you can safely
	 * operate on it.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `view-selection-range-intersects` if added range intersects
	 * with ranges already stored in Selection instance.
	 *
	 * @param {engine.treeView.Range} range
	 */
	addRange( range ) {
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