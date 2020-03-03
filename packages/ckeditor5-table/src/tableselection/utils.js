/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection/utils
 */

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
 * **Note**: This function is used also by {@link module:table/tableselection~TableSelection#getSelectionAsFragment}
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
