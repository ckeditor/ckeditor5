/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/removerowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor } from './utils';
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

		// Use single batch to modify table in steps but in one undo step.
		const batch = model.createBatch();

		model.enqueueChange( batch, writer => {
			// This prevents the "model-selection-range-intersects" error, caused by removing row selected cells.
			writer.setSelection( writer.createSelection( table, 'on' ) );

			const rowsToRemove = removedRowIndexes.last - removedRowIndexes.first + 1;

			this.editor.plugins.get( 'TableUtils' ).removeRows( table, {
				at: removedRowIndexes.first,
				rows: rowsToRemove,
				batch
			} );
		} );

		model.enqueueChange( batch, writer => {
			const cellToFocus = getCellToFocus( table, removedRowIndexes.first, columnIndexToFocus );

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
