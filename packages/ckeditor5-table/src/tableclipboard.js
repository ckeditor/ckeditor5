/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableclipboard
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TableSelection from './tableselection';
import TableWalker from './tablewalker';
import {
	findAncestor
} from './utils/common';
import TableUtils from './tableutils';
import { getColumnIndexes, getRowIndexes, getSelectionAffectedTableCells, isSelectionRectangular } from './utils/selection';
import {
	cropTableToDimensions,
	getHorizontallyOverlappingCells,
	getVerticallyOverlappingCells,
	splitHorizontally,
	splitVertically,
	trimTableCellIfNeeded
} from './utils/structure';

/**
 * This plugin adds support for copying/cutting/pasting fragments of tables.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableClipboard extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableClipboard';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableSelection, TableUtils ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		this.listenTo( viewDocument, 'copy', ( evt, data ) => this._onCopyCut( evt, data ) );
		this.listenTo( viewDocument, 'cut', ( evt, data ) => this._onCopyCut( evt, data ) );
		this.listenTo( editor.model, 'insertContent', ( evt, args ) => this._onInsertContent( evt, ...args ), { priority: 'high' } );
	}

	/**
	 * Copies table content to a clipboard on "copy" & "cut" events.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the handled event.
	 * @param {Object} data Clipboard event data.
	 */
	_onCopyCut( evt, data ) {
		const tableSelection = this.editor.plugins.get( TableSelection );

		if ( !tableSelection.getSelectedTableCells() ) {
			return;
		}

		if ( evt.name == 'cut' && this.editor.isReadOnly ) {
			return;
		}

		data.preventDefault();
		evt.stop();

		const dataController = this.editor.data;
		const viewDocument = this.editor.editing.view.document;

		const content = dataController.toView( tableSelection.getSelectionAsFragment() );

		viewDocument.fire( 'clipboardOutput', {
			dataTransfer: data.dataTransfer,
			content,
			method: evt.name
		} );
	}

	/**
	 * Overrides default {@link module:engine/model/model~Model#insertContent `model.insertContent()`} method to handle pasting table inside
	 * selected table fragment.
	 *
	 * Depending on selected table fragment:
	 * - If a selected table fragment is smaller than paste table it will crop pasted table to match dimensions.
	 * - If dimensions are equal it will replace selected table fragment with a pasted table contents.
	 *
	 * @private
	 * @param evt
	 * @param {module:engine/model/documentfragment~DocumentFragment|module:engine/model/item~Item} content The content to insert.
	 * @param {module:engine/model/selection~Selectable} [selectable=model.document.selection]
	 * The selection into which the content should be inserted. If not provided the current model document selection will be used.
	 */
	_onInsertContent( evt, content, selectable ) {
		if ( selectable && !selectable.is( 'documentSelection' ) ) {
			return;
		}

		const model = this.editor.model;
		const tableUtils = this.editor.plugins.get( TableUtils );

		const selectedTableCells = getSelectionAffectedTableCells( model.document.selection );

		if ( !selectedTableCells.length ) {
			return;
		}

		// We might need to crop table before inserting so reference might change.
		let pastedTable = getTableIfOnlyTableInContent( content );

		if ( !pastedTable ) {
			return;
		}

		// Override default model.insertContent() handling at this point.
		evt.stop();

		model.change( writer => {
			const pastedDimensions = {
				width: tableUtils.getColumns( pastedTable ),
				height: tableUtils.getRows( pastedTable )
			};

			// Prepare the table for pasting.
			const selection = prepareTableForPasting( selectedTableCells, pastedDimensions, writer, tableUtils );

			// Beyond this point we operate on a fixed content table with rectangular selection and proper last row/column values.

			const selectionHeight = selection.lastRow - selection.firstRow + 1;
			const selectionWidth = selection.lastColumn - selection.firstColumn + 1;

			// Crop pasted table if:
			// - Pasted table dimensions exceeds selection area.
			// - Pasted table has broken layout (ie some cells sticks out by the table dimensions established by the first and last row).
			//
			// Note: The table dimensions are established by the width of the first row and the total number of rows.
			// It is possible to programmatically create a table that has rows which would have cells anchored beyond first row width but
			// such table will not be created by other editing solutions.
			const cropDimensions = {
				startRow: 0,
				startColumn: 0,
				endRow: Math.min( selectionHeight, pastedDimensions.height ) - 1,
				endColumn: Math.min( selectionWidth, pastedDimensions.width ) - 1
			};

			pastedTable = cropTableToDimensions( pastedTable, cropDimensions, writer );

			// Content table to which we insert a pasted table.
			const selectedTable = findAncestor( 'table', selectedTableCells[ 0 ] );

			replaceSelectedCellsWithPasted( pastedTable, pastedDimensions, selectedTable, selection, writer );
		} );
	}
}

// Prepares a table for pasting and returns adjusted selection dimensions.
//
// @param {Array.<module:engine/model/element~Element>} selectedTableCells
// @param {Object} pastedDimensions
// @param {Number} pastedDimensions.height
// @param {Number} pastedDimensions.width
// @param {module:engine/model/writer~Writer} writer
// @param {module:table/tableutils~TableUtils} tableUtils
// @returns {Object} selection
// @returns {Number} selection.firstColumn
// @returns {Number} selection.firstRow
// @returns {Number} selection.lastColumn
// @returns {Number} selection.lastRow
function prepareTableForPasting( selectedTableCells, pastedDimensions, writer, tableUtils ) {
	const selectedTable = findAncestor( 'table', selectedTableCells[ 0 ] );

	const columnIndexes = getColumnIndexes( selectedTableCells );
	const rowIndexes = getRowIndexes( selectedTableCells );

	const selection = {
		firstColumn: columnIndexes.first,
		lastColumn: columnIndexes.last,
		firstRow: rowIndexes.first,
		lastRow: rowIndexes.last
	};

	// Single cell selected - expand selection to pasted table dimensions.
	const shouldExpandSelection = selectedTableCells.length === 1;

	if ( shouldExpandSelection ) {
		selection.lastRow += pastedDimensions.height - 1;
		selection.lastColumn += pastedDimensions.width - 1;

		expandTableSize( selectedTable, selection.lastRow + 1, selection.lastColumn + 1, writer, tableUtils );
	}

	// In case of expanding selection we do not reset the selection so in this case we will always try to fix selection
	// like in the case of a non-rectangular area. This might be fixed by re-setting selected cells array but this shortcut is safe.
	if ( shouldExpandSelection || !isSelectionRectangular( selectedTableCells, tableUtils ) ) {
		// For a non-rectangular selection (ie in which some cells sticks out from a virtual selection rectangle) we need to create
		// a table layout that has a rectangular selection. This will split cells so the selection become rectangular.
		// Beyond this point we will operate on fixed content table.
		splitCellsToRectangularSelection( selectedTable, selection, writer );
	}
	// However a selected table fragment might be invalid if examined alone. Ie such table fragment:
	//
	//    +---+---+---+---+
	//  0 | a | b | c | d |
	//    +   +   +---+---+
	//  1 |   | e | f | g |
	//    +   +---+   +---+
	//  2 |   | h |   | i | <- last row, each cell has rowspan = 2,
	//    +   +   +   +   +    so we need to return 3, not 2
	//  3 |   |   |   |   |
	//    +---+---+---+---+
	//
	// is invalid as the cells "h" and "i" have rowspans.
	// This case needs only adjusting the selection dimension as the rest of the algorithm operates on empty slots also.
	else {
		selection.lastRow = adjustLastRowIndex( selectedTable, selection );
		selection.lastColumn = adjustLastColumnIndex( selectedTable, selection );
	}

	return selection;
}

// Replaces the part of selectedTable with pastedTable.
//
// @param {module:engine/model/element~Element} pastedTable
// @param {Object} pastedDimensions
// @param {Number} pastedDimensions.height
// @param {Number} pastedDimensions.width
// @param {module:engine/model/element~Element} selectedTable
// @param {Object} selection
// @param {Number} selection.firstColumn
// @param {Number} selection.firstRow
// @param {Number} selection.lastColumn
// @param {Number} selection.lastRow
// @param {module:engine/model/writer~Writer} writer
function replaceSelectedCellsWithPasted( pastedTable, pastedDimensions, selectedTable, selection, writer ) {
	const { width: pastedWidth, height: pastedHeight } = pastedDimensions;

	// Holds two-dimensional array that is addressed by [ row ][ column ] that stores cells anchored at given location.
	const pastedTableLocationMap = createLocationMap( pastedTable, pastedWidth, pastedHeight );

	const selectedTableMap = [ ...new TableWalker( selectedTable, {
		startRow: selection.firstRow,
		endRow: selection.lastRow,
		startColumn: selection.firstColumn,
		endColumn: selection.lastColumn,
		includeAllSlots: true
	} ) ];

	// Selection must be set to pasted cells (some might be removed or new created).
	const cellsToSelect = [];

	// Store next cell insert position.
	let insertPosition;

	// Content table replace cells algorithm iterates over a selected table fragment and:
	//
	// - Removes existing table cells at current slot (location).
	// - Inserts cell from a pasted table for a matched slots.
	//
	// This ensures proper table geometry after the paste
	for ( const tableSlot of selectedTableMap ) {
		const { row, column, cell, isAnchor } = tableSlot;

		// Save the insert position for current row start.
		if ( column === selection.firstColumn ) {
			insertPosition = tableSlot.getPositionBefore();
		}

		// If the slot is occupied by a cell in a selected table - remove it.
		// The slot of this cell will be either:
		// - Replaced by a pasted table cell.
		// - Spanned by a previously pasted table cell.
		if ( isAnchor ) {
			writer.remove( cell );
		}

		// Map current table slot location to an pasted table slot location.
		const pastedRow = row - selection.firstRow;
		const pastedColumn = column - selection.firstColumn;
		const pastedCell = pastedTableLocationMap[ pastedRow % pastedHeight ][ pastedColumn % pastedWidth ];

		// There is no cell to insert (might be spanned by other cell in a pasted table) - advance to the next content table slot.
		if ( !pastedCell ) {
			continue;
		}

		// Clone cell to insert (to duplicate its attributes and children).
		// Cloning is required to support repeating pasted table content when inserting to a bigger selection.
		const cellToInsert = pastedCell._clone( true );

		// Trim the cell if it's row/col-spans would exceed selection area.
		trimTableCellIfNeeded( cellToInsert, row, column, selection.lastRow, selection.lastColumn, writer );

		writer.insert( cellToInsert, insertPosition );
		cellsToSelect.push( cellToInsert );

		insertPosition = writer.createPositionAfter( cellToInsert );
	}

	writer.setSelection( cellsToSelect.map( cell => writer.createRangeOn( cell ) ) );
}

// Expand table (in place) to expected size.
function expandTableSize( table, expectedHeight, expectedWidth, writer, tableUtils ) {
	const tableWidth = tableUtils.getColumns( table );
	const tableHeight = tableUtils.getRows( table );

	if ( expectedWidth > tableWidth ) {
		tableUtils.insertColumns( table, {
			batch: writer.batch,
			at: tableWidth,
			columns: expectedWidth - tableWidth
		} );
	}

	if ( expectedHeight > tableHeight ) {
		tableUtils.insertRows( table, {
			batch: writer.batch,
			at: tableHeight,
			rows: expectedHeight - tableHeight
		} );
	}
}

function getTableIfOnlyTableInContent( content ) {
	// Table passed directly.
	if ( content.is( 'table' ) ) {
		return content;
	}

	// We do not support mixed content when pasting table into table.
	// See: https://github.com/ckeditor/ckeditor5/issues/6817.
	if ( content.childCount != 1 || !content.getChild( 0 ).is( 'table' ) ) {
		return null;
	}

	return content.getChild( 0 );
}

// Returns two-dimensional array that is addressed by [ row ][ column ] that stores cells anchored at given location.
//
// At given row & column location it might be one of:
//
// * cell - cell from pasted table anchored at this location.
// * null - if no cell is anchored at this location.
//
// For instance, from a table below:
//
//		+----+----+----+----+
//		| 00 | 01 | 02 | 03 |
//		+    +----+----+----+
//		|    | 11      | 13 |
//		+----+         +----+
//		| 20 |         | 23 |
//		+----+----+----+----+
//
// The method will return an array (numbers represents cell element):
//
//	const map = [
//		[ '00', '01', '02', '03' ],
//		[ null, '11', null, '13' ],
//		[ '20', null, null, '23' ]
//	]
//
// This allows for a quick access to table at give row & column. For instance to access table cell "13" from pasted table call:
//
//		const cell = map[ 1 ][ 3 ]
//
function createLocationMap( table, width, height ) {
	// Create height x width (row x column) two-dimensional table to store cells.
	const map = new Array( height ).fill( null )
		.map( () => new Array( width ).fill( null ) );

	for ( const { column, row, cell } of new TableWalker( table ) ) {
		map[ row ][ column ] = cell;
	}

	return map;
}

// Make selected cells rectangular by splitting the cells that stand out from a rectangular selection.
//
// In the table below a selection is shown with "::" and slots with anchor cells are named.
//
// +----+----+----+----+----+                    +----+----+----+----+----+
// | 00 | 01 | 02 | 03      |                    | 00 | 01 | 02 | 03      |
// +    +----+    +----+----+                    |    ::::::::::::::::----+
// |    | 11 |    | 13 | 14 |                    |    ::11 |    | 13:: 14 |    <- first row
// +----+----+    +    +----+                    +----::---|    |   ::----+
// | 20 | 21 |    |    | 24 |   select cells:    | 20 ::21 |    |   :: 24 |
// +----+----+    +----+----+     11 -> 33       +----::---|    |---::----+
// | 30      |    | 33 | 34 |                    | 30 ::   |    | 33:: 34 |    <- last row
// +         +    +----+    +                    |    ::::::::::::::::    +
// |         |    | 43 |    |                    |         |    | 43 |    |
// +----+----+----+----+----+                    +----+----+----+----+----+
//                                                      ^          ^
//                                                     first & last columns
//
// Will update table to:
//
//                       +----+----+----+----+----+
//                       | 00 | 01 | 02 | 03      |
//                       +    +----+----+----+----+
//                       |    | 11 |    | 13 | 14 |
//                       +----+----+    +    +----+
//                       | 20 | 21 |    |    | 24 |
//                       +----+----+    +----+----+
//                       | 30 |    |    | 33 | 34 |
//                       +    +----+----+----+    +
//                       |    |    |    | 43 |    |
//                       +----+----+----+----+----+
//
// In th example above:
// - Cell "02" which have `rowspan = 4` must be trimmed at first and at after last row.
// - Cell "03" which have `rowspan = 2` and `colspan = 2` must be trimmed at first column and after last row.
// - Cells "00", "03" & "30" which cannot be cut by this algorithm as they are outside the trimmed area.
// - Cell "13" cannot be cut as it is inside the trimmed area.
function splitCellsToRectangularSelection( table, dimensions, writer ) {
	const { firstRow, lastRow, firstColumn, lastColumn } = dimensions;

	const rowIndexes = { first: firstRow, last: lastRow };
	const columnIndexes = { first: firstColumn, last: lastColumn };

	// 1. Split cells vertically in two steps as first step might create cells that needs to split again.
	doVerticalSplit( table, firstColumn, rowIndexes, writer );
	doVerticalSplit( table, lastColumn + 1, rowIndexes, writer );

	// 2. Split cells horizontally in two steps as first step might create cells that needs to split again.
	doHorizontalSplit( table, firstRow, columnIndexes, writer );
	doHorizontalSplit( table, lastRow + 1, columnIndexes, writer, firstRow );
}

function doHorizontalSplit( table, splitRow, limitColumns, writer, startRow = 0 ) {
	// If selection starts at first row then no split is needed.
	if ( splitRow < 1 ) {
		return;
	}

	const overlappingCells = getVerticallyOverlappingCells( table, splitRow, startRow );

	// Filter out cells that are not touching insides of the rectangular selection.
	const cellsToSplit = overlappingCells.filter( ( { column, cellWidth } ) => isAffectedBySelection( column, cellWidth, limitColumns ) );

	for ( const { cell } of cellsToSplit ) {
		splitHorizontally( cell, splitRow, writer );
	}
}

function doVerticalSplit( table, splitColumn, limitRows, writer ) {
	// If selection starts at first column then no split is needed.
	if ( splitColumn < 1 ) {
		return;
	}

	const overlappingCells = getHorizontallyOverlappingCells( table, splitColumn );

	// Filter out cells that are not touching insides of the rectangular selection.
	const cellsToSplit = overlappingCells.filter( ( { row, cellHeight } ) => isAffectedBySelection( row, cellHeight, limitRows ) );

	for ( const { cell, column } of cellsToSplit ) {
		splitVertically( cell, column, splitColumn, writer );
	}
}

// Checks if cell at given row (column) is affected by a rectangular selection defined by first/last column (row).
//
// The same check is used for row as for column.
function isAffectedBySelection( index, span, limit ) {
	const endIndex = index + span - 1;
	const { first, last } = limit;

	const isInsideSelection = index >= first && index <= last;
	const overlapsSelectionFromOutside = index < first && endIndex >= first;

	return isInsideSelection || overlapsSelectionFromOutside;
}

// Returns adjusted last row index if selection covers part of a row with empty slots (spanned by other cells).
// The rowIndexes.last is equal to last row index but selection might be bigger.
//
// This happens *only* on rectangular selection so we analyze a case like this:
//
//    +---+---+---+---+
//  0 | a | b | c | d |
//    +   +   +---+---+
//  1 |   | e | f | g |
//    +   +---+   +---+
//  2 |   | h |   | i | <- last row, each cell has rowspan = 2,
//    +   +   +   +   +    so we need to return 3, not 2
//  3 |   |   |   |   |
//    +---+---+---+---+
function adjustLastRowIndex( table, dimensions ) {
	const lastRowMap = Array.from( new TableWalker( table, {
		startColumn: dimensions.firstColumn,
		endColumn: dimensions.lastColumn,
		row: dimensions.lastRow
	} ) );

	const everyCellHasSingleRowspan = lastRowMap.every( ( { cellHeight } ) => cellHeight === 1 );

	// It is a "flat" row, so the last row index is OK.
	if ( everyCellHasSingleRowspan ) {
		return dimensions.lastRow;
	}

	// Otherwise get any cell's rowspan and adjust the last row index.
	const rowspanAdjustment = lastRowMap[ 0 ].cellHeight - 1;
	return dimensions.lastRow + rowspanAdjustment;
}

// Returns adjusted last column index if selection covers part of a column with empty slots (spanned by other cells).
// The columnIndexes.last is equal to last column index but selection might be bigger.
//
// This happens *only* on rectangular selection so we analyze a case like this:
//
//   0   1   2   3
// +---+---+---+---+
// | a             |
// +---+---+---+---+
// | b | c | d     |
// +---+---+---+---+
// | e     | f     |
// +---+---+---+---+
// | g | h         |
// +---+---+---+---+
//           ^
//          last column, each cell has colspan = 2, so we need to return 3, not 2
function adjustLastColumnIndex( table, dimensions ) {
	const lastColumnMap = Array.from( new TableWalker( table, {
		startRow: dimensions.firstRow,
		endRow: dimensions.lastRow,
		column: dimensions.lastColumn
	} ) );

	const everyCellHasSingleColspan = lastColumnMap.every( ( { cellWidth } ) => cellWidth === 1 );

	// It is a "flat" column, so the last column index is OK.
	if ( everyCellHasSingleColspan ) {
		return dimensions.lastColumn;
	}

	// Otherwise get any cell's colspan and adjust the last column index.
	const colspanAdjustment = lastColumnMap[ 0 ].cellWidth - 1;
	return dimensions.lastColumn + colspanAdjustment;
}
