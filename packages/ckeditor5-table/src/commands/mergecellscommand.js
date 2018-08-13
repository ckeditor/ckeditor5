/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/mergecellscommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import TableWalker from '../tablewalker';
import { updateNumericAttribute } from './utils';
import TableUtils from '../tableutils';
import TableSelection from '../tableselection';

/**
 * The merge cells command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as `'mergeTableCellRight'`, `'mergeTableCellLeft'`,
 * `'mergeTableCellUp'` and `'mergeTableCellDown'` editor commands.
 *
 * To merge a table cell at the current selection with another cell, execute the command corresponding with the preferred direction.
 *
 * For example, to merge with a cell to the right:
 *
 *        editor.execute( 'mergeTableCellRight' );
 *
 * **Note**: If a table cell has a different [`rowspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-rowspan)
 * (for `'mergeTableCellRight'` and `'mergeTableCellLeft'`) or [`colspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-colspan)
 * (for `'mergeTableCellUp'` and `'mergeTableCellDown'`), the command will be disabled.
 *
 * @extends module:core/command~Command
 */
export default class MergeCellsCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const tableSelection = this.editor.plugins.get( TableSelection );

		this.isEnabled = !!tableSelection.size && canMerge( Array.from( tableSelection.getSelection() ) );
	}

	/**
	 * Executes the command.
	 *
	 * Depending on the command's {@link #direction} value, it will merge the cell that is to the `'left'`, `'right'`, `'up'` or `'down'`.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;

		const tableSelection = this.editor.plugins.get( TableSelection );
		const tableUtils = this.editor.plugins.get( TableUtils );

		model.change( writer => {
			const selectedTableCells = [ ... tableSelection.getSelection() ];

			tableSelection.clearSelection();

			const firstTableCell = selectedTableCells.shift();
			const { row, column } = tableUtils.getCellLocation( firstTableCell );

			const colspan = parseInt( firstTableCell.getAttribute( 'colspan' ) || 1 );
			const rowspan = parseInt( firstTableCell.getAttribute( 'rowspan' ) || 1 );

			let rightMax = column + colspan;
			let bottomMax = row + rowspan;

			const rowsToCheck = new Set();

			for ( const tableCell of selectedTableCells ) {
				const { row, column } = tableUtils.getCellLocation( tableCell );

				const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );
				const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );

				if ( column + colspan > rightMax ) {
					rightMax = column + colspan;
				}

				if ( row + rowspan > bottomMax ) {
					bottomMax = row + rowspan;
				}
			}

			for ( const tableCell of selectedTableCells ) {
				rowsToCheck.add( tableCell.parent );
				mergeTableCells( tableCell, firstTableCell, writer );
			}

			// Update table cell span attribute and merge set selection on merged contents.
			updateNumericAttribute( 'colspan', rightMax - column, firstTableCell, writer );
			updateNumericAttribute( 'rowspan', bottomMax - row, firstTableCell, writer );

			writer.setSelection( Range.createIn( firstTableCell ) );

			// Remove empty rows after merging table cells.
			for ( const row of rowsToCheck ) {
				if ( !row.childCount ) {
					removeEmptyRow( row, writer );
				}
			}
		} );
	}
}

// Properly removes empty row from a table. Will update `rowspan` attribute of cells that overlaps removed row.
//
// @param {module:engine/model/element~Element} removedTableCellRow
// @param {module:engine/model/writer~Writer} writer
function removeEmptyRow( removedTableCellRow, writer ) {
	const table = removedTableCellRow.parent;

	const removedRowIndex = table.getChildIndex( removedTableCellRow );

	for ( const { cell, row, rowspan } of new TableWalker( table, { endRow: removedRowIndex } ) ) {
		const overlapsRemovedRow = row + rowspan - 1 >= removedRowIndex;

		if ( overlapsRemovedRow ) {
			updateNumericAttribute( 'rowspan', rowspan - 1, cell, writer );
		}
	}

	writer.remove( removedTableCellRow );
}

// Merges two table cells - will ensure that after merging cells with empty paragraph the result table cell will only have one paragraph.
// If one of the merged table cell is empty the merged table cell will have contents of the non-empty table cell.
// If both are empty the merged table cell will have only one empty paragraph.
//
// @param {module:engine/model/element~Element} cellToRemove
// @param {module:engine/model/element~Element} cellToExpand
// @param {module:engine/model/writer~Writer} writer
function mergeTableCells( cellToRemove, cellToExpand, writer ) {
	if ( !isEmpty( cellToRemove ) ) {
		if ( isEmpty( cellToExpand ) ) {
			writer.remove( Range.createIn( cellToExpand ) );
		}

		writer.move( Range.createIn( cellToRemove ), Position.createAt( cellToExpand, 'end' ) );
	}

	// Remove merged table cell.
	writer.remove( cellToRemove );
}

// Checks if passed table cell contains empty paragraph.
//
// @param {module:engine/model/element~Element} tableCell
// @returns {Boolean}
function isEmpty( tableCell ) {
	return tableCell.childCount == 1 && tableCell.getChild( 0 ).is( 'paragraph' ) && tableCell.getChild( 0 ).isEmpty;
}

function canMerge() {
	return true;
}
