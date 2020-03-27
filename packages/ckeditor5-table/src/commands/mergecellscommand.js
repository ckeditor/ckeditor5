/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/mergecellscommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import TableWalker from '../tablewalker';
import { findAncestor, updateNumericAttribute } from './utils';
import TableUtils from '../tableutils';
import { getRowIndexes, getSelectionAffectedTableCells } from '../utils';

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
		this.isEnabled = canMergeCells( this.editor.model.document.selection, this.editor.plugins.get( TableUtils ) );
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

		const tableUtils = this.editor.plugins.get( TableUtils );

		model.change( writer => {
			const selectedTableCells = getSelectionAffectedTableCells( model.document.selection );

			const firstTableCell = selectedTableCells.shift();

			// This prevents the "model-selection-range-intersects" error, caused by removing row selected cells.
			writer.setSelection( firstTableCell, 'in' );

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

			writer.setSelection( firstTableCell, 'in' );

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
			writer.remove( writer.createRangeIn( cellToExpand ) );
		}

		writer.move( writer.createRangeIn( cellToRemove ), writer.createPositionAt( cellToExpand, 'end' ) );
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

// Check if selection contains mergeable cells.
//
// In a table below:
//
//   +---+---+---+---+
//   | a | b | c | d |
//   +---+---+---+   +
//   | e     | f |   |
//   +       +---+---+
//   |       | g | h |
//   +---+---+---+---+
//
// Valid selections are those which creates a solid rectangle (without gaps), such as:
//   - a, b (two horizontal cells)
//   - c, f (two vertical cells)
//   - a, b, e (cell "e" spans over four cells)
//   - c, d, f (cell d spans over cell in row below)
//
// While invalid selection would be:
//   - a, c (cell "b" not selected creates a gap)
//   - f, g, h (cell "d" spans over a cell from row of "f" cell - thus creates a gap)
//
// @param {module:engine/model/selection~Selection} selection
// @param {module:table/tableUtils~TableUtils} tableUtils
// @returns {boolean}
function canMergeCells( selection, tableUtils ) {
	// Collapsed selection or selection only one range can't contain mergeable table cells.
	if ( selection.isCollapsed || selection.rangeCount < 2 ) {
		return false;
	}

	// All cells must be inside the same table.
	let firstRangeTable;

	for ( const range of selection.getRanges() ) {
		// Selection ranges must be set on whole <tableCell> element.
		if ( range.isCollapsed || !range.isFlat || !range.start.nodeAfter.is( 'tableCell' ) ) {
			return false;
		}

		const parentTable = findAncestor( 'table', range.start );

		if ( !firstRangeTable ) {
			firstRangeTable = parentTable;
		} else if ( firstRangeTable !== parentTable ) {
			return false;
		}
	}

	const selectedTableCells = getSelectionAffectedTableCells( selection );

	if ( !areCellInTheSameTableSection( selectedTableCells, firstRangeTable ) ) {
		return false;
	}

	// At this point selection contains ranges over table cells in the same table.
	// The valid selection is a fully occupied rectangle composed of table cells.
	// Below we calculate area of selected cells and the area of valid selection.
	// The area of valid selection is defined by top-left and bottom-right cells.
	const rows = new Set();
	const columns = new Set();

	let areaOfSelectedCells = 0;

	for ( const tableCell of selectedTableCells ) {
		const { row, column } = tableUtils.getCellLocation( tableCell );
		const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );
		const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );

		// Record row & column indexes of current cell.
		rows.add( row );
		columns.add( column );

		// For cells that spans over multiple rows add also the last row that this cell spans over.
		if ( rowspan > 1 ) {
			rows.add( row + rowspan - 1 );
		}

		// For cells that spans over multiple columns add also the last column that this cell spans over.
		if ( colspan > 1 ) {
			columns.add( column + colspan - 1 );
		}

		areaOfSelectedCells += ( rowspan * colspan );
	}

	// We can only merge table cells that are in adjacent rows...
	const areaOfValidSelection = getBiggestRectangleArea( rows, columns );

	return areaOfValidSelection == areaOfSelectedCells;
}

// Calculates the area of a maximum rectangle that can span over provided row & column indexes.
//
// @param {Array.<Number>} rows
// @param {Array.<Number>} columns
// @returns {Number}
function getBiggestRectangleArea( rows, columns ) {
	const rowsIndexes = Array.from( rows.values() );
	const columnIndexes = Array.from( columns.values() );

	const lastRow = Math.max( ...rowsIndexes );
	const firstRow = Math.min( ...rowsIndexes );
	const lastColumn = Math.max( ...columnIndexes );
	const firstColumn = Math.min( ...columnIndexes );

	return ( lastRow - firstRow + 1 ) * ( lastColumn - firstColumn + 1 );
}

function areCellInTheSameTableSection( tableCells, table ) {
	const rowIndexes = getRowIndexes( tableCells );
	const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );

	const firstCellIsInBody = rowIndexes.first > headingRows - 1;
	const lastCellIsInBody = rowIndexes.last > headingRows - 1;

	return firstCellIsInBody === lastCellIsInBody;
}
