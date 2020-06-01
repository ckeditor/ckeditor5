/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/utils/structure
 */

import TableWalker from '../tablewalker';
import { createEmptyTableCell, updateNumericAttribute } from './common';

/**
 * Returns a cropped table according to given dimensions.

 * To return a cropped table that starts at first row and first column and end in third row and column:
 *
 *		const croppedTable = cropTableToDimensions( table, {
 *			startRow: 1,
 *			endRow: 1,
 *			startColumn: 3,
 *			endColumn: 3
 *		}, writer );
 *
 * Calling the code above for the table below:
 *
 *		      0   1   2   3   4                      0   1   2
 *		    ┌───┬───┬───┬───┬───┐
 *		 0  │ a │ b │ c │ d │ e │
 *		    ├───┴───┤   ├───┴───┤                  ┌───┬───┬───┐
 *		 1  │ f     │   │ g     │                  │   │   │ g │  0
 *		    ├───┬───┴───┼───┬───┤   will return:   ├───┴───┼───┤
 *		 2  │ h │ i     │ j │ k │                  │ i     │ j │  1
 *		    ├───┤       ├───┤   │                  │       ├───┤
 *		 3  │ l │       │ m │   │                  │       │ m │  2
 *		    ├───┼───┬───┤   ├───┤                  └───────┴───┘
 *		 4  │ n │ o │ p │   │ q │
 *		    └───┴───┴───┴───┴───┘
 *
 * @param {module:engine/model/element~Element} sourceTable
 * @param {Object} cropDimensions
 * @param {Number} cropDimensions.startRow
 * @param {Number} cropDimensions.startColumn
 * @param {Number} cropDimensions.endRow
 * @param {Number} cropDimensions.endColumn
 * @param {module:engine/model/writer~Writer} writer
 * @returns {module:engine/model/element~Element}
 */
export function cropTableToDimensions( sourceTable, cropDimensions, writer ) {
	const { startRow, startColumn, endRow, endColumn } = cropDimensions;

	// Create empty table with empty rows equal to crop height.
	const croppedTable = writer.createElement( 'table' );
	const cropHeight = endRow - startRow + 1;

	for ( let i = 0; i < cropHeight; i++ ) {
		writer.insertElement( 'tableRow', croppedTable, 'end' );
	}

	const tableMap = [ ...new TableWalker( sourceTable, { startRow, endRow, startColumn, endColumn, includeAllSlots: true } ) ];

	// Iterate over source table slots (including empty - spanned - ones).
	for ( const { row: sourceRow, column: sourceColumn, cell: tableCell, isAnchor, cellAnchorRow, cellAnchorColumn } of tableMap ) {
		// Row index in cropped table.
		const rowInCroppedTable = sourceRow - startRow;
		const row = croppedTable.getChild( rowInCroppedTable );

		// For empty slots: fill the gap with empty table cell.
		if ( !isAnchor ) {
			// But fill the gap only if the spanning cell is anchored outside cropped area.
			// In the table from method jsdoc those cells are: "c" & "f".
			if ( cellAnchorRow < startRow || cellAnchorColumn < startColumn ) {
				createEmptyTableCell( writer, writer.createPositionAt( row, 'end' ) );
			}
		}
		// Otherwise clone the cell with all children and trim if it exceeds cropped area.
		else {
			const tableCellCopy = tableCell._clone( true );

			writer.append( tableCellCopy, row );

			// Trim table if it exceeds cropped area.
			// In the table from method jsdoc those cells are: "g" & "m".
			trimTableCellIfNeeded( tableCellCopy, sourceRow, sourceColumn, endRow, endColumn, writer );
		}
	}

	// Adjust heading rows & columns in cropped table if crop selection includes headings parts.
	addHeadingsToCroppedTable( croppedTable, sourceTable, startRow, startColumn, writer );

	return croppedTable;
}

/**
 * Returns slot info of cells that starts above and overlaps a given row.
 *
 * In a table below, passing `overlapRow = 3`
 *
 *		   ┌───┬───┬───┬───┬───┐
 *		0  │ a │ b │ c │ d │ e │
 *		   │   ├───┼───┼───┼───┤
 *		1  │   │ f │ g │ h │ i │
 *		   ├───┤   ├───┼───┤   │
 *		2  │ j │   │ k │ l │   │
 *		   │   │   │   ├───┼───┤
 *		3  │   │   │   │ m │ n │  <- overlap row to check
 *		   ├───┼───┤   │   ├───│
 *		4  │ o │ p │   │   │ q │
 *		   └───┴───┴───┴───┴───┘
 *
 * will return slot info for cells: "j", "f", "k".
 *
 * @param {module:engine/model/element~Element} table The table to check.
 * @param {Number} overlapRow The index of the row to check.
 * @param {Number} [startRow=0] A row to start analysis. Use it when it is known that the cells above that row will not overlap.
 * @returns {Array.<module:table/tablewalker~TableSlot>}
 */
export function getVerticallyOverlappingCells( table, overlapRow, startRow = 0 ) {
	const cells = [];

	const tableWalker = new TableWalker( table, { startRow, endRow: overlapRow - 1 } );

	for ( const slotInfo of tableWalker ) {
		const { row, cellHeight } = slotInfo;
		const cellEndRow = row + cellHeight - 1;

		if ( row < overlapRow && overlapRow <= cellEndRow ) {
			cells.push( slotInfo );
		}
	}

	return cells;
}

/**
 * Splits the table cell horizontally.
 *
 * @param {module:engine/model/element~Element} tableCell
 * @param {Number} splitRow
 * @param {module:engine/model/writer~Writer} writer
 */
export function splitHorizontally( tableCell, splitRow, writer ) {
	const tableRow = tableCell.parent;
	const table = tableRow.parent;
	const rowIndex = tableRow.index;

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) );
	const newRowspan = splitRow - rowIndex;

	const newCellAttributes = {};
	const newCellRowSpan = rowspan - newRowspan;

	if ( newCellRowSpan > 1 ) {
		newCellAttributes.rowspan = newCellRowSpan;
	}

	const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );

	if ( colspan > 1 ) {
		newCellAttributes.colspan = colspan;
	}

	const startRow = rowIndex;
	const endRow = startRow + newRowspan;
	const tableMap = [ ...new TableWalker( table, { startRow, endRow, includeAllSlots: true } ) ];

	let columnIndex;

	for ( const tableSlot of tableMap ) {
		const { row, column, cell } = tableSlot;

		if ( cell === tableCell && columnIndex === undefined ) {
			columnIndex = column;
		}

		if ( columnIndex !== undefined && columnIndex === column && row === endRow ) {
			createEmptyTableCell( writer, tableSlot.getPositionBefore(), newCellAttributes );
		}
	}

	// Update the rowspan attribute after updating table.
	updateNumericAttribute( 'rowspan', newRowspan, tableCell, writer );
}

/**
 * Returns slot info of cells that starts before and overlaps a given column.
 *
 * In a table below, passing `overlapColumn = 3`
 *
 *		  0   1   2   3   4
 *		┌───────┬───────┬───┐
 *		│ a     │ b     │ c │
 *		│───┬───┴───────┼───┤
 *		│ d │ e         │ f │
 *		├───┼───┬───────┴───┤
 *		│ g │ h │ i         │
 *		├───┼───┼───┬───────┤
 *		│ j │ k │ l │ m     │
 *		├───┼───┴───┼───┬───┤
 *		│ n │ o     │ p │ q │
 *		└───┴───────┴───┴───┘
 *		              ^
 *		              Overlap column to check
 *
 * will return slot info for cells: "b", "e", "i".
 *
 * @param {module:engine/model/element~Element} table The table to check.
 * @param {Number} overlapColumn The index of the column to check.
 * @returns {Array.<module:table/tablewalker~TableSlot>}
 */
export function getHorizontallyOverlappingCells( table, overlapColumn ) {
	const cellsToSplit = [];

	const tableWalker = new TableWalker( table );

	for ( const slotInfo of tableWalker ) {
		const { column, cellWidth } = slotInfo;
		const cellEndColumn = column + cellWidth - 1;

		if ( column < overlapColumn && overlapColumn <= cellEndColumn ) {
			cellsToSplit.push( slotInfo );
		}
	}

	return cellsToSplit;
}

/**
 * Splits the table cell vertically.
 *
 * @param {module:engine/model/element~Element} tableCell
 * @param {Number} columnIndex The table cell column index.
 * @param {Number} splitColumn The index of column to split cell on.
 * @param {module:engine/model/writer~Writer} writer
 */
export function splitVertically( tableCell, columnIndex, splitColumn, writer ) {
	const colspan = parseInt( tableCell.getAttribute( 'colspan' ) );
	const newColspan = splitColumn - columnIndex;

	const newCellAttributes = {};
	const newCellColSpan = colspan - newColspan;

	if ( newCellColSpan > 1 ) {
		newCellAttributes.colspan = newCellColSpan;
	}

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );

	if ( rowspan > 1 ) {
		newCellAttributes.rowspan = rowspan;
	}

	createEmptyTableCell( writer, writer.createPositionAfter( tableCell ), newCellAttributes );
	// Update the colspan attribute after updating table.
	updateNumericAttribute( 'colspan', newColspan, tableCell, writer );
}

/**
 * Adjusts table cell dimensions to not exceed limit row and column.
 *
 * If table cell width (or height) covers a column (or row) that is after a limit column (or row)
 * this method will trim "colspan" (or "rowspan") attribute so the table cell will fit in a defined limits.
 *
 * @param {module:engine/model/element~Element} tableCell
 * @param {Number} cellRow
 * @param {Number} cellColumn
 * @param {Number} limitRow
 * @param {Number} limitColumn
 * @param {module:engine/model/writer~Writer} writer
 */
export function trimTableCellIfNeeded( tableCell, cellRow, cellColumn, limitRow, limitColumn, writer ) {
	const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );
	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );

	const endColumn = cellColumn + colspan - 1;

	if ( endColumn > limitColumn ) {
		const trimmedSpan = limitColumn - cellColumn + 1;

		updateNumericAttribute( 'colspan', trimmedSpan, tableCell, writer, 1 );
	}

	const endRow = cellRow + rowspan - 1;

	if ( endRow > limitRow ) {
		const trimmedSpan = limitRow - cellRow + 1;

		updateNumericAttribute( 'rowspan', trimmedSpan, tableCell, writer, 1 );
	}
}

// Sets proper heading attributes to a cropped table.
function addHeadingsToCroppedTable( croppedTable, sourceTable, startRow, startColumn, writer ) {
	const headingRows = parseInt( sourceTable.getAttribute( 'headingRows' ) || 0 );

	if ( headingRows > 0 ) {
		const headingRowsInCrop = headingRows - startRow;
		updateNumericAttribute( 'headingRows', headingRowsInCrop, croppedTable, writer, 0 );
	}

	const headingColumns = parseInt( sourceTable.getAttribute( 'headingColumns' ) || 0 );

	if ( headingColumns > 0 ) {
		const headingColumnsInCrop = headingColumns - startColumn;
		updateNumericAttribute( 'headingColumns', headingColumnsInCrop, croppedTable, writer, 0 );
	}
}
