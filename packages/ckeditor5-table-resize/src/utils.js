/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table-resize/utils
 */

/**
 * Returns `true` if the current selection is inside a table or `false` otherwise.
 *
 * @param {module:engine/model/selection~Selection} selection The current selection.
 * @returns {Boolean}
 */
export function isSelectionInTable( selection ) {
	for ( const element of selection.getFirstRange().start.getAncestors() ) {
		if ( element.name === 'table' ) {
			return true;
		}
	}

	return false;
}
