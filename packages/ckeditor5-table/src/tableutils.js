/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableutils
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TableWalker from './tablewalker';
import { createEmptyTableCell, updateNumericAttribute } from './commands/utils';

/**
 * The table utilities plugin.
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
	 * Returns the table cell location as an object with table row and table column indexes.
	 *
	 * For instance, in the table below:
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
	 * @returns {Object} Returns a `{row, column}` object.
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
	 * Creates an empty table with a proper structure. The table needs to be inserted into the model,
	 * for example, by using the {@link module:engine/model/model~Model#insertContent} function.
	 *
	 *		model.change( ( writer ) => {
	 *			// Create a table of 2 rows and 7 columns:
	 *			const table = tableUtils.createTable( writer, 2, 7);
	 *
	 *			// Insert a table to the model at the best position taking the current selection:
	 *			model.insertContent( table );
	 *		}
	 *
	 * @param {module:engine/model/writer~Writer} writer The model writer.
	 * @param {Number} rows The number of rows to create.
	 * @param {Number} columns The number of columns to create.
	 * @returns {module:engine/model/element~Element} The created table element.
	 */
	createTable( writer, rows, columns ) {
		const table = writer.createElement( 'table' );

		createEmptyRows( writer, table, 0, rows, columns );

		return table;
	}

	/**
	 * Inserts rows into a table.
	 *
	 *		editor.plugins.get( 'TableUtils' ).insertRows( table, { at: 1, rows: 2 } );
	 *
	 * Assuming the table on the left, the above code will transform it to the table on the right:
	 *
	 *		row index
	 *		  0 +---+---+---+       `at` = 1,      +---+---+---+ 0
	 *		    | a | b | c |       `rows` = 2,    | a | b | c |
	 *		  1 +   +---+---+   <-- insert here    +   +---+---+ 1
	 *		    |   | d | e |                      |   |   |   |
	 *		  2 +   +---+---+       will give:     +   +---+---+ 2
	 *		    |   | f | g |                      |   |   |   |
	 *		  3 +---+---+---+                      +   +---+---+ 3
	 *		                                       |   | d | e |
	 *		                                       +   +---+---+ 4
	 *		                                       +   + f | g |
	 *		                                       +---+---+---+ 5
	 *
	 * @param {module:engine/model/element~Element} table The table model element where the rows will be inserted.
	 * @param {Object} options
	 * @param {Number} [options.at=0] The row index at which the rows will be inserted.
	 * @param {Number} [options.rows=1] The number of rows to insert.
	 */
	insertRows( table, options = {} ) {
		const model = this.editor.model;

		const insertAt = options.at || 0;
		const rowsToInsert = options.rows || 1;

		model.change( writer => {
			const headingRows = table.getAttribute( 'headingRows' ) || 0;

			// Inserting rows inside heading section requires to update `headingRows` attribute as the heading section will grow.
			if ( headingRows > insertAt ) {
				writer.setAttribute( 'headingRows', headingRows + rowsToInsert, table );
			}

			// Inserting at the end and at the beginning of a table doesn't require to calculate anything special.
			if ( insertAt === 0 || insertAt === table.childCount ) {
				createEmptyRows( writer, table, insertAt, rowsToInsert, this.getColumns( table ) );

				return;
			}

			// Iterate over all rows above inserted rows in order to check for rowspanned cells.
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
	 * Assuming the table on the left, the above code will transform it to the table on the right:
	 *
	 *		0   1   2   3                   0   1   2   3   4   5
	 *		+---+---+---+                   +---+---+---+---+---+
	 *		| a     | b |                   | a             | b |
	 *		+       +---+                   +               +---+
	 *		|       | c |                   |               | c |
	 *		+---+---+---+     will give:    +---+---+---+---+---+
	 *		| d | e | f |                   | d |   |   | e | f |
	 *		+---+   +---+                   +---+---+---+   +---+
	 *		| g |   | h |                   | g |   |   |   | h |
	 *		+---+---+---+                   +---+---+---+---+---+
	 *		| i         |                   | i                 |
	 *		+---+---+---+                   +---+---+---+---+---+
	 *		    ^---- insert here, `at` = 1, `columns` = 2
	 *
	 * @param {module:engine/model/element~Element} table The table model element where the columns will be inserted.
	 * @param {Object} options
	 * @param {Number} [options.at=0] The column index at which the columns will be inserted.
	 * @param {Number} [options.columns=1] The number of columns to insert.
	 */
	insertColumns( table, options = {} ) {
		const model = this.editor.model;

		const insertAt = options.at || 0;
		const columnsToInsert = options.columns || 1;

		model.change( writer => {
			const headingColumns = table.getAttribute( 'headingColumns' );

			// Inserting columns inside heading section requires to update `headingColumns` attribute as the heading section will grow.
			if ( insertAt < headingColumns ) {
				writer.setAttribute( 'headingColumns', headingColumns + columnsToInsert, table );
			}

			const tableColumns = this.getColumns( table );

			// Inserting at the end and at the beginning of a table doesn't require to calculate anything special.
			if ( insertAt === 0 || tableColumns === insertAt ) {
				for ( const tableRow of table.getChildren() ) {
					createCells( columnsToInsert, writer, writer.createPositionAt( tableRow, insertAt ? 'end' : 0 ) );
				}

				return;
			}

			const tableWalker = new TableWalker( table, { column: insertAt, includeSpanned: true } );

			for ( const { row, cell, cellIndex } of tableWalker ) {
				// When iterating over column the table walker outputs either:
				// - cells at given column index (cell "e" from method docs),
				// - spanned columns (spanned cell from row between cells "g" and "h" - spanned by "e", only if `includeSpanned: true`),
				// - or a cell from the same row which spans over this column (cell "a").

				const rowspan = parseInt( cell.getAttribute( 'rowspan' ) || 1 );
				const colspan = parseInt( cell.getAttribute( 'colspan' ) || 1 );

				if ( cellIndex !== insertAt && colspan > 1 ) {
					// If column is different than `insertAt`, it is a cell that spans over an inserted column (cell "a" & "i").
					// For such cells expand them by a number of columns inserted.
					writer.setAttribute( 'colspan', colspan + columnsToInsert, cell );

					// The `includeSpanned` option will output the "empty"/spanned column so skip this row already.
					tableWalker.skipRow( row );

					// This cell will overlap cells in rows below so skip them also (because of `includeSpanned` option) - (cell "a")
					if ( rowspan > 1 ) {
						for ( let i = row + 1; i < row + rowspan; i++ ) {
							tableWalker.skipRow( i );
						}
					}
				} else {
					// It's either cell at this column index or spanned cell by a rowspanned cell from row above.
					// In table above it's cell "e" and a spanned position from row below (empty cell between cells "g" and "h")
					const insertPosition = writer.createPositionAt( table.getChild( row ), cellIndex );

					createCells( columnsToInsert, writer, insertPosition );
				}
			}
		} );
	}

	/**
	 * Removes rows from the given `table`.
	 *
	 * This method re-calculates the table geometry including `rowspan` attribute of table cells overlapping removed rows
	 * and table headings values.
	 *
	 *		editor.plugins.get( 'TableUtils' ).removeRows( table, { at: 1, rows: 2 } );
	 *
	 * Executing the above code in the context of the table on the left will transform its structure as presented on the right:
	 *
	 *		row index
	 *		    ┌───┬───┬───┐        `at` = 1        ┌───┬───┬───┐
	 *		  0 │ a │ b │ c │        `rows` = 2      │ a │ b │ c │ 0
	 *		    │   ├───┼───┤                        │   ├───┼───┤
	 *		  1 │   │ d │ e │  <-- remove from here  │   │ d │ g │ 1
	 *		    │   │   ├───┤        will give:      ├───┼───┼───┤
	 *		  2 │   │   │ f │                        │ h │ i │ j │ 2
	 *		    │   │   ├───┤                        └───┴───┴───┘
	 *		  3 │   │   │ g │
	 *		    ├───┼───┼───┤
	 *		  4 │ h │ i │ j │
	 *		    └───┴───┴───┘
	 *
	 * @param {module:engine/model/element~Element} table
	 * @param {Object} options
	 * @param {Number} options.at The row index at which the removing rows will start.
	 * @param {Number} [options.rows=1] The number of rows to remove.
	 */
	removeRows( table, options ) {
		const model = this.editor.model;

		const rowsToRemove = options.rows || 1;
		const first = options.at;
		const last = first + rowsToRemove - 1;

		// Removing rows from table requires most calculations to be done prior to changing table structure.

		// 1. Preparation - get row-spanned cells that have to be modified after removing rows.
		const { cellsToMove, cellsToTrim } = getCellsToMoveAndTrimOnRemoveRow( table, first, last );

		// 2. Execution
		model.change( writer => {
			// 2a. Move cells from removed rows that extends over a removed section - must be done before removing rows.
			// This will fill any gaps in a rows below that previously were empty because of row-spanned cells.
			const rowAfterRemovedSection = last + 1;
			moveCellsToRow( table, rowAfterRemovedSection, cellsToMove, writer );

			// 2b. Remove all required rows.
			for ( let i = last; i >= first; i-- ) {
				writer.remove( table.getChild( i ) );
			}

			// 2c. Update cells from rows above that overlap removed section. Similar to step 2 but does not involve moving cells.
			for ( const { rowspan, cell } of cellsToTrim ) {
				updateNumericAttribute( 'rowspan', rowspan, cell, writer );
			}

			// 2d. Adjust heading rows if removed rows were in a heading section.
			updateHeadingRows( table, first, last, model, writer.batch );
		} );
	}

	/**
	 * Removes columns from the given `table`.
	 *
	 * This method re-calculates the table geometry including the `colspan` attribute of table cells overlapping removed columns
	 * and table headings values.
	 *
	 *		editor.plugins.get( 'TableUtils' ).removeColumns( table, { at: 1, columns: 2 } );
	 *
	 * Executing the above code in the context of the table on the left will transform its structure as presented on the right:
	 *
	 *		  0   1   2   3   4                       0   1   2
	 *		┌───────────────┬───┐                   ┌───────┬───┐
	 *		│ a             │ b │                   │ a     │ b │
	 *		│               ├───┤                   │       ├───┤
	 *		│               │ c │                   │       │ c │
	 *		├───┬───┬───┬───┼───┤     will give:    ├───┬───┼───┤
	 *		│ d │ e │ f │ g │ h │                   │ d │ g │ h │
	 *		├───┼───┼───┤   ├───┤                   ├───┤   ├───┤
	 *		│ i │ j │ k │   │ l │                   │ i │   │ l │
	 *		├───┴───┴───┴───┴───┤                   ├───┴───┴───┤
	 *		│ m                 │                   │ m         │
	 *		└───────────────────┘                   └───────────┘
	 *		      ^---- remove from here, `at` = 1, `columns` = 2
	 *
	 * @param {module:engine/model/element~Element} table
	 * @param {Object} options
	 * @param {Number} options.at The row index at which the removing columns will start.
	 * @param {Number} [options.columns=1] The number of columns to remove.
	 */
	removeColumns( table, options ) {
		const model = this.editor.model;
		const first = options.at;
		const columnsToRemove = options.columns || 1;
		const last = options.at + columnsToRemove - 1;

		model.change( writer => {
			adjustHeadingColumns( table, { first, last }, writer );

			for ( let removedColumnIndex = last; removedColumnIndex >= first; removedColumnIndex-- ) {
				for ( const { cell, column, colspan } of [ ...new TableWalker( table ) ] ) {
					// If colspaned cell overlaps removed column decrease its span.
					if ( column <= removedColumnIndex && colspan > 1 && column + colspan > removedColumnIndex ) {
						updateNumericAttribute( 'colspan', colspan - 1, cell, writer );
					} else if ( column === removedColumnIndex ) {
						const cellRow = cell.parent;

						// The cell in removed column has colspan of 1.
						writer.remove( cell );

						// If the cell was the last one in the row, get rid of the entire row.
						// https://github.com/ckeditor/ckeditor5/issues/6429
						if ( !cellRow.childCount ) {
							this.removeRows( table, { at: cellRow.index } );
						}
					}
				}
			}
		} );
	}

	/**
	 * Divides a table cell vertically into several ones.
	 *
	 * The cell will be visually split into more cells by updating colspans of other cells in a column
	 * and inserting cells (columns) after that cell.
	 *
	 * In the table below, if cell "a" is split into 3 cells:
	 *
	 *		+---+---+---+
	 *		| a | b | c |
	 *		+---+---+---+
	 *		| d | e | f |
	 *		+---+---+---+
	 *
	 * it will result in the table below:
	 *
	 *		+---+---+---+---+---+
	 *		| a |   |   | b | c |
	 *		+---+---+---+---+---+
	 *		| d         | e | f |
	 *		+---+---+---+---+---+
	 *
	 * So cell "d" will get its `colspan` updated to `3` and 2 cells will be added (2 columns will be created).
	 *
	 * Splitting a cell that already has a `colspan` attribute set will distribute the cell `colspan` evenly and the remainder
	 * will be left to the original cell:
	 *
	 *		+---+---+---+
	 *		| a         |
	 *		+---+---+---+
	 *		| b | c | d |
	 *		+---+---+---+
	 *
	 * Splitting cell "a" with `colspan=3` into 2 cells will create 1 cell with a `colspan=a` and cell "a" that will have `colspan=2`:
	 *
	 *		+---+---+---+
	 *		| a     |   |
	 *		+---+---+---+
	 *		| b | c | d |
	 *		+---+---+---+
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @param {Number} numberOfCells
	 */
	splitCellVertically( tableCell, numberOfCells = 2 ) {
		const model = this.editor.model;
		const tableRow = tableCell.parent;
		const table = tableRow.parent;

		const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );
		const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );

		model.change( writer => {
			// First check - the cell spans over multiple rows so before doing anything else just split this cell.
			if ( colspan > 1 ) {
				// Get spans of new (inserted) cells and span to update of split cell.
				const { newCellsSpan, updatedSpan } = breakSpanEvenly( colspan, numberOfCells );

				updateNumericAttribute( 'colspan', updatedSpan, tableCell, writer );

				// Each inserted cell will have the same attributes:
				const newCellsAttributes = {};

				// Do not store default value in the model.
				if ( newCellsSpan > 1 ) {
					newCellsAttributes.colspan = newCellsSpan;
				}

				// Copy rowspan of split cell.
				if ( rowspan > 1 ) {
					newCellsAttributes.rowspan = rowspan;
				}

				const cellsToInsert = colspan > numberOfCells ? numberOfCells - 1 : colspan - 1;
				createCells( cellsToInsert, writer, writer.createPositionAfter( tableCell ), newCellsAttributes );
			}

			// Second check - the cell has colspan of 1 or we need to create more cells then the currently one spans over.
			if ( colspan < numberOfCells ) {
				const cellsToInsert = numberOfCells - colspan;

				// First step: expand cells on the same column as split cell.
				const tableMap = [ ...new TableWalker( table ) ];

				// Get the column index of split cell.
				const { column: splitCellColumn } = tableMap.find( ( { cell } ) => cell === tableCell );

				// Find cells which needs to be expanded vertically - those on the same column or those that spans over split cell's column.
				const cellsToUpdate = tableMap.filter( ( { cell, colspan, column } ) => {
					const isOnSameColumn = cell !== tableCell && column === splitCellColumn;
					const spansOverColumn = ( column < splitCellColumn && column + colspan > splitCellColumn );

					return isOnSameColumn || spansOverColumn;
				} );

				// Expand cells vertically.
				for ( const { cell, colspan } of cellsToUpdate ) {
					writer.setAttribute( 'colspan', colspan + cellsToInsert, cell );
				}

				// Second step: create columns after split cell.

				// Each inserted cell will have the same attributes:
				const newCellsAttributes = {};

				// Do not store default value in the model.

				// Copy rowspan of split cell.
				if ( rowspan > 1 ) {
					newCellsAttributes.rowspan = rowspan;
				}

				createCells( cellsToInsert, writer, writer.createPositionAfter( tableCell ), newCellsAttributes );

				const headingColumns = table.getAttribute( 'headingColumns' ) || 0;

				// Update heading section if split cell is in heading section.
				if ( headingColumns > splitCellColumn ) {
					updateNumericAttribute( 'headingColumns', headingColumns + cellsToInsert, table, writer );
				}
			}
		} );
	}

	/**
	 * Divides a table cell horizontally into several ones.
	 *
	 * The cell will be visually split into more cells by updating rowspans of other cells in the row and inserting rows with a single cell
	 * below.
	 *
	 * If in the table below cell "b" is split into 3 cells:
	 *
	 *		+---+---+---+
	 *		| a | b | c |
	 *		+---+---+---+
	 *		| d | e | f |
	 *		+---+---+---+
	 *
	 * It will result in the table below:
	 *
	 *		+---+---+---+
	 *		| a | b | c |
	 *		+   +---+   +
	 *		|   |   |   |
	 *		+   +---+   +
	 *		|   |   |   |
	 *		+---+---+---+
	 *		| d | e | f |
	 *		+---+---+---+
	 *
	 * So cells "a" and "b" will get their `rowspan` updated to `3` and 2 rows with a single cell will be added.
	 *
	 * Splitting a cell that already has a `rowspan` attribute set will distribute the cell `rowspan` evenly and the remainder
	 * will be left to the original cell:
	 *
	 *		+---+---+---+
	 *		| a | b | c |
	 *		+   +---+---+
	 *		|   | d | e |
	 *		+   +---+---+
	 *		|   | f | g |
	 *		+   +---+---+
	 *		|   | h | i |
	 *		+---+---+---+
	 *
	 * Splitting cell "a" with `rowspan=4` into 3 cells will create 2 cells with a `rowspan=1` and cell "a" will have `rowspan=2`:
	 *
	 *		+---+---+---+
	 *		| a | b | c |
	 *		+   +---+---+
	 *		|   | d | e |
	 *		+---+---+---+
	 *		|   | f | g |
	 *		+---+---+---+
	 *		|   | h | i |
	 *		+---+---+---+
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @param {Number} numberOfCells
	 */
	splitCellHorizontally( tableCell, numberOfCells = 2 ) {
		const model = this.editor.model;

		const tableRow = tableCell.parent;
		const table = tableRow.parent;
		const splitCellRow = table.getChildIndex( tableRow );

		const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) || 1 );
		const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );

		model.change( writer => {
			// First check - the cell spans over multiple rows so before doing anything else just split this cell.
			if ( rowspan > 1 ) {
				// Cache table map before updating table.
				const tableMap = [ ...new TableWalker( table, {
					startRow: splitCellRow,
					endRow: splitCellRow + rowspan - 1,
					includeSpanned: true
				} ) ];

				// Get spans of new (inserted) cells and span to update of split cell.
				const { newCellsSpan, updatedSpan } = breakSpanEvenly( rowspan, numberOfCells );

				updateNumericAttribute( 'rowspan', updatedSpan, tableCell, writer );

				const { column: cellColumn } = tableMap.find( ( { cell } ) => cell === tableCell );

				// Each inserted cell will have the same attributes:
				const newCellsAttributes = {};

				// Do not store default value in the model.
				if ( newCellsSpan > 1 ) {
					newCellsAttributes.rowspan = newCellsSpan;
				}

				// Copy colspan of split cell.
				if ( colspan > 1 ) {
					newCellsAttributes.colspan = colspan;
				}

				for ( const { column, row, cellIndex } of tableMap ) {
					// As both newly created cells and the split cell might have rowspan,
					// the insertion of new cells must go to appropriate rows:
					//
					// 1. It's a row after split cell + it's height.
					const isAfterSplitCell = row >= splitCellRow + updatedSpan;
					// 2. Is on the same column.
					const isOnSameColumn = column === cellColumn;
					// 3. And it's row index is after previous cell height.
					const isInEvenlySplitRow = ( row + splitCellRow + updatedSpan ) % newCellsSpan === 0;

					if ( isAfterSplitCell && isOnSameColumn && isInEvenlySplitRow ) {
						const position = writer.createPositionAt( table.getChild( row ), cellIndex );

						createCells( 1, writer, position, newCellsAttributes );
					}
				}
			}

			// Second check - the cell has rowspan of 1 or we need to create more cells than the current cell spans over.
			if ( rowspan < numberOfCells ) {
				// We already split the cell in check one so here we split to the remaining number of cells only.
				const cellsToInsert = numberOfCells - rowspan;

				// This check is needed since we need to check if there are any cells from previous rows than spans over this cell's row.
				const tableMap = [ ...new TableWalker( table, { startRow: 0, endRow: splitCellRow } ) ];

				// First step: expand cells.
				for ( const { cell, rowspan, row } of tableMap ) {
					// Expand rowspan of cells that are either:
					// - on the same row as current cell,
					// - or are below split cell row and overlaps that row.
					if ( cell !== tableCell && row + rowspan > splitCellRow ) {
						const rowspanToSet = rowspan + cellsToInsert;

						writer.setAttribute( 'rowspan', rowspanToSet, cell );
					}
				}

				// Second step: create rows with single cell below split cell.
				const newCellsAttributes = {};

				// Copy colspan of split cell.
				if ( colspan > 1 ) {
					newCellsAttributes.colspan = colspan;
				}

				createEmptyRows( writer, table, splitCellRow + 1, cellsToInsert, 1, newCellsAttributes );

				// Update heading section if split cell is in heading section.
				const headingRows = table.getAttribute( 'headingRows' ) || 0;

				if ( headingRows > splitCellRow ) {
					updateNumericAttribute( 'headingRows', headingRows + cellsToInsert, table, writer );
				}
			}
		} );
	}

	/**
	 * Returns the number of columns for a given table.
	 *
	 *		editor.plugins.get( 'TableUtils' ).getColumns( table );
	 *
	 * @param {module:engine/model/element~Element} table The table to analyze.
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

	/**
	 * Returns the number of rows for a given table.
	 *
	 *		editor.plugins.get( 'TableUtils' ).getRows( table );
	 *
	 * @param {module:engine/model/element~Element} table The table to analyze.
	 * @returns {Number}
	 */
	getRows( table ) {
		// Simple row counting, not including rowspan due to #6427.
		return table.childCount;
	}
}

// Creates empty rows at the given index in an existing table.
//
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/element~Element} table
// @param {Number} insertAt The row index of row insertion.
// @param {Number} rows The number of rows to create.
// @param {Number} tableCellToInsert The number of cells to insert in each row.
function createEmptyRows( writer, table, insertAt, rows, tableCellToInsert, attributes = {} ) {
	for ( let i = 0; i < rows; i++ ) {
		const tableRow = writer.createElement( 'tableRow' );

		writer.insert( tableRow, table, insertAt );

		createCells( tableCellToInsert, writer, writer.createPositionAt( tableRow, 'end' ), attributes );
	}
}

// Creates cells at a given position.
//
// @param {Number} columns The number of columns to create
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/position~Position} insertPosition
function createCells( cells, writer, insertPosition, attributes = {} ) {
	for ( let i = 0; i < cells; i++ ) {
		createEmptyTableCell( writer, insertPosition, attributes );
	}
}

// Evenly distributes the span of a cell to a number of provided cells.
// The resulting spans will always be integer values.
//
// For instance breaking a span of 7 into 3 cells will return:
//
//		{ newCellsSpan: 2, updatedSpan: 3 }
//
// as two cells will have a span of 2 and the remainder will go the first cell so its span will change to 3.
//
// @param {Number} span The span value do break.
// @param {Number} numberOfCells The number of resulting spans.
// @returns {{newCellsSpan: Number, updatedSpan: Number}}
function breakSpanEvenly( span, numberOfCells ) {
	if ( span < numberOfCells ) {
		return { newCellsSpan: 1, updatedSpan: 1 };
	}

	const newCellsSpan = Math.floor( span / numberOfCells );
	const updatedSpan = ( span - newCellsSpan * numberOfCells ) + newCellsSpan;

	return { newCellsSpan, updatedSpan };
}

// Updates heading columns attribute if removing a row from head section.
function adjustHeadingColumns( table, removedColumnIndexes, writer ) {
	const headingColumns = table.getAttribute( 'headingColumns' ) || 0;

	if ( headingColumns && removedColumnIndexes.first < headingColumns ) {
		const headingsRemoved = Math.min( headingColumns - 1 /* Other numbers are 0-based */, removedColumnIndexes.last ) -
			removedColumnIndexes.first + 1;

		writer.setAttribute( 'headingColumns', headingColumns - headingsRemoved, table );
	}
}

// Calculates a new heading rows value for removing rows from heading section.
function updateHeadingRows( table, first, last, model, batch ) {
	const headingRows = table.getAttribute( 'headingRows' ) || 0;

	if ( first < headingRows ) {
		const newRows = last < headingRows ? headingRows - ( last - first + 1 ) : first;

		// Must be done after the changes in table structure (removing rows).
		// Otherwise the downcast converter for headingRows attribute will fail. ckeditor/ckeditor5#6391.
		model.enqueueChange( batch, writer => {
			updateNumericAttribute( 'headingRows', newRows, table, writer, 0 );
		} );
	}
}

// Finds cells that will be:
// - trimmed - Cells that are "above" removed rows sections and overlap the removed section - their rowspan must be trimmed.
// - moved - Cells from removed rows section might stick out of. Such cells are moved to a next row after a removed section.
//
// Sample table with overlapping & sticking out cells:
//
//      +----+----+----+----+----+
//      | 00 | 01 | 02 | 03 | 04 |
//      +----+    +    +    +    +
//      | 10 |    |    |    |    |
//      +----+----+    +    +    +
//      | 20 | 21 |    |    |    | <-- removed row
//      +    +    +----+    +    +
//      |    |    | 32 |    |    | <-- removed row
//      +----+    +    +----+    +
//      | 40 |    |    | 43 |    |
//      +----+----+----+----+----+
//
// In a table above:
// - cells to trim: '02', '03' & '04'.
// - cells to move: '21' & '32'.
function getCellsToMoveAndTrimOnRemoveRow( table, first, last ) {
	const cellsToMove = new Map();
	const cellsToTrim = [];

	for ( const { row, column, rowspan, cell } of new TableWalker( table, { endRow: last } ) ) {
		const lastRowOfCell = row + rowspan - 1;

		const isCellStickingOutFromRemovedRows = row >= first && row <= last && lastRowOfCell > last;

		if ( isCellStickingOutFromRemovedRows ) {
			const rowspanInRemovedSection = last - row + 1;
			const rowSpanToSet = rowspan - rowspanInRemovedSection;

			cellsToMove.set( column, {
				cell,
				rowspan: rowSpanToSet
			} );
		}

		const isCellOverlappingRemovedRows = row < first && lastRowOfCell >= first;

		if ( isCellOverlappingRemovedRows ) {
			let rowspanAdjustment;

			// Cell fully covers removed section - trim it by removed rows count.
			if ( lastRowOfCell >= last ) {
				rowspanAdjustment = last - first + 1;
			}
			// Cell partially overlaps removed section - calculate cell's span that is in removed section.
			else {
				rowspanAdjustment = lastRowOfCell - first + 1;
			}

			cellsToTrim.push( {
				cell,
				rowspan: rowspan - rowspanAdjustment
			} );
		}
	}
	return { cellsToMove, cellsToTrim };
}

function moveCellsToRow( table, targetRowIndex, cellsToMove, writer ) {
	const tableWalker = new TableWalker( table, {
		includeSpanned: true,
		startRow: targetRowIndex,
		endRow: targetRowIndex
	} );

	const tableRowMap = [ ...tableWalker ];
	const row = table.getChild( targetRowIndex );

	let previousCell;

	for ( const { column, cell, isSpanned } of tableRowMap ) {
		if ( cellsToMove.has( column ) ) {
			const { cell: cellToMove, rowspan } = cellsToMove.get( column );

			const targetPosition = previousCell ?
				writer.createPositionAfter( previousCell ) :
				writer.createPositionAt( row, 0 );

			writer.move( writer.createRangeOn( cellToMove ), targetPosition );
			updateNumericAttribute( 'rowspan', rowspan, cellToMove, writer );

			previousCell = cellToMove;
		} else if ( !isSpanned ) {
			// If cell is spanned then `cell` holds reference to overlapping cell. See ckeditor/ckeditor5#6502.
			previousCell = cell;
		}
	}
}
