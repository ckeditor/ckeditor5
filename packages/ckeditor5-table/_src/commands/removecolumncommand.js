/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/removecolumncommand
 */

import { Command } from 'ckeditor5/src/core';

import TableWalker from '../tablewalker';

/**
 * The remove column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'removeTableColumn'` editor command.
 *
 * To remove the column containing the selected cell, execute the command:
 *
 *		editor.execute( 'removeTableColumn' );
 *
 * @extends module:core/command~Command
 */
export default class RemoveColumnCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const tableUtils = this.editor.plugins.get( 'TableUtils' );
		const selectedCells = tableUtils.getSelectionAffectedTableCells( this.editor.model.document.selection );
		const firstCell = selectedCells[ 0 ];

		if ( firstCell ) {
			const table = firstCell.findAncestor( 'table' );
			const tableColumnCount = tableUtils.getColumns( table );

			const { first, last } = tableUtils.getColumnIndexes( selectedCells );

			this.isEnabled = last - first < ( tableColumnCount - 1 );
		} else {
			this.isEnabled = false;
		}
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const tableUtils = this.editor.plugins.get( 'TableUtils' );
		const [ firstCell, lastCell ] = getBoundaryCells( this.editor.model.document.selection, tableUtils );
		const table = firstCell.parent.parent;

		// Cache the table before removing or updating colspans.
		const tableMap = [ ...new TableWalker( table ) ];

		// Store column indexes of removed columns.
		const removedColumnIndexes = {
			first: tableMap.find( value => value.cell === firstCell ).column,
			last: tableMap.find( value => value.cell === lastCell ).column
		};

		const cellToFocus = getCellToFocus( tableMap, firstCell, lastCell, removedColumnIndexes );

		this.editor.model.change( writer => {
			const columnsToRemove = removedColumnIndexes.last - removedColumnIndexes.first + 1;

			this.editor.plugins.get( 'TableUtils' ).removeColumns( table, {
				at: removedColumnIndexes.first,
				columns: columnsToRemove
			} );

			writer.setSelection( writer.createPositionAt( cellToFocus, 0 ) );
		} );
	}
}

// Returns a proper table cell to focus after removing a column.
// - selection is on last table cell it will return previous cell.
function getCellToFocus( tableMap, firstCell, lastCell, removedColumnIndexes ) {
	const colspan = parseInt( lastCell.getAttribute( 'colspan' ) || 1 );

	// If the table cell is spanned over 2+ columns - it will be truncated so the selection should
	// stay in that cell.
	if ( colspan > 1 ) {
		return lastCell;
	}
	// Normally, look for the cell in the same row that precedes the first cell to put selection there ("column on the left").
	// If the deleted column is the first column of the table, there will be no predecessor: use the cell
	// from the column that follows then (also in the same row).
	else if ( firstCell.previousSibling || lastCell.nextSibling ) {
		return lastCell.nextSibling || firstCell.previousSibling;
	}
	// It can happen that table cells have no siblings in a row, for instance, when there are row spans
	// in the table (in the previous row). Then just look for the closest cell that is in a column
	// that will not be removed to put the selection there.
	else {
		// Look for any cell in a column that precedes the first removed column.
		if ( removedColumnIndexes.first ) {
			return tableMap.reverse().find( ( { column } ) => {
				return column < removedColumnIndexes.first;
			} ).cell;
		}
		// If the first removed column is the first column of the table, then
		// look for any cell that is in a column that follows the last removed column.
		else {
			return tableMap.reverse().find( ( { column } ) => {
				return column > removedColumnIndexes.last;
			} ).cell;
		}
	}
}

// Returns helper object returning the first and the last cell contained in given selection, based on DOM order.
function getBoundaryCells( selection, tableUtils ) {
	const referenceCells = tableUtils.getSelectionAffectedTableCells( selection );
	const firstCell = referenceCells[ 0 ];
	const lastCell = referenceCells.pop();

	const returnValue = [ firstCell, lastCell ];

	return firstCell.isBefore( lastCell ) ? returnValue : returnValue.reverse();
}
