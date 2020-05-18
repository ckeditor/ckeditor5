/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/utils
 */

import { isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { createEmptyTableCell, findAncestor, updateNumericAttribute } from './commands/utils';
import TableWalker from './tablewalker';

/**
 * Converts a given {@link module:engine/view/element~Element} to a table widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the table widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
 * @param {String} label The element's label. It will be concatenated with the table `alt` attribute if one is present.
 * @returns {module:engine/view/element~Element}
 */
export function toTableWidget( viewElement, writer ) {
	writer.setCustomProperty( 'table', true, viewElement );

	return toWidget( viewElement, writer, { hasSelectionHandle: true } );
}

/**
 * Checks if a given view element is a table widget.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isTableWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'table' ) && isWidget( viewElement );
}

/**
 * Returns a table widget editing view element if one is selected.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {module:engine/view/element~Element|null}
 */
export function getSelectedTableWidget( selection ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isTableWidget( viewElement ) ) {
		return viewElement;
	}

	return null;
}

/**
 * Returns a table widget editing view element if one is among the selection's ancestors.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {module:engine/view/element~Element|null}
 */
export function getTableWidgetAncestor( selection ) {
	const parentTable = findAncestor( 'table', selection.getFirstPosition() );

	if ( parentTable && isTableWidget( parentTable.parent ) ) {
		return parentTable.parent;
	}

	return null;
}

/**
 * Returns all model table cells that are fully selected (from the outside)
 * within the provided model selection's ranges.
 *
 * To obtain the cells selected from the inside, use
 * {@link module:table/utils~getTableCellsContainingSelection}.
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
 * {@link module:table/utils~getSelectedTableCells}.
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
 * Combines {@link module:table/utils~getTableCellsContainingSelection} and
 * {@link module:table/utils~getSelectedTableCells}.
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
 *   ├       ├───┼───┤
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

// TODO: refactor it to a better, general util.
export function cutCellsHorizontallyAt( table, headingRowsToSet, currentHeadingRows, writer, boundingBox ) {
	const overlappingCells = getHorizontallyOverlappingCells( table, headingRowsToSet, currentHeadingRows );

	let cellsToSplit;

	if ( boundingBox === undefined ) {
		cellsToSplit = overlappingCells;
	} else {
		cellsToSplit = overlappingCells.filter( filterToBoundingBox( boundingBox ) );
	}

	for ( const { cell } of cellsToSplit ) {
		splitHorizontally( cell, headingRowsToSet, writer );
	}
}

// TODO: refactor it to a better, general util.
export function cutCellsVerticallyAt( table, headingColumnsToSet, currentHeadingColumns, writer, boundingBox ) {
	const overlappingCells = getVerticallyOverlappingCells( table, headingColumnsToSet, currentHeadingColumns );

	let cellsToSplit;

	if ( boundingBox === undefined ) {
		cellsToSplit = overlappingCells;
	} else {
		cellsToSplit = overlappingCells.filter( filterToBoundingBox( boundingBox ) );
	}

	for ( const { cell, column } of cellsToSplit ) {
		splitVertically( cell, column, headingColumnsToSet, writer );
	}
}

// TODO: better fit to bounding box to match criteria.. should check also spans because sometimes we need to split them.
function filterToBoundingBox( boundingBox ) {
	const { firstRow, firstColumn, lastRow, lastColumn } = boundingBox;

	return ( { row, column, colspan, rowspan } ) => {
		return ( ( firstRow <= row + rowspan - 1 ) && ( row + rowspan - 1 <= lastRow ) ) &&
			( firstColumn <= column + colspan - 1 && column + colspan - 1 <= lastColumn );
	};
}

// Returns cells that span beyond the new heading section.
//
// @param {module:engine/model/element~Element} table The table to check.
// @param {Number} headingRowsToSet New heading rows attribute.
// @param {Number} currentHeadingRows Current heading rows attribute.
// @returns {Array.<module:engine/model/element~Element>}
function getHorizontallyOverlappingCells( table, headingRowsToSet, currentHeadingRows ) {
	const cellsToSplit = [];

	const startAnalysisRow = headingRowsToSet > currentHeadingRows ? currentHeadingRows : 0;
	// We're analyzing only when headingRowsToSet > 0.
	const endAnalysisRow = headingRowsToSet - 1;

	const tableWalker = new TableWalker( table, { startRow: startAnalysisRow, endRow: endAnalysisRow } );

	for ( const twv of tableWalker ) {
		const { row, rowspan } = twv;

		if ( rowspan > 1 && row + rowspan > headingRowsToSet ) {
			cellsToSplit.push( twv );
		}
	}

	return cellsToSplit;
}

// Splits the table cell horizontally.
//
// @param {module:engine/model/element~Element} tableCell
// @param {Number} headingRows
// @param {module:engine/model/writer~Writer} writer
function splitHorizontally( tableCell, headingRows, writer ) {
	const tableRow = tableCell.parent;
	const table = tableRow.parent;
	const rowIndex = tableRow.index;

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) );
	const newRowspan = headingRows - rowIndex;

	const attributes = {};

	const spanToSet = rowspan - newRowspan;

	if ( spanToSet > 1 ) {
		attributes.rowspan = spanToSet;
	}

	const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );

	if ( colspan > 1 ) {
		attributes.colspan = colspan;
	}

	const startRow = table.getChildIndex( tableRow );
	const endRow = startRow + newRowspan;
	const tableMap = [ ...new TableWalker( table, { startRow, endRow, includeSpanned: true } ) ];

	let columnIndex;

	for ( const { row, column, cell, cellIndex } of tableMap ) {
		if ( cell === tableCell && columnIndex === undefined ) {
			columnIndex = column;
		}

		if ( columnIndex !== undefined && columnIndex === column && row === endRow ) {
			const tableRow = table.getChild( row );
			const tableCellPosition = writer.createPositionAt( tableRow, cellIndex );

			createEmptyTableCell( writer, tableCellPosition, attributes );
		}
	}

	// Update the rowspan attribute after updating table.
	updateNumericAttribute( 'rowspan', newRowspan, tableCell, writer );
}

// Returns cells that span beyond the new heading section.
//
// @param {module:engine/model/element~Element} table The table to check.
// @param {Number} headingColumnsToSet New heading columns attribute.
// @param {Number} currentHeadingColumns Current heading columns attribute.
// @returns {Array.<module:engine/model/element~Element>}
function getVerticallyOverlappingCells( table, headingColumnsToSet, currentHeadingColumns ) {
	const cellsToSplit = [];

	const startAnalysisColumn = headingColumnsToSet > currentHeadingColumns ? currentHeadingColumns : 0;
	// We're analyzing only when headingColumnsToSet > 0.
	const endAnalysisColumn = headingColumnsToSet - 1;

	// todo: end/start column
	const tableWalker = new TableWalker( table );

	for ( const twv of tableWalker ) {
		const { column, colspan } = twv;
		// Skip slots outside the cropped area.
		// Could use startColumn, endColumn. See: https://github.com/ckeditor/ckeditor5/issues/6785.
		if ( startAnalysisColumn > column || column > endAnalysisColumn ) {
			continue;
		}
		if ( colspan > 1 && column + colspan > headingColumnsToSet ) {
			cellsToSplit.push( twv );
		}
	}

	return cellsToSplit;
}

// Splits the table cell vertically.
//
// @param {module:engine/model/element~Element} tableCell
// @param {Number} headingColumns
// @param {module:engine/model/writer~Writer} writer
function splitVertically( tableCell, columnIndex, headingColumns, writer ) {
	const colspan = parseInt( tableCell.getAttribute( 'colspan' ) );
	const newColspan = headingColumns - columnIndex;

	const attributes = {};

	const spanToSet = colspan - newColspan;

	if ( spanToSet > 1 ) {
		attributes.colspan = spanToSet;
	}

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );

	if ( rowspan > 1 ) {
		attributes.rowspan = rowspan;
	}

	createEmptyTableCell( writer, writer.createPositionAfter( tableCell ), attributes );
	// Update the colspan attribute after updating table.
	updateNumericAttribute( 'colspan', newColspan, tableCell, writer );
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
//
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
