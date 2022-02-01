/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/removerowcommand
 */

import { Command } from 'ckeditor5/src/core';

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
		const tableUtils = this.editor.plugins.get( 'TableUtils' );
		const selectedCells = tableUtils.getSelectionAffectedTableCells( this.editor.model.document.selection );
		const firstCell = selectedCells[ 0 ];

		if ( firstCell ) {
			const table = firstCell.findAncestor( 'table' );
			const tableRowCount = this.editor.plugins.get( 'TableUtils' ).getRows( table );
			const lastRowIndex = tableRowCount - 1;

			const selectedRowIndexes = tableUtils.getRowIndexes( selectedCells );

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
		const tableUtils = this.editor.plugins.get( 'TableUtils' );

		const referenceCells = tableUtils.getSelectionAffectedTableCells( model.document.selection );
		const removedRowIndexes = tableUtils.getRowIndexes( referenceCells );

		const firstCell = referenceCells[ 0 ];
		const table = firstCell.findAncestor( 'table' );

		const columnIndexToFocus = tableUtils.getCellLocation( firstCell ).column;

		model.change( writer => {
			const rowsToRemove = removedRowIndexes.last - removedRowIndexes.first + 1;

			tableUtils.removeRows( table, {
				at: removedRowIndexes.first,
				rows: rowsToRemove
			} );

			const cellToFocus = getCellToFocus( table, removedRowIndexes.first, columnIndexToFocus, tableUtils.getRows( table ) );

			writer.setSelection( writer.createPositionAt( cellToFocus, 0 ) );
		} );
	}
}

// Returns a cell that should be focused before removing the row, belonging to the same column as the currently focused cell.
// * If the row was not the last one, the cell to focus will be in the row that followed it (before removal).
// * If the row was the last one, the cell to focus will be in the row that preceded it (before removal).
function getCellToFocus( table, removedRowIndex, columnToFocus, tableRowCount ) {
	// Don't go beyond last row's index.
	const row = table.getChild( Math.min( removedRowIndex, tableRowCount - 1 ) );

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
