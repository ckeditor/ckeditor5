/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tableutils
 */

import { CKEditorError } from 'ckeditor5/src/utils.js';
import { Plugin } from 'ckeditor5/src/core.js';
import type {
	DocumentSelection,
	Element,
	Node,
	Position,
	Range,
	Selection,
	Writer
} from 'ckeditor5/src/engine.js';

import TableWalker, { type TableWalkerOptions } from './tablewalker.js';
import { createEmptyTableCell, updateNumericAttribute } from './utils/common.js';
import { removeEmptyColumns, removeEmptyRows } from './utils/structure.js';
import { getTableColumnElements } from './tablecolumnresize/utils.js';

type Cell = { cell: Element; rowspan: number };
type CellsToMove = Map<number, Cell>;
type CellsToTrim = Array<Cell>;

type IndexesObject = { first: number; last: number };

/**
 * The table utilities plugin.
 */
export default class TableUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableUtils' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this.decorate( 'insertColumns' );
		this.decorate( 'insertRows' );
	}

	/**
	 * Returns the table cell location as an object with table row and table column indexes.
	 *
	 * For instance, in the table below:
	 *
	 *      0   1   2   3
	 *    +---+---+---+---+
	 *  0 | a     | b | c |
	 *    +       +   +---+
	 *  1 |       |   | d |
	 *    +---+---+   +---+
	 *  2 | e     |   | f |
	 *    +---+---+---+---+
	 *
	 * the method will return:
	 *
	 * ```ts
	 * const cellA = table.getNodeByPath( [ 0, 0 ] );
	 * editor.plugins.get( 'TableUtils' ).getCellLocation( cellA );
	 * // will return { row: 0, column: 0 }
	 *
	 * const cellD = table.getNodeByPath( [ 1, 0 ] );
	 * editor.plugins.get( 'TableUtils' ).getCellLocation( cellD );
	 * // will return { row: 1, column: 3 }
	 * ```
	 *
	 * @returns Returns a `{row, column}` object.
	 */
	public getCellLocation( tableCell: Element ): { row: number; column: number } {
		const tableRow = tableCell.parent!;
		const table = tableRow.parent as Element;

		const rowIndex = table.getChildIndex( tableRow as Node );

		const tableWalker = new TableWalker( table, { row: rowIndex } );

		for ( const { cell, row, column } of tableWalker ) {
			if ( cell === tableCell ) {
				return { row, column };
			}
		}

		// Should be unreachable code.
		/* istanbul ignore next -- @preserve */
		return undefined as any;
	}

	/**
	 * Creates an empty table with a proper structure. The table needs to be inserted into the model,
	 * for example, by using the {@link module:engine/model/model~Model#insertContent} function.
	 *
	 * ```ts
	 * model.change( ( writer ) => {
	 *   // Create a table of 2 rows and 7 columns:
	 *   const table = tableUtils.createTable( writer, { rows: 2, columns: 7 } );
	 *
	 *   // Insert a table to the model at the best position taking the current selection:
	 *   model.insertContent( table );
	 * }
	 * ```
	 *
	 * @param writer The model writer.
	 * @param options.rows The number of rows to create. Default value is 2.
	 * @param options.columns The number of columns to create. Default value is 2.
	 * @param options.headingRows The number of heading rows. Default value is 0.
	 * @param options.headingColumns The number of heading columns. Default value is 0.
	 * @returns The created table element.
	 */
	public createTable(
		writer: Writer,
		options: {
			rows?: number;
			columns?: number;
			headingRows?: number;
			headingColumns?: number;
		}
	): Element {
		const table = writer.createElement( 'table' );

		const rows = options.rows || 2;
		const columns = options.columns || 2;

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
	 * ```ts
	 * editor.plugins.get( 'TableUtils' ).insertRows( table, { at: 1, rows: 2 } );
	 * ```
	 *
	 * Assuming the table on the left, the above code will transform it to the table on the right:
	 *
	 *  row index
	 *    0 +---+---+---+       `at` = 1,      +---+---+---+ 0
	 *      | a | b | c |       `rows` = 2,    | a | b | c |
	 *    1 +   +---+---+   <-- insert here    +   +---+---+ 1
	 *      |   | d | e |                      |   |   |   |
	 *    2 +   +---+---+       will give:     +   +---+---+ 2
	 *      |   | f | g |                      |   |   |   |
	 *    3 +---+---+---+                      +   +---+---+ 3
	 *                                         |   | d | e |
	 *                                         +   +---+---+ 4
	 *                                         +   + f | g |
	 *                                         +---+---+---+ 5
	 *
	 * @param table The table model element where the rows will be inserted.
	 * @param options.at The row index at which the rows will be inserted.  Default value is 0.
	 * @param options.rows The number of rows to insert.  Default value is 1.
	 * @param options.copyStructureFromAbove The flag for copying row structure. Note that
	 * the row structure will not be copied if this option is not provided.
	 */
	public insertRows( table: Element, options: { at?: number; rows?: number; copyStructureFromAbove?: boolean } = {} ): void {
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
			const headingRows = table.getAttribute( 'headingRows' ) as number || 0;

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
						createEmptyTableCell( writer, insertPosition, colspan > 1 ? { colspan } : undefined );
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
	 * ```ts
	 * editor.plugins.get( 'TableUtils' ).insertColumns( table, { at: 1, columns: 2 } );
	 * ```
	 *
	 * Assuming the table on the left, the above code will transform it to the table on the right:
	 *
	 *  0   1   2   3                   0   1   2   3   4   5
	 *  +---+---+---+                   +---+---+---+---+---+
	 *  | a     | b |                   | a             | b |
	 *  +       +---+                   +               +---+
	 *  |       | c |                   |               | c |
	 *  +---+---+---+     will give:    +---+---+---+---+---+
	 *  | d | e | f |                   | d |   |   | e | f |
	 *  +---+   +---+                   +---+---+---+   +---+
	 *  | g |   | h |                   | g |   |   |   | h |
	 *  +---+---+---+                   +---+---+---+---+---+
	 *  | i         |                   | i                 |
	 *  +---+---+---+                   +---+---+---+---+---+
	 *      ^---- insert here, `at` = 1, `columns` = 2
	 *
	 * @param table The table model element where the columns will be inserted.
	 * @param options.at The column index at which the columns will be inserted. Default value is 0.
	 * @param options.columns The number of columns to insert. Default value is 1.
	 */
	public insertColumns( table: Element, options: { at?: number; columns?: number } = {} ): void {
		const model = this.editor.model;

		const insertAt = options.at || 0;
		const columnsToInsert = options.columns || 1;

		model.change( writer => {
			const headingColumns = table.getAttribute( 'headingColumns' ) as number;

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
	 * ```ts
	 * editor.plugins.get( 'TableUtils' ).removeRows( table, { at: 1, rows: 2 } );
	 * ```
	 *
	 * Executing the above code in the context of the table on the left will transform its structure as presented on the right:
	 *
	 *  row index
	 *      ┌───┬───┬───┐        `at` = 1        ┌───┬───┬───┐
	 *    0 │ a │ b │ c │        `rows` = 2      │ a │ b │ c │ 0
	 *      │   ├───┼───┤                        │   ├───┼───┤
	 *    1 │   │ d │ e │  <-- remove from here  │   │ d │ g │ 1
	 *      │   │   ├───┤        will give:      ├───┼───┼───┤
	 *    2 │   │   │ f │                        │ h │ i │ j │ 2
	 *      │   │   ├───┤                        └───┴───┴───┘
	 *    3 │   │   │ g │
	 *      ├───┼───┼───┤
	 *    4 │ h │ i │ j │
	 *      └───┴───┴───┘
	 *
	 * @param options.at The row index at which the removing rows will start.
	 * @param options.rows The number of rows to remove. Default value is 1.
	 */
	public removeRows( table: Element, options: { at: number; rows?: number } ): void {
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
			const indexesObject = { first, last };

			// Removing rows from the table require that most calculations to be done prior to changing table structure.
			// Preparations must be done in the same enqueueChange callback to use the current table structure.

			// 1. Preparation - get row-spanned cells that have to be modified after removing rows.
			const { cellsToMove, cellsToTrim } = getCellsToMoveAndTrimOnRemoveRow( table, indexesObject );

			// 2. Execution

			// 2a. Move cells from removed rows that extends over a removed section - must be done before removing rows.
			// This will fill any gaps in a rows below that previously were empty because of row-spanned cells.
			if ( cellsToMove.size ) {
				const rowAfterRemovedSection = last + 1;
				moveCellsToRow( table, rowAfterRemovedSection, cellsToMove, writer );
			}

			// 2b. Remove all required rows.
			for ( let i = last; i >= first; i-- ) {
				writer.remove( table.getChild( i )! );
			}

			// 2c. Update cells from rows above that overlap removed section. Similar to step 2 but does not involve moving cells.
			for ( const { rowspan, cell } of cellsToTrim ) {
				updateNumericAttribute( 'rowspan', rowspan, cell, writer );
			}

			// 2d. Adjust heading rows if removed rows were in a heading section.
			updateHeadingRows( table, indexesObject, writer );

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
	 * ```ts
	 * editor.plugins.get( 'TableUtils' ).removeColumns( table, { at: 1, columns: 2 } );
	 * ```
	 *
	 * Executing the above code in the context of the table on the left will transform its structure as presented on the right:
	 *
	 *    0   1   2   3   4                       0   1   2
	 *  ┌───────────────┬───┐                   ┌───────┬───┐
	 *  │ a             │ b │                   │ a     │ b │
	 *  │               ├───┤                   │       ├───┤
	 *  │               │ c │                   │       │ c │
	 *  ├───┬───┬───┬───┼───┤     will give:    ├───┬───┼───┤
	 *  │ d │ e │ f │ g │ h │                   │ d │ g │ h │
	 *  ├───┼───┼───┤   ├───┤                   ├───┤   ├───┤
	 *  │ i │ j │ k │   │ l │                   │ i │   │ l │
	 *  ├───┴───┴───┴───┴───┤                   ├───┴───┴───┤
	 *  │ m                 │                   │ m         │
	 *  └───────────────────┘                   └───────────┘
	 *        ^---- remove from here, `at` = 1, `columns` = 2
	 *
	 * @param options.at The row index at which the removing columns will start.
	 * @param options.columns The number of columns to remove.
	 */
	public removeColumns( table: Element, options: { at: number; columns?: number } ): void {
		const model = this.editor.model;
		const first = options.at;
		const columnsToRemove = options.columns || 1;
		const last = options.at + columnsToRemove - 1;

		model.change( writer => {
			adjustHeadingColumns( table, { first, last }, writer );
			const tableColumns = getTableColumnElements( table );

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

				// If table has `tableColumn` elements, we need to update it manually.
				// See https://github.com/ckeditor/ckeditor5/issues/14521#issuecomment-1662102889 for details.
				if ( tableColumns[ removedColumnIndex ] ) {
					// If the removed column is the first one then we need to add its width to the next column.
					// Otherwise we add it to the previous column.
					const adjacentColumn = removedColumnIndex === 0 ? tableColumns[ 1 ] : tableColumns[ removedColumnIndex - 1 ];

					const removedColumnWidth = parseFloat( tableColumns[ removedColumnIndex ].getAttribute( 'columnWidth' ) as string );
					const adjacentColumnWidth = parseFloat( adjacentColumn.getAttribute( 'columnWidth' ) as string );

					writer.remove( tableColumns[ removedColumnIndex ] );

					// Add the removed column width (in %) to the adjacent column.
					writer.setAttribute( 'columnWidth', removedColumnWidth + adjacentColumnWidth + '%', adjacentColumn );
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
	 *  +---+---+---+
	 *  | a | b | c |
	 *  +---+---+---+
	 *  | d | e | f |
	 *  +---+---+---+
	 *
	 * it will result in the table below:
	 *
	 *  +---+---+---+---+---+
	 *  | a |   |   | b | c |
	 *  +---+---+---+---+---+
	 *  | d         | e | f |
	 *  +---+---+---+---+---+
	 *
	 * So cell "d" will get its `colspan` updated to `3` and 2 cells will be added (2 columns will be created).
	 *
	 * Splitting a cell that already has a `colspan` attribute set will distribute the cell `colspan` evenly and the remainder
	 * will be left to the original cell:
	 *
	 *  +---+---+---+
	 *  | a         |
	 *  +---+---+---+
	 *  | b | c | d |
	 *  +---+---+---+
	 *
	 * Splitting cell "a" with `colspan=3` into 2 cells will create 1 cell with a `colspan=a` and cell "a" that will have `colspan=2`:
	 *
	 *  +---+---+---+
	 *  | a     |   |
	 *  +---+---+---+
	 *  | b | c | d |
	 *  +---+---+---+
	 */
	public splitCellVertically( tableCell: Element, numberOfCells = 2 ): void {
		const model = this.editor.model;
		const tableRow = tableCell.parent!;
		const table = tableRow.parent as Element;

		const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) as string || '1' );
		const colspan = parseInt( tableCell.getAttribute( 'colspan' ) as string || '1' );

		model.change( writer => {
			// First check - the cell spans over multiple rows so before doing anything else just split this cell.
			if ( colspan > 1 ) {
				// Get spans of new (inserted) cells and span to update of split cell.
				const { newCellsSpan, updatedSpan } = breakSpanEvenly( colspan, numberOfCells );

				updateNumericAttribute( 'colspan', updatedSpan, tableCell, writer );

				// Each inserted cell will have the same attributes:
				const newCellsAttributes: { colspan?: number; rowspan?: number } = {};

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
				const { column: splitCellColumn } = tableMap.find( ( { cell } ) => cell === tableCell )!;

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
				const newCellsAttributes: { rowspan?: number } = {};

				// Do not store default value in the model.

				// Copy rowspan of split cell.
				if ( rowspan > 1 ) {
					newCellsAttributes.rowspan = rowspan;
				}

				createCells( cellsToInsert, writer, writer.createPositionAfter( tableCell ), newCellsAttributes );

				const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

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
	 *  +---+---+---+
	 *  | a | b | c |
	 *  +---+---+---+
	 *  | d | e | f |
	 *  +---+---+---+
	 *
	 * It will result in the table below:
	 *
	 *  +---+---+---+
	 *  | a | b | c |
	 *  +   +---+   +
	 *  |   |   |   |
	 *  +   +---+   +
	 *  |   |   |   |
	 *  +---+---+---+
	 *  | d | e | f |
	 *  +---+---+---+
	 *
	 * So cells "a" and "b" will get their `rowspan` updated to `3` and 2 rows with a single cell will be added.
	 *
	 * Splitting a cell that already has a `rowspan` attribute set will distribute the cell `rowspan` evenly and the remainder
	 * will be left to the original cell:
	 *
	 *  +---+---+---+
	 *  | a | b | c |
	 *  +   +---+---+
	 *  |   | d | e |
	 *  +   +---+---+
	 *  |   | f | g |
	 *  +   +---+---+
	 *  |   | h | i |
	 *  +---+---+---+
	 *
	 * Splitting cell "a" with `rowspan=4` into 3 cells will create 2 cells with a `rowspan=1` and cell "a" will have `rowspan=2`:
	 *
	 *  +---+---+---+
	 *  | a | b | c |
	 *  +   +---+---+
	 *  |   | d | e |
	 *  +---+---+---+
	 *  |   | f | g |
	 *  +---+---+---+
	 *  |   | h | i |
	 *  +---+---+---+
	 */
	public splitCellHorizontally( tableCell: Element, numberOfCells = 2 ): void {
		const model = this.editor.model;

		const tableRow = tableCell.parent as Node;
		const table = tableRow.parent! as Element;
		const splitCellRow = table.getChildIndex( tableRow )!;

		const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) as string || '1' );
		const colspan = parseInt( tableCell.getAttribute( 'colspan' ) as string || '1' );

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

				const { column: cellColumn } = tableMap.find( ( { cell } ) => cell === tableCell )!;

				// Each inserted cell will have the same attributes:
				const newCellsAttributes: { rowspan?: number; colspan?: number } = {};

				// Do not store default value in the model.
				if ( newCellsSpan > 1 ) {
					newCellsAttributes.rowspan = newCellsSpan;
				}

				// Copy colspan of split cell.
				if ( colspan > 1 ) {
					newCellsAttributes.colspan = colspan;
				}

				// Accumulator that stores distance from the last inserted cell span.
				// It helps with evenly splitting larger cell spans (for example 10 cells collapsing into 3 cells).
				// We split these cells into 3, 3, 4 cells and we have to call `createCells` only when distance between
				// these cells is equal or greater than the new cells span size.
				let distanceFromLastCellSpan = 0;

				for ( const tableSlot of tableMap ) {
					const { column, row } = tableSlot;

					// As both newly created cells and the split cell might have rowspan,
					// the insertion of new cells must go to appropriate rows:
					//
					// 1. It's a row after split cell + it's height.
					const isAfterSplitCell = row >= splitCellRow + updatedSpan;

					// 2. Is on the same column.
					const isOnSameColumn = column === cellColumn;

					// Reset distance from the last cell span if we are on the same column and we exceeded the new cells span size.
					if ( distanceFromLastCellSpan >= newCellsSpan && isOnSameColumn ) {
						distanceFromLastCellSpan = 0;
					}

					if ( isAfterSplitCell && isOnSameColumn ) {
						// Create new cells only if the distance from the last cell span is equal or greater than the new cells span.
						if ( !distanceFromLastCellSpan ) {
							createCells( 1, writer, tableSlot.getPositionBefore(), newCellsAttributes );
						}

						// Increase the distance from the last cell span.
						distanceFromLastCellSpan++;
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
				const newCellsAttributes: { colspan?: number } = {};

				// Copy colspan of split cell.
				if ( colspan > 1 ) {
					newCellsAttributes.colspan = colspan;
				}

				createEmptyRows( writer, table, splitCellRow + 1, cellsToInsert, 1, newCellsAttributes );

				// Update heading section if split cell is in heading section.
				const headingRows = table.getAttribute( 'headingRows' ) as number || 0;

				if ( headingRows > splitCellRow ) {
					updateNumericAttribute( 'headingRows', headingRows + cellsToInsert, table, writer );
				}
			}
		} );
	}

	/**
	 * Returns the number of columns for a given table.
	 *
	 * ```ts
	 * editor.plugins.get( 'TableUtils' ).getColumns( table );
	 * ```
	 *
	 * @param table The table to analyze.
	 */
	public getColumns( table: Element ): number {
		// Analyze first row only as all the rows should have the same width.
		// Using the first row without checking if it's a tableRow because we expect
		// that table will have only tableRow model elements at the beginning.
		const row = table.getChild( 0 ) as Element;

		return [ ...row.getChildren() ]
			// $marker elements can also be children of a row too (when TrackChanges is on). Don't include them in the count.
			.filter( node => node.is( 'element', 'tableCell' ) )
			.reduce( ( columns, row ) => {
				const columnWidth = parseInt( row.getAttribute( 'colspan' ) as string || '1' );

				return columns + columnWidth;
			}, 0 );
	}

	/**
	 * Returns the number of rows for a given table. Any other element present in the table model is omitted.
	 *
	 * ```ts
	 * editor.plugins.get( 'TableUtils' ).getRows( table );
	 * ```
	 *
	 * @param table The table to analyze.
	 */
	public getRows( table: Element ): number {
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
	 * @internal
	 * @param table A table over which the walker iterates.
	 * @param options An object with configuration.
	 */
	public createTableWalker( table: Element, options: TableWalkerOptions = {} ): TableWalker {
		return new TableWalker( table, options );
	}

	/**
	 * Returns all model table cells that are fully selected (from the outside)
	 * within the provided model selection's ranges.
	 *
	 * To obtain the cells selected from the inside, use
	 * {@link #getTableCellsContainingSelection}.
	 */
	public getSelectedTableCells( selection: Selection | DocumentSelection ): Array<Element> {
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
	 */
	public getTableCellsContainingSelection( selection: Selection | DocumentSelection ): Array<Element> {
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
	 */
	public getSelectionAffectedTableCells( selection: Selection | DocumentSelection ): Array<Element> {
		const selectedCells = this.getSelectedTableCells( selection );

		if ( selectedCells.length ) {
			return selectedCells;
		}

		return this.getTableCellsContainingSelection( selection );
	}

	/**
	 * Returns an object with the `first` and `last` row index contained in the given `tableCells`.
	 *
	 * ```ts
	 * const selectedTableCells = getSelectedTableCells( editor.model.document.selection );
	 *
	 * const { first, last } = getRowIndexes( selectedTableCells );
	 *
	 * console.log( `Selected rows: ${ first } to ${ last }` );
	 * ```
	 *
	 * @returns Returns an object with the `first` and `last` table row indexes.
	 */
	public getRowIndexes( tableCells: Array<Element> ): IndexesObject {
		const indexes = tableCells.map( cell => ( cell.parent as Element ).index! );

		return this._getFirstLastIndexesObject( indexes );
	}

	/**
	 * Returns an object with the `first` and `last` column index contained in the given `tableCells`.
	 *
	 * ```ts
	 * const selectedTableCells = getSelectedTableCells( editor.model.document.selection );
	 *
	 * const { first, last } = getColumnIndexes( selectedTableCells );
	 *
	 * console.log( `Selected columns: ${ first } to ${ last }` );
	 * ```
	 *
	 * @returns Returns an object with the `first` and `last` table column indexes.
	 */
	public getColumnIndexes( tableCells: Array<Element> ): IndexesObject {
		const table = tableCells[ 0 ].findAncestor( 'table' )!;
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
	 *  ┌───┬───┬───┬───┐
	 *  │ a │ b │ c │ d │
	 *  ├───┴───┼───┤   │
	 *  │ e     │ f │   │
	 *  │       ├───┼───┤
	 *  │       │ g │ h │
	 *  └───────┴───┴───┘
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
	 */
	public isSelectionRectangular( selectedTableCells: Array<Element> ): boolean {
		if ( selectedTableCells.length < 2 || !this._areCellInTheSameTableSection( selectedTableCells ) ) {
			return false;
		}

		// A valid selection is a fully occupied rectangle composed of table cells.
		// Below we will calculate the area of a selected table cells and the area of valid selection.
		// The area of a valid selection is defined by top-left and bottom-right cells.
		const rows: Set<number> = new Set();
		const columns: Set<number> = new Set();

		let areaOfSelectedCells = 0;

		for ( const tableCell of selectedTableCells ) {
			const { row, column } = this.getCellLocation( tableCell );
			const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) as string ) || 1;
			const colspan = parseInt( tableCell.getAttribute( 'colspan' ) as string ) || 1;

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
	 */
	public sortRanges( ranges: Iterable<Range> ): Array<Range> {
		return Array.from( ranges ).sort( compareRangeOrder );
	}

	/**
	 * Helper method to get an object with `first` and `last` indexes from an unsorted array of indexes.
	 */
	private _getFirstLastIndexesObject( indexes: Array<number> ): IndexesObject {
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
	 *    ↓   ↓
	 *  ┌───┬───┬───┬───┐
	 *  │ a │ a │ b │ b │  ← header row
	 *  ├───┼───┼───┼───┤
	 *  │ c │ c │ d │ d │
	 *  ├───┼───┼───┼───┤
	 *  │ c │ c │ d │ d │
	 *  └───┴───┴───┴───┘
	 */
	private _areCellInTheSameTableSection( tableCells: Array<Element> ): boolean {
		const table = tableCells[ 0 ].findAncestor( 'table' )!;

		const rowIndexes = this.getRowIndexes( tableCells );
		const headingRows = parseInt( table.getAttribute( 'headingRows' ) as string ) || 0;

		// Calculating row indexes is a bit cheaper so if this check fails we can't merge.
		if ( !this._areIndexesInSameSection( rowIndexes, headingRows ) ) {
			return false;
		}

		const columnIndexes = this.getColumnIndexes( tableCells );
		const headingColumns = parseInt( table.getAttribute( 'headingColumns' ) as string ) || 0;

		// Similarly cells must be in same column section.
		return this._areIndexesInSameSection( columnIndexes, headingColumns );
	}

	/**
	 * Unified check if table rows/columns indexes are in the same heading/body section.
	 */
	private _areIndexesInSameSection( { first, last }: IndexesObject, headingSectionSize: number ): boolean {
		const firstCellIsInHeading = first < headingSectionSize;
		const lastCellIsInHeading = last < headingSectionSize;

		return firstCellIsInHeading === lastCellIsInHeading;
	}
}

/**
 * Creates empty rows at the given index in an existing table.
 *
 * @param insertAt The row index of row insertion.
 * @param rows The number of rows to create.
 * @param tableCellToInsert The number of cells to insert in each row.
 */
function createEmptyRows( writer: Writer, table: Element, insertAt: number, rows: number, tableCellToInsert: number, attributes = {} ) {
	for ( let i = 0; i < rows; i++ ) {
		const tableRow = writer.createElement( 'tableRow' );

		writer.insert( tableRow, table, insertAt );

		createCells( tableCellToInsert, writer, writer.createPositionAt( tableRow, 'end' ), attributes );
	}
}

/**
 * Creates cells at a given position.
 *
 * @param cells The number of cells to create
 */
function createCells( cells: number, writer: Writer, insertPosition: Position, attributes = {} ) {
	for ( let i = 0; i < cells; i++ ) {
		createEmptyTableCell( writer, insertPosition, attributes );
	}
}

/**
 * Evenly distributes the span of a cell to a number of provided cells.
 * The resulting spans will always be integer values.
 *
 * For instance breaking a span of 7 into 3 cells will return:
 *
 * ```ts
 * { newCellsSpan: 2, updatedSpan: 3 }
 * ```
 *
 * as two cells will have a span of 2 and the remainder will go the first cell so its span will change to 3.
 *
 * @param span The span value do break.
 * @param numberOfCells The number of resulting spans.
 */
function breakSpanEvenly( span: number, numberOfCells: number ): { newCellsSpan: number; updatedSpan: number } {
	if ( span < numberOfCells ) {
		return { newCellsSpan: 1, updatedSpan: 1 };
	}

	const newCellsSpan = Math.floor( span / numberOfCells );
	const updatedSpan = ( span - newCellsSpan * numberOfCells ) + newCellsSpan;

	return { newCellsSpan, updatedSpan };
}

/**
 * Updates heading columns attribute if removing a row from head section.
 */
function adjustHeadingColumns( table: Element, removedColumnIndexes: IndexesObject, writer: Writer ) {
	const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

	if ( headingColumns && removedColumnIndexes.first < headingColumns ) {
		const headingsRemoved = Math.min( headingColumns - 1 /* Other numbers are 0-based */, removedColumnIndexes.last ) -
			removedColumnIndexes.first + 1;

		writer.setAttribute( 'headingColumns', headingColumns - headingsRemoved, table );
	}
}

/**
 * Calculates a new heading rows value for removing rows from heading section.
 */
function updateHeadingRows( table: Element, { first, last }: IndexesObject, writer: Writer ) {
	const headingRows = table.getAttribute( 'headingRows' ) as number || 0;

	if ( first < headingRows ) {
		const newRows = last < headingRows ? headingRows - ( last - first + 1 ) : first;

		updateNumericAttribute( 'headingRows', newRows, table, writer, 0 );
	}
}

/**
 * Finds cells that will be:
 * - trimmed - Cells that are "above" removed rows sections and overlap the removed section - their rowspan must be trimmed.
 * - moved - Cells from removed rows section might stick out of. These cells are moved to the next row after a removed section.
 *
 * Sample table with overlapping & sticking out cells:
 *
 *      +----+----+----+----+----+
 *      | 00 | 01 | 02 | 03 | 04 |
 *      +----+    +    +    +    +
 *      | 10 |    |    |    |    |
 *      +----+----+    +    +    +
 *      | 20 | 21 |    |    |    | <-- removed row
 *      +    +    +----+    +    +
 *      |    |    | 32 |    |    | <-- removed row
 *      +----+    +    +----+    +
 *      | 40 |    |    | 43 |    |
 *      +----+----+----+----+----+
 *
 * In a table above:
 * - cells to trim: '02', '03' & '04'.
 * - cells to move: '21' & '32'.
 */
function getCellsToMoveAndTrimOnRemoveRow( table: Element, { first, last }: IndexesObject ) {
	const cellsToMove: CellsToMove = new Map();
	const cellsToTrim: CellsToTrim = [];

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

function moveCellsToRow( table: Element, targetRowIndex: number, cellsToMove: CellsToMove, writer: Writer ) {
	const tableWalker = new TableWalker( table, {
		includeAllSlots: true,
		row: targetRowIndex
	} );

	const tableRowMap = [ ...tableWalker ];
	const row = table.getChild( targetRowIndex )!;

	let previousCell;

	for ( const { column, cell, isAnchor } of tableRowMap ) {
		if ( cellsToMove.has( column ) ) {
			const { cell: cellToMove, rowspan } = cellsToMove.get( column )!;

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

function compareRangeOrder( rangeA: Range, rangeB: Range ) {
	// Since table cell ranges are disjoint, it's enough to check their start positions.
	const posA = rangeA.start;
	const posB = rangeB.start;

	// Checking for equal position (returning 0) is not needed because this would be either:
	// a. Intersecting range (not allowed by model)
	// b. Collapsed range on the same position (allowed by model but should not happen).
	return posA.isBefore( posB ) ? -1 : 1;
}

/**
 * Calculates the area of a maximum rectangle that can span over the provided row & column indexes.
 */
function getBiggestRectangleArea( rows: Set<number>, columns: Set<number> ): number {
	const rowsIndexes = Array.from( rows.values() );
	const columnIndexes = Array.from( columns.values() );

	const lastRow = Math.max( ...rowsIndexes );
	const firstRow = Math.min( ...rowsIndexes );
	const lastColumn = Math.max( ...columnIndexes );
	const firstColumn = Math.min( ...columnIndexes );

	return ( lastRow - firstRow + 1 ) * ( lastColumn - firstColumn + 1 );
}
