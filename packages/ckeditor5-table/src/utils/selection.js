/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/utils/selection
 */

import TableWalker from '../tablewalker';
import { findAncestor } from './common';

/**
 * Returns all model table cells that are fully selected (from the outside)
 * within the provided model selection's ranges.
 *
 * To obtain the cells selected from the inside, use
 * {@link module:table/utils/selection~getTableCellsContainingSelection}.
 *
 * @param {module:engine/model/selection~Selection} selection
 * @returns {Array.<module:engine/model/element~Element>}
 */
export function getSelectedTableCells( selection ) {
	const cells = [];

	for ( const range of sortRanges( selection.getRanges() ) ) {
		const element = range.getContainedElement();

		if ( element && element.is( 'tableCell' ) ) {
			cells.push( element );
		}
	}

	return cells;
}

/**
 * Returns all model table cells that the provided model selection's ranges
 * {@link module:engine/model/range~Range#start} inside.
 *
 * To obtain the cells selected from the outside, use
 * {@link module:table/utils/selection~getSelectedTableCells}.
 *
 * @param {module:engine/model/selection~Selection} selection
 * @returns {Array.<module:engine/model/element~Element>}
 */
export function getTableCellsContainingSelection( selection ) {
	const cells = [];

	for ( const range of selection.getRanges() ) {
		const cellWithSelection = findAncestor( 'tableCell', range.start );

		if ( cellWithSelection ) {
			cells.push( cellWithSelection );
		}
	}

	return cells;
}

/**
 * Returns all model table cells that are either completely selected
 * by selection ranges or host selection range
 * {@link module:engine/model/range~Range#start start positions} inside them.
 *
 * Combines {@link module:table/utils/selection~getTableCellsContainingSelection} and
 * {@link module:table/utils/selection~getSelectedTableCells}.
 *
 * @param {module:engine/model/selection~Selection} selection
 * @returns {Array.<module:engine/model/element~Element>}
 */
export function getSelectionAffectedTableCells( selection ) {
	const selectedCells = getSelectedTableCells( selection );

	if ( selectedCells.length ) {
		return selectedCells;
	}

	return getTableCellsContainingSelection( selection );
}

/**
 * Returns an object with the `first` and `last` row index contained in the given `tableCells`.
 *
 *		const selectedTableCells = getSelectedTableCells( editor.model.document.selection );
 *
 *		const { first, last } = getRowIndexes( selectedTableCells );
 *
 *		console.log( `Selected rows: ${ first } to ${ last }` );
 *
 * @param {Array.<module:engine/model/element~Element>} tableCells
 * @returns {Object} Returns an object with the `first` and `last` table row indexes.
 */
export function getRowIndexes( tableCells ) {
	const indexes = tableCells.map( cell => cell.parent.index );

	return getFirstLastIndexesObject( indexes );
}

/**
 * Returns an object with the `first` and `last` column index contained in the given `tableCells`.
 *
 *		const selectedTableCells = getSelectedTableCells( editor.model.document.selection );
 *
 *		const { first, last } = getColumnIndexes( selectedTableCells );
 *
 *		console.log( `Selected columns: ${ first } to ${ last }` );
 *
 * @param {Array.<module:engine/model/element~Element>} tableCells
 * @returns {Object} Returns an object with the `first` and `last` table column indexes.
 */
export function getColumnIndexes( tableCells ) {
	const table = findAncestor( 'table', tableCells[ 0 ] );
	const tableMap = [ ...new TableWalker( table ) ];

	const indexes = tableMap
		.filter( entry => tableCells.includes( entry.cell ) )
		.map( entry => entry.column );

	return getFirstLastIndexesObject( indexes );
}

/**
 * Checks if the selection contains cells that do not exceed rectangular selection.
 *
 * In a table below:
 *
 *   ┌───┬───┬───┬───┐
 *   │ a │ b │ c │ d │
 *   ├───┴───┼───┤   │
 *   │ e     │ f │   │
 *   │       ├───┼───┤
 *   │       │ g │ h │
 *   └───────┴───┴───┘
 *
 * Valid selections are these which create a solid rectangle (without gaps), such as:
 *   - a, b (two horizontal cells)
 *   - c, f (two vertical cells)
 *   - a, b, e (cell "e" spans over four cells)
 *   - c, d, f (cell d spans over a cell in the row below)
 *
 * While an invalid selection would be:
 *   - a, c (the unselected cell "b" creates a gap)
 *   - f, g, h (cell "d" spans over a cell from the row of "f" cell - thus creates a gap)
 *
 * @param {Array.<module:engine/model/element~Element>} selectedTableCells
 * @param {module:table/tableutils~TableUtils} tableUtils
 * @returns {Boolean}
 */
export function isSelectionRectangular( selectedTableCells, tableUtils ) {
	if ( selectedTableCells.length < 2 || !areCellInTheSameTableSection( selectedTableCells ) ) {
		return false;
	}

	// A valid selection is a fully occupied rectangle composed of table cells.
	// Below we will calculate the area of a selected table cells and the area of valid selection.
	// The area of a valid selection is defined by top-left and bottom-right cells.
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

// Helper method to get an object with `first` and `last` indexes from an unsorted array of indexes.
function getFirstLastIndexesObject( indexes ) {
	const allIndexesSorted = indexes.sort( ( indexA, indexB ) => indexA - indexB );

	const first = allIndexesSorted[ 0 ];
	const last = allIndexesSorted[ allIndexesSorted.length - 1 ];

	return { first, last };
}

function sortRanges( rangesIterator ) {
	return Array.from( rangesIterator ).sort( compareRangeOrder );
}

function compareRangeOrder( rangeA, rangeB ) {
	// Since table cell ranges are disjoint, it's enough to check their start positions.
	const posA = rangeA.start;
	const posB = rangeB.start;

	// Checking for equal position (returning 0) is not needed because this would be either:
	// a. Intersecting range (not allowed by model)
	// b. Collapsed range on the same position (allowed by model but should not happen).
	return posA.isBefore( posB ) ? -1 : 1;
}

// Calculates the area of a maximum rectangle that can span over the provided row & column indexes.
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

// Checks if the selection does not mix a header (column or row) with other cells.
//
// For instance, in the table below valid selections consist of cells with the same letter only.
// So, a-a (same heading row and column) or d-d (body cells) are valid while c-d or a-b are not.
//
//    header columns
//     ↓   ↓
//   ┌───┬───┬───┬───┐
//   │ a │ a │ b │ b │  ← header row
//   ├───┼───┼───┼───┤
//   │ c │ c │ d │ d │
//   ├───┼───┼───┼───┤
//   │ c │ c │ d │ d │
//   └───┴───┴───┴───┘
function areCellInTheSameTableSection( tableCells ) {
	const table = findAncestor( 'table', tableCells[ 0 ] );

	const rowIndexes = getRowIndexes( tableCells );
	const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );

	// Calculating row indexes is a bit cheaper so if this check fails we can't merge.
	if ( !areIndexesInSameSection( rowIndexes, headingRows ) ) {
		return false;
	}

	const headingColumns = parseInt( table.getAttribute( 'headingColumns' ) || 0 );
	const columnIndexes = getColumnIndexes( tableCells );

	// Similarly cells must be in same column section.
	return areIndexesInSameSection( columnIndexes, headingColumns );
}

// Unified check if table rows/columns indexes are in the same heading/body section.
function areIndexesInSameSection( { first, last }, headingSectionSize ) {
	const firstCellIsInHeading = first < headingSectionSize;
	const lastCellIsInHeading = last < headingSectionSize;

	return firstCellIsInHeading === lastCellIsInHeading;
}
