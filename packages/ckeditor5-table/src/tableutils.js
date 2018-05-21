/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableutils
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

import TableWalker from './tablewalker';
import { getParentTable, updateNumericAttribute } from './commands/utils';

/**
 * The table utils plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableUtils';
	}

	/**
	 * Returns table cell location as in table row and column indexes.
	 *
	 * For instance in a table below:
	 *
	 *		    0   1   2   3
	 *		  +---+---+---+---+
	 *		0 | a     | b | c |
	 *		  +       +   +---+
	 *		1 |       |   | d |
	 *		  +---+---+   +---+
	 *		2 | e     |   | f |
	 *		  +---+---+---+---+
	 *
	 * the method will return:
	 *
	 *		const cellA = table.getNodeByPath( [ 0, 0 ] );
	 *		editor.plugins.get( 'TableUtils' ).getCellLocation( cellA );
	 *		// will return { row: 0, column: 0 }
	 *
	 *		const cellD = table.getNodeByPath( [ 1, 0 ] );
	 *		editor.plugins.get( 'TableUtils' ).getCellLocation( cellD );
	 *		// will return { row: 1, column: 3 }
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @returns {{row, column}}
	 */
	getCellLocation( tableCell ) {
		const tableRow = tableCell.parent;
		const table = tableRow.parent;

		const rowIndex = table.getChildIndex( tableRow );

		const tableWalker = new TableWalker( table, { startRow: rowIndex, endRow: rowIndex } );

		for ( const { cell, row, column } of tableWalker ) {
			if ( cell === tableCell ) {
				return { row, column };
			}
		}
	}

	/**
	 * Creates an empty table at given position.
	 *
	 * @param {module:engine/model/position~Position} position Position at which insert a table.
	 * @param {Number} rows Number of rows to create.
	 * @param {Number} columns Number of columns to create.
	 */
	createTable( position, rows, columns ) {
		const model = this.editor.model;

		model.change( writer => {
			const table = writer.createElement( 'table' );

			writer.insert( table, position );

			createEmptyRows( writer, table, 0, rows, columns );
		} );
	}

	/**
	 * Insert rows into a table.
	 *
	 *     editor.plugins.get( 'TableUtils' ).insertRows( table, { at: 1, rows: 2 } );
	 *
	 * For the table below this code
	 *
	 *		row index
	 *		  0 +---+---+---+                            +---+---+---+ 0
	 *		    | a | b | c |                            | a | b | c |
	 *		  1 +   +---+---+   <-- insert here at=1     +   +---+---+ 1
	 *		    |   | d | e |                            |   |   |   |
	 *		  2 +   +---+---+            should give:    +   +---+---+ 2
	 *		    |   | f | g |                            |   |   |   |
	 *		  3 +---+---+---+                            +   +---+---+ 3
	 *		                                             |   | d | e |
	 *		                                             +---+---+---+ 4
	 *		                                             +   + f | g |
	 *		                                             +---+---+---+ 5
	 *
	 * @param {module:engine/model/element~Element} table Table model element to which insert rows.
	 * @param {Object} options
	 * @param {Number} [options.at=0] Row index at which insert rows.
	 * @param {Number} [options.rows=1] Number of rows to insert.
	 */
	insertRows( table, options = {} ) {
		const model = this.editor.model;

		const insertAt = options.at || 0;
		const rowsToInsert = options.rows || 1;

		model.change( writer => {
			const headingRows = table.getAttribute( 'headingRows' ) || 0;

			// Inserting rows inside heading section requires to update table's headingRows attribute as the heading section will grow.
			if ( headingRows > insertAt ) {
				writer.setAttribute( 'headingRows', headingRows + rowsToInsert, table );
			}

			// Inserting at the end and at the beginning of a table doesn't require to calculate anything special.
			if ( insertAt === 0 || insertAt === table.childCount ) {
				createEmptyRows( writer, table, insertAt, rowsToInsert, this.getColumns( table ) );

				return;
			}

			// Iterate over all rows below inserted rows in order to check for rowspanned cells.
			const tableIterator = new TableWalker( table, { endRow: insertAt } );

			// Will hold number of cells needed to insert in created rows.
			// The number might be different then table cell width when there are rowspanned cells.
			let cellsToInsert = 0;

			for ( const { row, rowspan, colspan, cell } of tableIterator ) {
				const isBeforeInsertedRow = row < insertAt;
				const overlapsInsertedRow = row + rowspan > insertAt;

				if ( isBeforeInsertedRow && overlapsInsertedRow ) {
					// This cell overlaps inserted rows so we need to expand it further.
					writer.setAttribute( 'rowspan', rowspan + rowsToInsert, cell );
				}

				// Calculate how many cells to insert based on the width of cells in a row at insert position.
				// It might be lower then table width as some cells might overlaps inserted row.
				// In the table above the cell 'a' overlaps inserted row so only two empty cells are need to be created.
				if ( row === insertAt ) {
					cellsToInsert += colspan;
				}
			}

			createEmptyRows( writer, table, insertAt, rowsToInsert, cellsToInsert );
		} );
	}

	/**
	 * Inserts columns into a table.
	 *
	 *		editor.plugins.get( 'TableUtils' ).insertColumns( table, { at: 1, columns: 2 } );
	 *
	 * For the table below this code
	 *
	 *		0   1   2   3                     0   1   2   3   4   5
	 *		+---+---+---+                     +---+---+---+---+---+
	 *		| a     | b |                     | a             | b |
	 *		+       +---+                     +               +---+
	 *		|       | c |                     |               | c |
	 *		+---+---+---+      should give:   +---+---+---+---+---+
	 *		| d | e | f |                     | d |   |   | e | f |
	 *		+---+   +---+                     +---+---+---+  +---+
	 *		| g |   | h |                     | g |   |   |   | h |
	 *		+---+---+---+                     +---+---+---+---+---+
	 *		| i         |                     | i                 |
	 *		+---+---+---+                     +---+---+---+---+---+
	 *		    ^________ insert here at=1
	 *
	 * @param {module:engine/model/element~Element} table Table model element to which insert columns.
	 * @param {Object} options
	 * @param {Number} [options.at=0] Column index at which insert columns.
	 * @param {Number} [options.columns=1] Number of columns to insert.
	 */
	insertColumns( table, options = {} ) {
		const model = this.editor.model;

		const insertAt = options.at || 0;
		const columnsToInsert = options.columns || 1;

		model.change( writer => {
			const headingColumns = table.getAttribute( 'headingColumns' );

			// Inserting rows inside heading section requires to update table's headingRows attribute as the heading section will grow.
			if ( insertAt < headingColumns ) {
				writer.setAttribute( 'headingColumns', headingColumns + columnsToInsert, table );
			}

			const tableColumns = this.getColumns( table );

			// Inserting at the end and at the beginning of a table doesn't require to calculate anything special.
			if ( insertAt === 0 || tableColumns === insertAt ) {
				for ( const tableRow of table.getChildren() ) {
					createCells( columnsToInsert, writer, Position.createAt( tableRow, insertAt ? 'end' : 0 ) );
				}

				return;
			}

			const tableWalker = new TableWalker( table, { column: insertAt, includeSpanned: true } );

			for ( const { row, column, cell, colspan, rowspan, cellIndex } of tableWalker ) {
				// When iterating over column the table walker outputs either:
				// - cells at given column index (cell "e" from method docs),
				// - spanned columns (includeSpanned option) (spanned cell from row between cells "g" and "h" - spanned by "e"),
				// - or a cell from the same row which spans over this column (cell "a").

				if ( column !== insertAt ) {
					// If column is different then insertAt it is a cell that spans over an inserted column (cell "a" & "i").
					// For such cells expand them of number of columns inserted.
					writer.setAttribute( 'colspan', colspan + columnsToInsert, cell );

					// The includeSpanned option will output the "empty"/spanned column so skip this row already.
					tableWalker.skipRow( row );

					// This cell will overlap cells in rows below so skip them also (because of includeSpanned option) - (cell "a")
					if ( rowspan > 1 ) {
						for ( let i = row + 1; i < row + rowspan; i++ ) {
							tableWalker.skipRow( i );
						}
					}
				} else {
					// It's either cell at this column index or spanned cell by a rowspanned cell from row above.
					// In table above it's cell "e" and a spanned position from row below (empty cell between cells "g" and "h")
					const insertPosition = Position.createFromParentAndOffset( table.getChild( row ), cellIndex );

					createCells( columnsToInsert, writer, insertPosition );
				}
			}
		} );
	}

	/**
	 * Divides table cell vertically into several ones.
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @param {Number} numberOfCells
	 */
	splitCellVertically( tableCell, numberOfCells = 2 ) {
		const model = this.editor.model;
		const table = getParentTable( tableCell );

		model.change( writer => {
			const tableMap = [ ...new TableWalker( table ) ];
			const cellData = tableMap.find( value => value.cell === tableCell );

			const cellColspan = cellData.colspan;

			const cellsToInsert = numberOfCells - 1;
			const attributes = {};

			if ( cellColspan >= numberOfCells ) {
				// If the colspan is bigger than or equal to required cells to create we don't need to update colspan on
				// cells from the same column. The colspan will be equally divided for newly created cells and a current one.
				const colspanOfInsertedCells = Math.floor( cellColspan / numberOfCells );
				const newColspan = ( cellColspan - colspanOfInsertedCells * numberOfCells ) + colspanOfInsertedCells;

				if ( colspanOfInsertedCells > 1 ) {
					attributes.colspan = colspanOfInsertedCells;
				}

				updateNumericAttribute( 'colspan', newColspan, tableCell, writer );

				const cellRowspan = cellData.rowspan;

				if ( cellRowspan > 1 ) {
					attributes.rowspan = cellRowspan;
				}
			} else {
				const cellColumn = cellData.column;

				const cellsToUpdate = tableMap.filter( ( { cell, colspan, column } ) => {
					const isOnSameColumn = cell !== tableCell && column === cellColumn;
					const spansOverColumn = ( column < cellColumn && column + colspan - 1 >= cellColumn );

					return isOnSameColumn || spansOverColumn;
				} );

				for ( const { cell, colspan } of cellsToUpdate ) {
					writer.setAttribute( 'colspan', colspan + numberOfCells - 1, cell );
				}
			}

			createCells( cellsToInsert, writer, Position.createAfter( tableCell ), attributes );
		} );
	}

	/**
	 * Divides table cell horizontally into several ones.
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @param {Number} numberOfCells
	 */
	splitCellHorizontally( tableCell, numberOfCells = 2 ) {
		const model = this.editor.model;

		const table = getParentTable( tableCell );
		const rowIndex = table.getChildIndex( tableCell.parent );

		const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );
		const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );

		model.change( writer => {
			// First check - the cell spans over multiple rows so before doing anything else just split this cell.
			if ( rowspan > 1 ) {
				let newRowspan;
				let rowspanOfCellsToInsert;

				if ( rowspan < numberOfCells ) {
					// Split cell completely (remove rowspan) - the reminder of cells will be added in the second check.
					newRowspan = 1;
					rowspanOfCellsToInsert = 1;
				} else {
					// Split cell's rowspan evenly. Example: having a cell with rowspan of 7 and splitting it to 3 cells:
					// - distribute spans evenly for needed two cells (2 cells - each with rowspan of 2).
					// - the remaining span goes to current cell (3).
					rowspanOfCellsToInsert = Math.floor( rowspan / numberOfCells );
					const cellsToInsert = numberOfCells - 1;
					newRowspan = rowspan - cellsToInsert * rowspanOfCellsToInsert;
				}

				const tableMap = [ ...new TableWalker( table, {
					startRow: rowIndex,
					endRow: rowIndex + rowspan - 1,
					includeSpanned: true
				} ) ];

				updateNumericAttribute( 'rowspan', newRowspan, tableCell, writer );

				let cellColumn = 0;

				const attributes = {};

				if ( rowspanOfCellsToInsert > 1 ) {
					attributes.rowspan = rowspanOfCellsToInsert;
				}

				if ( colspan > 1 ) {
					attributes.colspan = colspan;
				}

				for ( const { cell, column, row, cellIndex } of tableMap ) {
					if ( cell === tableCell ) {
						cellColumn = column;
					}

					const isAfterSplitCell = row >= rowIndex + newRowspan;
					const isOnSameColumn = column === cellColumn;
					const isInEvenlySplitRow = ( row + rowIndex + newRowspan ) % rowspanOfCellsToInsert === 0;

					if ( isAfterSplitCell && isOnSameColumn && isInEvenlySplitRow ) {
						const position = Position.createFromParentAndOffset( table.getChild( row ), cellIndex );

						writer.insertElement( 'tableCell', attributes, position );
					}
				}
			}

			// Second check - the cell has rowspan of 1 or we need to create more cells the the currently one spans over.
			if ( rowspan < numberOfCells ) {
				// We already split the cell in check one so here we split to the remaining number of cells only.
				const remaingingRowspan = numberOfCells - rowspan;

				// This check is needed since we need to check if there are any cells from previous rows thatn spans over this cell's row.
				const tableMap = [ ...new TableWalker( table, { startRow: 0, endRow: rowIndex } ) ];

				for ( const { cell, rowspan, row } of tableMap ) {
					if ( cell !== tableCell && row + rowspan > rowIndex ) {
						const rowspanToSet = rowspan + remaingingRowspan;

						writer.setAttribute( 'rowspan', rowspanToSet, cell );
					}
				}

				const attributes = {};

				if ( colspan > 1 ) {
					attributes.colspan = colspan;
				}

				createEmptyRows( writer, table, rowIndex + 1, remaingingRowspan, 1, attributes );

				const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );

				if ( headingRows > rowIndex ) {
					updateNumericAttribute( 'headingRows', headingRows + 1, table, writer );
				}
			}
		} );
	}

	/**
	 * Returns number of columns for given table.
	 *
	 *		editor.plugins.get( 'TableUtils' ).getColumns( table );
	 *
	 * @param {module:engine/model/element~Element} table Table to analyze.
	 * @returns {Number}
	 */
	getColumns( table ) {
		// Analyze first row only as all the rows should have the same width.
		const row = table.getChild( 0 );

		return [ ...row.getChildren() ].reduce( ( columns, row ) => {
			const columnWidth = parseInt( row.getAttribute( 'colspan' ) || 1 );

			return columns + columnWidth;
		}, 0 );
	}
}

// Creates empty rows at given index in an existing table.
//
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/element~Element} table
// @param {Number} insertAt Row index of row insertion.
// @param {Number} rows Number of rows to create.
// @param {Number} tableCellToInsert Number of cells to insert in each row.
function createEmptyRows( writer, table, insertAt, rows, tableCellToInsert, attributes = {} ) {
	for ( let i = 0; i < rows; i++ ) {
		const tableRow = writer.createElement( 'tableRow' );

		writer.insert( tableRow, table, insertAt );

		for ( let columnIndex = 0; columnIndex < tableCellToInsert; columnIndex++ ) {
			const cell = writer.createElement( 'tableCell', attributes );

			writer.insert( cell, tableRow, 'end' );
		}
	}
}

// Creates cells at given position.
//
// @param {Number} columns Number of columns to create
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/position~Position} insertPosition
function createCells( cells, writer, insertPosition, attributes = {} ) {
	for ( let i = 0; i < cells; i++ ) {
		writer.insertElement( 'tableCell', attributes, insertPosition );
	}
}
