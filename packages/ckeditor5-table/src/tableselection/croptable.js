/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection/croptable
 */

import { createEmptyTableCell, findAncestor, updateNumericAttribute } from '../commands/utils';
import TableWalker from '../tablewalker';
import { getColumnIndexes, getRowIndexes } from '../utils';

/**
 * Returns a cropped table according to given dimensions.

 * To return a cropped table that starts at first row and first column and end in third row and column:
 *
 *		const croppedTable = cropTable( table, 1, 1, 3, 3, tableUtils, writer );
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
 * @param {module:table/tableutils~TableUtils} tableUtils
 * @returns {module:engine/model/element~Element}
 */
export function cropTableToDimensions( sourceTable, cropDimensions, writer, tableUtils ) {
	const { startRow, startColumn, endRow, endColumn } = cropDimensions;

	// Create empty table with empty rows equal to crop height.
	const croppedTable = writer.createElement( 'table' );
	const cropHeight = endRow - startRow + 1;

	for ( let i = 0; i < cropHeight; i++ ) {
		writer.insertElement( 'tableRow', croppedTable, 'end' );
	}

	const tableMap = [ ...new TableWalker( sourceTable, { startRow, endRow, includeSpanned: true } ) ];

	// Iterate over source table slots (including empty - spanned - ones).
	for ( const { row: sourceRow, column: sourceColumn, cell: tableCell, isSpanned } of tableMap ) {
		// Skip slots outside the cropped area.
		// Could use startColumn, endColumn. See: https://github.com/ckeditor/ckeditor5/issues/6785.
		if ( sourceColumn < startColumn || sourceColumn > endColumn ) {
			continue;
		}

		// Row index in cropped table.
		const cropRow = sourceRow - startRow;
		const row = croppedTable.getChild( cropRow );

		// For empty slots: fill the gap with empty table cell.
		if ( isSpanned ) {
			// TODO: Remove table utils usage. See: https://github.com/ckeditor/ckeditor5/issues/6785.
			const { row: anchorRow, column: anchorColumn } = tableUtils.getCellLocation( tableCell );

			// But fill the gap only if the spanning cell is anchored outside cropped area.
			// In the table from method jsdoc those cells are: "c" & "f".
			if ( anchorRow < startRow || anchorColumn < startColumn ) {
				createEmptyTableCell( writer, writer.createPositionAt( row, 'end' ) );
			}
		}
		// Otherwise clone the cell with all children and trim if it exceeds cropped area.
		else {
			const tableCellCopy = tableCell._clone( true );

			writer.append( tableCellCopy, row );

			// Crop end column/row is equal to crop width/height.
			const cropEndColumn = endColumn - startColumn + 1;
			const cropEndRow = cropHeight;

			// Column index in cropped table.
			const cropColumn = sourceColumn - startColumn;

			// Trim table if it exceeds cropped area.
			// In the table from method jsdoc those cells are: "g" & "m".
			trimTableCellIfNeeded( tableCellCopy, cropRow, cropColumn, cropEndColumn, cropEndRow, writer );
		}
	}

	// Adjust heading rows & columns in cropped table if crop selection includes headings parts.
	addHeadingsToCroppedTable( croppedTable, sourceTable, startRow, startColumn, writer );

	return croppedTable;
}

/**
 * Returns a cropped table from the selected table cells.
 *
 * This function is to be used with the table selection.
 *
 *		tableSelection.setCellSelection( startCell, endCell );
 *
 *		const croppedTable = cropTable( tableSelection.getSelectedTableCells(), tableUtils, writer );
 *
 * **Note**: This function is also used by {@link module:table/tableselection~TableSelection#getSelectionAsFragment}.
 *
 * @param {Iterable.<module:engine/model/element~Element>} selectedTableCellsIterator
 * @param {module:table/tableutils~TableUtils} tableUtils
 * @param {module:engine/model/writer~Writer} writer
 * @returns {module:engine/model/element~Element}
 */
export function cropTableToSelection( selectedTableCellsIterator, tableUtils, writer ) {
	const selectedTableCells = Array.from( selectedTableCellsIterator );

	const { first: startColumn, last: endColumn } = getColumnIndexes( selectedTableCells );
	const { first: startRow, last: endRow } = getRowIndexes( selectedTableCells );

	const sourceTable = findAncestor( 'table', selectedTableCells[ 0 ] );

	const cropDimensions = {
		startRow,
		startColumn,
		endRow,
		endColumn
	};

	return cropTableToDimensions( sourceTable, cropDimensions, writer, tableUtils );
}

// Adjusts table cell dimensions to not exceed last row and last column.
function trimTableCellIfNeeded( tableCell, cellRow, cellColumn, lastColumn, lastRow, writer ) {
	const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );
	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );

	if ( cellColumn + colspan > lastColumn ) {
		const trimmedSpan = lastColumn - cellColumn;

		updateNumericAttribute( 'colspan', trimmedSpan, tableCell, writer, 1 );
	}

	if ( cellRow + rowspan > lastRow ) {
		const trimmedSpan = lastRow - cellRow;

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
