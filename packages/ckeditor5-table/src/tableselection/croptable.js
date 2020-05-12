/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection/croptable
 */

import { findAncestor, updateNumericAttribute } from '../commands/utils';
import TableWalker from '../tablewalker';

/**
 * Returns a cropped table according to given dimensions.
 *
 * This function is to be used with the table selection.
 *
 *		const croppedTable = cropTable( table, 1, 1, 3, 3, tableUtils, writer );
 *
 * @param {Number} sourceTable
 * @param {Number} startRow
 * @param {Number} startColumn
 * @param {Number} endRow
 * @param {Number} endColumn
 * @param {module:table/tableutils~TableUtils} tableUtils
 * @param {module:engine/model/writer~Writer} writer
 * @returns {module:engine/model/element~Element}
 */
export function cropTableToDimensions( sourceTable, startRow, startColumn, endRow, endColumn, tableUtils, writer ) {
	const croppedTable = writer.createElement( 'table' );

	// Create needed rows.
	for ( let i = 0; i < endRow - startRow + 1; i++ ) {
		writer.insertElement( 'tableRow', croppedTable, 'end' );
	}

	const tableMap = [ ...new TableWalker( sourceTable, { startRow, endRow, includeSpanned: true } ) ];

	for ( const { row: sourceRow, column: sourceColumn, cell: tableCell, isSpanned } of tableMap ) {
		if ( sourceColumn < startColumn || sourceColumn > endColumn ) {
			continue;
		}

		const insertRow = sourceRow - startRow;
		const insertColumn = sourceColumn - startColumn;

		const row = croppedTable.getChild( insertRow );

		if ( isSpanned ) {
			const { row: anchorRow, column: anchorColumn } = tableUtils.getCellLocation( tableCell );

			if ( anchorRow < startRow || anchorColumn < startColumn ) {
				const tableCell = writer.createElement( 'tableCell' );
				const paragraph = writer.createElement( 'paragraph' );

				writer.insert( paragraph, tableCell, 0 );
				writer.insertText( '', paragraph, 0 );

				writer.append( tableCell, row );
			}
		} else {
			const tableCellCopy = tableCell._clone( true );

			writer.append( tableCellCopy, row );

			trimTableCell( tableCellCopy, tableUtils, writer, insertRow, insertColumn, startRow, startColumn, endRow, endColumn );
		}
	}
	addHeadingsToTableCopy( croppedTable, sourceTable, startRow, startColumn, writer );

	return croppedTable;
}

/**
 * Returns a cropped table from the selected table cells.
 *
 * This function is to be used with the table selection.
 *
 *		tableSelection.startSelectingFrom( startCell )
 *		tableSelection.setSelectingFrom( endCell )
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
	const startElement = selectedTableCells[ 0 ];
	const endElement = selectedTableCells[ selectedTableCells.length - 1 ];

	const { row: startRow, column: startColumn } = tableUtils.getCellLocation( startElement );
	const { row: endRow, column: endColumn } = tableUtils.getCellLocation( endElement );

	const sourceTable = findAncestor( 'table', startElement );

	return cropTableToDimensions( sourceTable, startRow, startColumn, endRow, endColumn, tableUtils, writer );
}

function trimTableCell( tableCell, tableUtils, writer, row, column, startRow, startColumn, endRow, endColumn ) {
	const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );
	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );

	const width = endColumn - startColumn + 1;
	const height = endRow - startRow + 1;

	if ( column + colspan > width ) {
		const newSpan = width - column;

		updateNumericAttribute( 'colspan', newSpan, tableCell, writer, 1 );
	}

	if ( row + rowspan > height ) {
		const newSpan = height - row;

		updateNumericAttribute( 'rowspan', newSpan, tableCell, writer, 1 );
	}
}

// Sets proper heading attributes to copied table.
function addHeadingsToTableCopy( tableCopy, sourceTable, startRow, startColumn, writer ) {
	const headingRows = parseInt( sourceTable.getAttribute( 'headingRows' ) || 0 );

	if ( headingRows > 0 ) {
		const copiedRows = headingRows - startRow;
		writer.setAttribute( 'headingRows', copiedRows, tableCopy );
	}

	const headingColumns = parseInt( sourceTable.getAttribute( 'headingColumns' ) || 0 );

	if ( headingColumns > 0 ) {
		const copiedColumns = headingColumns - startColumn;
		writer.setAttribute( 'headingColumns', copiedColumns, tableCopy );
	}
}
