/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/removerowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor, updateNumericAttribute } from './utils';
import { getRowIndexes, getSelectionAffectedTableCells } from '../utils';

/**
 * The remove row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'removeTableRow'` editor command.
 *
 * To remove the row containing the selected cell, execute the command:
 *
 *		editor.execute( 'removeTableRow' );
 *
 * @extends module:core/command~Command
 */
export default class RemoveRowCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const selectedCells = getSelectionAffectedTableCells( this.editor.model.document.selection );
		const firstCell = selectedCells[ 0 ];

		if ( firstCell ) {
			const table = findAncestor( 'table', firstCell );
			const tableRowCount = this.editor.plugins.get( 'TableUtils' ).getRows( table );
			const lastRowIndex = tableRowCount - 1;

			const selectedRowIndexes = getRowIndexes( selectedCells );

			const areAllRowsSelected = selectedRowIndexes.first === 0 && selectedRowIndexes.last === lastRowIndex;

			// Disallow selecting whole table -> delete whole table should be used instead.
			this.isEnabled = !areAllRowsSelected;
		} else {
			this.isEnabled = false;
		}
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const referenceCells = getSelectionAffectedTableCells( model.document.selection );
		const removedRowIndexes = getRowIndexes( referenceCells );

		const firstCell = referenceCells[ 0 ];
		const table = findAncestor( 'table', firstCell );

		const columnIndexToFocus = this.editor.plugins.get( 'TableUtils' ).getCellLocation( firstCell ).column;

		model.change( writer => {
			// This prevents the "model-selection-range-intersects" error, caused by removing row selected cells.
			writer.setSelection( writer.createSelection( table, 'on' ) );

			let cellToFocus;

			for ( let i = removedRowIndexes.last; i >= removedRowIndexes.first; i-- ) {
				const removedRowIndex = i;
				this.editor.plugins.get( 'TableUtils' ).removeRow( removedRowIndex, table, writer );

				cellToFocus = getCellToFocus( table, removedRowIndex, columnIndexToFocus );
			}

			const model = this.editor.model;
			const headingRows = table.getAttribute( 'headingRows' ) || 0;

			if ( headingRows && removedRowIndexes.first < headingRows ) {
				const newRows = getNewHeadingRowsValue( removedRowIndexes, headingRows );

				// Must be done after the changes in table structure (removing rows).
				// Otherwise the downcast converter for headingRows attribute will fail. ckeditor/ckeditor5#6391.
				model.enqueueChange( writer.batch, writer => {
					updateNumericAttribute( 'headingRows', newRows, table, writer, 0 );
				} );
			}

			writer.setSelection( writer.createPositionAt( cellToFocus, 0 ) );
		} );
	}
}

// Returns a cell that should be focused before removing the row, belonging to the same column as the currently focused cell.
// * If the row was not the last one, the cell to focus will be in the row that followed it (before removal).
// * If the row was the last one, the cell to focus will be in the row that preceded it (before removal).
function getCellToFocus( table, removedRowIndex, columnToFocus ) {
	const row = table.getChild( removedRowIndex ) || table.getChild( table.childCount - 1 );

	// Default to first table cell.
	let cellToFocus = row.getChild( 0 );
	let column = 0;

	for ( const tableCell of row.getChildren() ) {
		if ( column > columnToFocus ) {
			return cellToFocus;
		}

		cellToFocus = tableCell;
		column += parseInt( tableCell.getAttribute( 'colspan' ) || 1 );
	}

	return cellToFocus;
}

// Calculates a new heading rows value for removing rows from heading section.
function getNewHeadingRowsValue( removedRowIndexes, headingRows ) {
	if ( removedRowIndexes.last < headingRows ) {
		return headingRows - ( ( removedRowIndexes.last - removedRowIndexes.first ) + 1 );
	}

	return removedRowIndexes.first;
}
