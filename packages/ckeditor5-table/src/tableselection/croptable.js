/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection/croptable
 */

import { findAncestor } from '../commands/utils';

/**
 * Returns cropped table from selected table cells.
 *
 * This is to be used with table selection
 *
 *		tableSelection.startSelectingFrom( startCell )
 *		tableSelection.setSelectingFrom( endCell )
 *
 *		const croppedTable = cropTable( tableSelection.getSelectedTableCells() );
 *
 * **Note**: This function is used also by {@link module:table/tableselection~TableSelection#getSelectionAsFragment}
 *
 * @param {Iterable.<module:engine/model/element~Element>} selectedTableCellsIterator
 * @param {module:table/tableutils~TableUtils} tableUtils
 * @param {module:engine/model/writer~Writer} writer
 * @returns {module:engine/model/element~Element}
 */
export default function cropTable( selectedTableCellsIterator, tableUtils, writer ) {
	const selectedTableCells = Array.from( selectedTableCellsIterator );
	const startElement = selectedTableCells[ 0 ];
	const endElement = selectedTableCells[ selectedTableCells.length - 1 ];

	const { row: startRow, column: startColumn } = tableUtils.getCellLocation( startElement );

	const tableCopy = makeTableCopy( selectedTableCells, startColumn, writer, tableUtils );

	const { row: endRow, column: endColumn } = tableUtils.getCellLocation( endElement );
	const selectionWidth = endColumn - startColumn + 1;
	const selectionHeight = endRow - startRow + 1;

	trimTable( tableCopy, selectionWidth, selectionHeight, writer, tableUtils );

	const sourceTable = findAncestor( 'table', startElement );
	addHeadingsToTableCopy( tableCopy, sourceTable, startRow, startColumn, writer );

	return tableCopy;
}

// Creates a table copy from a selected table cells.
//
// It fills "gaps" in copied table - ie when cell outside copied range was spanning over selection.
function makeTableCopy( selectedTableCells, startColumn, writer, tableUtils ) {
	const tableCopy = writer.createElement( 'table' );

	const rowToCopyMap = new Map();
	const copyToOriginalColumnMap = new Map();

	for ( const tableCell of selectedTableCells ) {
		const row = findAncestor( 'tableRow', tableCell );

		if ( !rowToCopyMap.has( row ) ) {
			const rowCopy = row._clone();
			writer.append( rowCopy, tableCopy );
			rowToCopyMap.set( row, rowCopy );
		}

		const tableCellCopy = tableCell._clone( true );
		const { column } = tableUtils.getCellLocation( tableCell );

		copyToOriginalColumnMap.set( tableCellCopy, column );

		writer.append( tableCellCopy, rowToCopyMap.get( row ) );
	}

	addMissingTableCells( tableCopy, startColumn, copyToOriginalColumnMap, writer, tableUtils );

	return tableCopy;
}

// Fills gaps for spanned cell from outside the selection range.
function addMissingTableCells( tableCopy, startColumn, copyToOriginalColumnMap, writer, tableUtils ) {
	for ( const row of tableCopy.getChildren() ) {
		for ( const tableCell of Array.from( row.getChildren() ) ) {
			const { column } = tableUtils.getCellLocation( tableCell );

			const originalColumn = copyToOriginalColumnMap.get( tableCell );
			const shiftedColumn = originalColumn - startColumn;

			if ( column !== shiftedColumn ) {
				for ( let i = 0; i < shiftedColumn - column; i++ ) {
					const prepCell = writer.createElement( 'tableCell' );
					writer.insert( prepCell, writer.createPositionBefore( tableCell ) );

					const paragraph = writer.createElement( 'paragraph' );

					writer.insert( paragraph, prepCell, 0 );
					writer.insertText( '', paragraph, 0 );
				}
			}
		}
	}
}

// Trims table to a given dimensions.
function trimTable( table, width, height, writer, tableUtils ) {
	for ( const row of table.getChildren() ) {
		for ( const tableCell of row.getChildren() ) {
			const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );
			const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );

			const { row, column } = tableUtils.getCellLocation( tableCell );

			if ( column + colspan > width ) {
				const newSpan = width - column;

				if ( newSpan > 1 ) {
					writer.setAttribute( 'colspan', newSpan, tableCell );
				} else {
					writer.removeAttribute( 'colspan', tableCell );
				}
			}

			if ( row + rowspan > height ) {
				const newSpan = height - row;

				if ( newSpan > 1 ) {
					writer.setAttribute( 'rowspan', newSpan, tableCell );
				} else {
					writer.removeAttribute( 'rowspan', tableCell );
				}
			}
		}
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
