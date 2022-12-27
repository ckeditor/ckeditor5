/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableutils
 */

import { CKEditorError } from 'ckeditor5/src/utils';
import { Plugin } from 'ckeditor5/src/core';

import TableWalker from './tablewalker';
import { createEmptyTableCell, updateNumericAttribute } from './utils/common';
import { removeEmptyColumns, removeEmptyRows } from './utils/structure';

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
	 * @inheritDoc
	 */
	init() {
		this.decorate( 'insertColumns' );
		this.decorate( 'insertRows' );
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

		const tableWalker = new TableWalker( table, { row: rowIndex } );

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
	 *			const table = tableUtils.createTable( writer, { rows: 2, columns: 7 } );
	 *
	 *			// Insert a table to the model at the best position taking the current selection:
	 *			model.insertContent( table );
	 *		}
	 *
	 * @param {module:engine/model/writer~Writer} writer The model writer.
	 * @param {Object} options
	 * @param {Number} [options.rows=2] The number of rows to create.
	 * @param {Number} [options.columns=2] The number of columns to create.
	 * @param {Number} [options.headingRows=0] The number of heading rows.
	 * @param {Number} [options.headingColumns=0] The number of heading columns.
	 * @returns {module:engine/model/element~Element} The created table element.
	 */
	createTable( writer, options ) {
		const table = writer.createElement( 'table' );

		const rows = parseInt( options.rows ) || 2;
		const columns = parseInt( options.columns ) || 2;

		createEmptyRows( writer, table, 0, rows, columns );

		if ( options.headingRows ) {
			updateNumericAttribute( 'headingRows', Math.min( options.headingRows, rows ), table, writer, 0 );
		}

		if ( options.headingColumns ) {
			updateNumericAttribute( 'headingColumns', Math.min( options.headingColumns, columns ), table, writer, 0 );
		}

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
	 * @param {Boolean|undefined} [options.copyStructureFromAbove] The flag for copying row structure. Note that
	 * the row structure will not be copied if this option is not provided.
	 */
	insertRows( table, options = {} ) {
		const model = this.editor.model;

		const insertAt = options.at || 0;
		const rowsToInsert = options.rows || 1;
		const isCopyStructure = options.copyStructureFromAbove !== undefined;
		const copyStructureFrom = options.copyStructureFromAbove ? insertAt - 1 : insertAt;

		const rows = this.getRows( table );
		const columns = this.getColumns( table );

		if ( insertAt > rows ) {
			/**
			 * The `options.at` points at a row position that does not exist.
			 *
			 * @error tableutils-insertrows-insert-out-of-range
			 */
			throw new CKEditorError(
				'tableutils-insertrows-insert-out-of-range',
				this,
				{ options }
			);
		}

		model.change( writer => {
			const headingRows = table.getAttribute( 'headingRows' ) || 0;

			// Inserting rows inside heading section requires to update `headingRows` attribute as the heading section will grow.
			if ( headingRows > insertAt ) {
				updateNumericAttribute( 'headingRows', headingRows + rowsToInsert, table, writer, 0 );
			}

			// Inserting at the end or at the beginning of a table doesn't require to calculate anything special.
			if ( !isCopyStructure && ( insertAt === 0 || insertAt === rows ) ) {
				createEmptyRows( writer, table, insertAt, rowsToInsert, columns );

				return;
			}

			// Iterate over all the rows above the inserted rows in order to check for the row-spanned cells.
			const walkerEndRow = isCopyStructure ? Math.max( insertAt, copyStructureFrom ) : insertAt;
			const tableIterator = new TableWalker( table, { endRow: walkerEndRow } );

			// Store spans of the reference row to reproduce it's structure. This array is column number indexed.
			const rowColSpansMap = new Array( columns ).fill( 1 );

			for ( const { row, column, cellHeight, cellWidth, cell } of tableIterator ) {
				const lastCellRow = row + cellHeight - 1;

				const isOverlappingInsertedRow = row < insertAt && insertAt <= lastCellRow;
				const isReferenceRow = row <= copyStructureFrom && copyStructureFrom <= lastCellRow;

				// If the cell is row-spanned and overlaps the inserted row, then reserve space for it in the row map.
				if ( isOverlappingInsertedRow ) {
					// This cell overlaps the inserted rows so we need to expand it further.
					writer.setAttribute( 'rowspan', cellHeight + rowsToInsert, cell );

					// Mark this cell with negative number to indicate how many cells should be skipped when adding the new cells.
					rowColSpansMap[ column ] = -cellWidth;
				}
				// Store the colspan from reference row.
				else if ( isCopyStructure && isReferenceRow ) {
					rowColSpansMap[ column ] = cellWidth;
				}
			}

			for ( let rowIndex = 0; rowIndex < rowsToInsert; rowIndex++ ) {
				const tableRow = writer.createElement( 'tableRow' );

				writer.insert( tableRow, table, insertAt );

				for ( let cellIndex = 0; cellIndex < rowColSpansMap.length; cellIndex++ ) {
					const colspan = rowColSpansMap[ cellIndex ];
					const insertPosition = writer.createPositionAt( tableRow, 'end' );

					// Insert the empty cell only if this slot is not row-spanned from any other cell.
					if ( colspan > 0 ) {
						createEmptyTableCell( writer, insertPosition, colspan > 1 ? { colspan } : null );
					}

					// Skip the col-spanned slots, there won't be any cells.
					cellIndex += Math.abs( colspan ) - 1;
				}
			}
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
					// Ignore non-row elements inside the table (e.g. caption).
					if ( !tableRow.is( 'element', 'tableRow' ) ) {
						continue;
					}

					createCells( columnsToInsert, writer, writer.createPositionAt( tableRow, insertAt ? 'end' : 0 ) );
				}

				return;
			}

			const tableWalker = new TableWalker( table, { column: insertAt, includeAllSlots: true } );

			for ( const tableSlot of tableWalker ) {
				const { row, cell, cellAnchorColumn, cellAnchorRow, cellWidth, cellHeight } = tableSlot;

				// When iterating over column the table walker outputs either:
				// - cells at given column index (cell "e" from method docs),
				// - spanned columns (spanned cell from row between cells "g" and "h" - spanned by "e", only if `includeAllSlots: true`),
				// - or a cell from the same row which spans over this column (cell "a").

				if ( cellAnchorColumn < insertAt ) {
					// If cell is anchored in previous column, it is a cell that spans over an inserted column (cell "a" & "i").
					// For such cells expand them by a number of columns inserted.
					writer.setAttribute( 'colspan', cellWidth + columnsToInsert, cell );

					// This cell will overlap cells in rows below so skip them (because of `includeAllSlots` option) - (cell "a")
					const lastCellRow = cellAnchorRow + cellHeight - 1;

					for ( let i = row; i <= lastCellRow; i++ ) {
						tableWalker.skipRow( i );
					}
				} else {
					// It's either cell at this column index or spanned cell by a row-spanned cell from row above.
					// In table above it's cell "e" and a spanned position from row below (empty cell between cells "g" and "h")
					createCells( columnsToInsert, writer, tableSlot.getPositionBefore() );
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
		const rowCount = this.getRows( table );
		const first = options.at;
		const last = first + rowsToRemove - 1;

		if ( last > rowCount - 1 ) {
			/**
			 * The `options.at` param must point at existing row and `options.rows` must not exceed the rows in the table.
			 *
			 * @error tableutils-removerows-row-index-out-of-range
			 */
			throw new CKEditorError(
				'tableutils-removerows-row-index-out-of-range',
				this,
				{ table, options }
			);
		}

		model.change( writer => {
			// Removing rows from the table require that most calculations to be done prior to changing table structure.
			// Preparations must be done in the same enqueueChange callback to use the current table structure.

			// 1. Preparation - get row-spanned cells that have to be modified after removing rows.
			const { cellsToMove, cellsToTrim } = getCellsToMoveAndTrimOnRemoveRow( table, first, last );

			// 2. Execution

			// 2a. Move cells from removed rows that extends over a removed section - must be done before removing rows.
			// This will fill any gaps in a rows below that previously were empty because of row-spanned cells.
			if ( cellsToMove.size ) {
				const rowAfterRemovedSection = last + 1;
				moveCellsToRow( table, rowAfterRemovedSection, cellsToMove, writer );
			}

			// 2b. Remove all required rows.
			for ( let i = last; i >= first; i-- ) {
				writer.remove( table.getChild( i ) );
			}

			// 2c. Update cells from rows above that overlap removed section. Similar to step 2 but does not involve moving cells.
			for ( const { rowspan, cell } of cellsToTrim ) {
				updateNumericAttribute( 'rowspan', rowspan, cell, writer );
			}

			// 2d. Adjust heading rows if removed rows were in a heading section.
			updateHeadingRows( table, first, last, writer );

			// 2e. Remove empty columns (without anchored cells) if there are any.
			if ( !removeEmptyColumns( table, this ) ) {
				// If there wasn't any empty columns then we still need to check if this wasn't called
				// because of cleaning empty rows and we only removed one of them.
				removeEmptyRows( table, this );
			}
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
				for ( const { cell, column, cellWidth } of [ ...new TableWalker( table ) ] ) {
					// If colspaned cell overlaps removed column decrease its span.
					if ( column <= removedColumnIndex && cellWidth > 1 && column + cellWidth > removedColumnIndex ) {
						updateNumericAttribute( 'colspan', cellWidth - 1, cell, writer );
					} else if ( column === removedColumnIndex ) {
						// The cell in removed column has colspan of 1.
						writer.remove( cell );
					}
				}
			}

			// Remove empty rows that could appear after removing columns.
			if ( !removeEmptyRows( table, this ) ) {
				// If there wasn't any empty rows then we still need to check if this wasn't called
				// because of cleaning empty columns and we only removed one of them.
				removeEmptyColumns( table, this );
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
				const cellsToUpdate = tableMap.filter( ( { cell, cellWidth, column } ) => {
					const isOnSameColumn = cell !== tableCell && column === splitCellColumn;
					const spansOverColumn = ( column < splitCellColumn && column + cellWidth > splitCellColumn );

					return isOnSameColumn || spansOverColumn;
				} );

				// Expand cells vertically.
				for ( const { cell, cellWidth } of cellsToUpdate ) {
					writer.setAttribute( 'colspan', cellWidth + cellsToInsert, cell );
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
					includeAllSlots: true
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

				for ( const tableSlot of tableMap ) {
					const { column, row } = tableSlot;

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
						createCells( 1, writer, tableSlot.getPositionBefore(), newCellsAttributes );
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
				for ( const { cell, cellHeight, row } of tableMap ) {
					// Expand rowspan of cells that are either:
					// - on the same row as current cell,
					// - or are below split cell row and overlaps that row.
					if ( cell !== tableCell && row + cellHeight > splitCellRow ) {
						const rowspanToSet = cellHeight + cellsToInsert;

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
		// Using the first row without checking if it's a tableRow because we expect
		// that table will have only tableRow model elements at the beginning.
		const row = table.getChild( 0 );

		return [ ...row.getChildren() ].reduce( ( columns, row ) => {
			const columnWidth = parseInt( row.getAttribute( 'colspan' ) || 1 );

			return columns + columnWidth;
		}, 0 );
	}

	/**
	 * Returns the number of rows for a given table. Any other element present in the table model is omitted.
	 *
	 *		editor.plugins.get( 'TableUtils' ).getRows( table );
	 *
	 * @param {module:engine/model/element~Element} table The table to analyze.
	 * @returns {Number}
	 */
	getRows( table ) {
		// Rowspan not included due to #6427.
		return Array.from( table.getChildren() )
			.reduce( ( rowCount, child ) => child.is( 'element', 'tableRow' ) ? rowCount + 1 : rowCount, 0 );
	}

	/**
	 * Creates an instance of the table walker.
	 *
	 * The table walker iterates internally by traversing the table from row index = 0 and column index = 0.
	 * It walks row by row and column by column in order to output values defined in the options.
	 * By default it will output only the locations that are occupied by a cell. To include also spanned rows and columns,
	 * pass the `includeAllSlots` option.
	 *
	 * @protected
	 * @param {module:engine/model/element~Element} table A table over which the walker iterates.
	 * @param {Object} [options={}] An object with configuration.
	 * @param {Number} [options.row] A row index for which this iterator will output cells.
	 * Can't be used together with `startRow` and `endRow`.
	 * @param {Number} [options.startRow=0] A row index from which this iterator should start. Can't be used together with `row`.
	 * @param {Number} [options.endRow] A row index at which this iterator should end. Can't be used together with `row`.
	 * @param {Number} [options.column] A column index for which this iterator will output cells.
	 * Can't be used together with `startColumn` and `endColumn`.
	 * @param {Number} [options.startColumn=0] A column index from which this iterator should start. Can't be used together with `column`.
	 * @param {Number} [options.endColumn] A column index at which this iterator should end. Can't be used together with `column`.
	 * @param {Boolean} [options.includeAllSlots=false] Also return values for spanned cells.
	 */
	createTableWalker( table, options = {} ) {
		return new TableWalker( table, options );
	}

	/**
	 * Returns all model table cells that are fully selected (from the outside)
	 * within the provided model selection's ranges.
	 *
	 * To obtain the cells selected from the inside, use
	 * {@link #getTableCellsContainingSelection}.
	 *
	 * @param {module:engine/model/selection~Selection} selection
	 * @returns {Array.<module:engine/model/element~Element>}
	 */
	getSelectedTableCells( selection ) {
		const cells = [];

		for ( const range of this.sortRanges( selection.getRanges() ) ) {
			const element = range.getContainedElement();

			if ( element && element.is( 'element', 'tableCell' ) ) {
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
	 * {@link #getSelectedTableCells}.
	 *
	 * @param {module:engine/model/selection~Selection} selection
	 * @returns {Array.<module:engine/model/element~Element>}
	 */
	getTableCellsContainingSelection( selection ) {
		const cells = [];

		for ( const range of selection.getRanges() ) {
			const cellWithSelection = range.start.findAncestor( 'tableCell' );

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
	 * Combines {@link #getTableCellsContainingSelection} and
	 * {@link #getSelectedTableCells}.
	 *
	 * @param {module:engine/model/selection~Selection} selection
	 * @returns {Array.<module:engine/model/element~Element>}
	 */
	getSelectionAffectedTableCells( selection ) {
		const selectedCells = this.getSelectedTableCells( selection );

		if ( selectedCells.length ) {
			return selectedCells;
		}

		return this.getTableCellsContainingSelection( selection );
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
	getRowIndexes( tableCells ) {
		const indexes = tableCells.map( cell => cell.parent.index );

		return this._getFirstLastIndexesObject( indexes );
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
	getColumnIndexes( tableCells ) {
		const table = tableCells[ 0 ].findAncestor( 'table' );
		const tableMap = [ ...new TableWalker( table ) ];

		const indexes = tableMap
			.filter( entry => tableCells.includes( entry.cell ) )
			.map( entry => entry.column );

		return this._getFirstLastIndexesObject( indexes );
	}

	/**
	 * Checks if the selection contains cells that do not exceed rectangular selection.
	 *
	 * In a table below:
	 *
	 *		┌───┬───┬───┬───┐
	*		│ a │ b │ c │ d │
	*		├───┴───┼───┤   │
	*		│ e     │ f │   │
	*		│       ├───┼───┤
	*		│       │ g │ h │
	*		└───────┴───┴───┘
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
	* @returns {Boolean}
	*/
	isSelectionRectangular( selectedTableCells ) {
		if ( selectedTableCells.length < 2 || !this._areCellInTheSameTableSection( selectedTableCells ) ) {
			return false;
		}

		// A valid selection is a fully occupied rectangle composed of table cells.
		// Below we will calculate the area of a selected table cells and the area of valid selection.
		// The area of a valid selection is defined by top-left and bottom-right cells.
		const rows = new Set();
		const columns = new Set();

		let areaOfSelectedCells = 0;

		for ( const tableCell of selectedTableCells ) {
			const { row, column } = this.getCellLocation( tableCell );
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

	/**
	 * Returns array of sorted ranges.
	 *
	 * @param {Iterable.<module:engine/model/range~Range>} ranges
	 * @return {Array.<module:engine/model/range~Range>}
	 */
	sortRanges( ranges ) {
		return Array.from( ranges ).sort( compareRangeOrder );
	}

	/**
	 * Helper method to get an object with `first` and `last` indexes from an unsorted array of indexes.
	 *
	 * @private
	 * @param {Number[]} indexes
	 * @returns {Object}
	 */
	_getFirstLastIndexesObject( indexes ) {
		const allIndexesSorted = indexes.sort( ( indexA, indexB ) => indexA - indexB );

		const first = allIndexesSorted[ 0 ];
		const last = allIndexesSorted[ allIndexesSorted.length - 1 ];

		return { first, last };
	}

	/**
	 * Checks if the selection does not mix a header (column or row) with other cells.
	 *
	 * For instance, in the table below valid selections consist of cells with the same letter only.
	 * So, a-a (same heading row and column) or d-d (body cells) are valid while c-d or a-b are not.
	 *
	 * header columns
	 *		  ↓   ↓
	 *		┌───┬───┬───┬───┐
	 *		│ a │ a │ b │ b │  ← header row
	 *		├───┼───┼───┼───┤
	 *		│ c │ c │ d │ d │
	 *		├───┼───┼───┼───┤
	 *		│ c │ c │ d │ d │
	 *		└───┴───┴───┴───┘
	 *
	 * @private
	 * @param {Array.<module:engine/model/element~Element>} tableCells
	 * @returns {Boolean}
	 */
	_areCellInTheSameTableSection( tableCells ) {
		const table = tableCells[ 0 ].findAncestor( 'table' );

		const rowIndexes = this.getRowIndexes( tableCells );
		const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );

		// Calculating row indexes is a bit cheaper so if this check fails we can't merge.
		if ( !this._areIndexesInSameSection( rowIndexes, headingRows ) ) {
			return false;
		}

		const headingColumns = parseInt( table.getAttribute( 'headingColumns' ) || 0 );
		const columnIndexes = this.getColumnIndexes( tableCells );

		// Similarly cells must be in same column section.
		return this._areIndexesInSameSection( columnIndexes, headingColumns );
	}

	/**
	 * Unified check if table rows/columns indexes are in the same heading/body section.
	 *
	 * @private
	 * @param {Object} params
	 * @param {Number} params.first
	 * @param {Number} params.last
	 * @param {Number} headingSectionSize
	 */
	_areIndexesInSameSection( { first, last }, headingSectionSize ) {
		const firstCellIsInHeading = first < headingSectionSize;
		const lastCellIsInHeading = last < headingSectionSize;

		return firstCellIsInHeading === lastCellIsInHeading;
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
function updateHeadingRows( table, first, last, writer ) {
	const headingRows = table.getAttribute( 'headingRows' ) || 0;

	if ( first < headingRows ) {
		const newRows = last < headingRows ? headingRows - ( last - first + 1 ) : first;

		updateNumericAttribute( 'headingRows', newRows, table, writer, 0 );
	}
}

// Finds cells that will be:
// - trimmed - Cells that are "above" removed rows sections and overlap the removed section - their rowspan must be trimmed.
// - moved - Cells from removed rows section might stick out of. These cells are moved to the next row after a removed section.
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

	for ( const { row, column, cellHeight, cell } of new TableWalker( table, { endRow: last } ) ) {
		const lastRowOfCell = row + cellHeight - 1;

		const isCellStickingOutFromRemovedRows = row >= first && row <= last && lastRowOfCell > last;

		if ( isCellStickingOutFromRemovedRows ) {
			const rowspanInRemovedSection = last - row + 1;
			const rowSpanToSet = cellHeight - rowspanInRemovedSection;

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
				rowspan: cellHeight - rowspanAdjustment
			} );
		}
	}
	return { cellsToMove, cellsToTrim };
}

function moveCellsToRow( table, targetRowIndex, cellsToMove, writer ) {
	const tableWalker = new TableWalker( table, {
		includeAllSlots: true,
		row: targetRowIndex
	} );

	const tableRowMap = [ ...tableWalker ];
	const row = table.getChild( targetRowIndex );

	let previousCell;

	for ( const { column, cell, isAnchor } of tableRowMap ) {
		if ( cellsToMove.has( column ) ) {
			const { cell: cellToMove, rowspan } = cellsToMove.get( column );

			const targetPosition = previousCell ?
				writer.createPositionAfter( previousCell ) :
				writer.createPositionAt( row, 0 );

			writer.move( writer.createRangeOn( cellToMove ), targetPosition );
			updateNumericAttribute( 'rowspan', rowspan, cellToMove, writer );

			previousCell = cellToMove;
		} else if ( isAnchor ) {
			// If cell is spanned then `cell` holds reference to overlapping cell. See ckeditor/ckeditor5#6502.
			previousCell = cell;
		}
	}
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
