/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection/croptable
 */

import { createEmptyTableCell, updateNumericAttribute } from '../commands/utils';
import TableWalker from '../tablewalker';

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
