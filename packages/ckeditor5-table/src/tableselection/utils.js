/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection/utils
 */

import { findAncestor } from '../commands/utils';

/**
 * Clears contents of the passed table cells.
 *
 * This is to be used with table selection
 *
 *		tableSelection.startSelectingFrom( startCell )
 *		tableSelection.setSelectingFrom( endCell )
 *
 *		clearTableCellsContents( editor.model, tableSelection.getSelectedTableCells() );
 *
 * @param {module:engine/model/model~Model} model
 * @param {Iterable.<module:engine/model/element~Element>} tableCells
 */
export function clearTableCellsContents( model, tableCells ) {
	model.change( writer => {
		for ( const tableCell of tableCells ) {
			model.deleteContent( writer.createSelection( tableCell, 'in' ) );
		}
	} );
}

/**
 * Returns all model cells within the provided model selection.
 *
 * @param {Iterable.<module:engine/model/selection~Selection>} selection
 * @param {Boolean} [expandSelection=false] If set to `true` expands the selection to entire cell (if possible).
 * @returns {Array.<module:engine/model/element~Element>}
 */
export function getTableCellsInSelection( selection, expandSelection = false ) {
	const cells = [];

	for ( const range of selection.getRanges() ) {
		const element = range.getContainedElement();

		if ( element && element.is( 'tableCell' ) ) {
			cells.push( element );
		}
	}

	if ( expandSelection ) {
		const cellAncestor = findAncestor( 'tableCell', selection.getFirstPosition() );

		if ( cellAncestor ) {
			cells.push( cellAncestor );
		}
	}

	return cells;
}
