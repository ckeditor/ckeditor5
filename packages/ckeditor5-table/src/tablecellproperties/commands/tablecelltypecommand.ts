/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/commands/tablecelltypecommand
 */

import type { Editor } from 'ckeditor5/src/core.js';
import type { ModelElement, ModelWriter } from 'ckeditor5/src/engine.js';

import { TableUtils } from '../../tableutils.js';
import {
	TableCellPropertyCommand,
	type TableCellPropertyCommandAfterExecuteEvent
} from './tablecellpropertycommand.js';

import { groupCellsByTable, isEntireCellsLineHeader } from '../utils.js';

/**
 * The table cell type command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellType'` editor command.
 *
 * To change the type of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellType', {
 *   value: 'header'
 * } );
 * ```
 *
 * The `value` can be either `'header'` or `'data'`.
 */
export class TableCellTypeCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellTypeCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 */
	constructor( editor: Editor ) {
		super( editor, 'tableCellType', 'data' );

		this.on<TableCellPropertyCommandAfterExecuteEvent>( 'afterExecute', ( _, data ) => {
			const { writer, tableCells, valueToSet } = data;
			const tableUtils = this.editor.plugins.get( TableUtils );

			switch ( valueToSet ) {
				// If changing cell type to 'header', increment headingRows/headingColumns if entire row/column is of header type.
				case 'header':
					adjustHeadingAttributesWhenChangingToHeader( tableUtils, writer, tableCells );
					break;

				// If changing cell type to 'data', decrement headingRows/headingColumns
				// if at least one row/column is no longer of header type.
				default:
					adjustHeadingAttributesWhenChangingToData( tableUtils, writer, tableCells );
					break;
			}
		} );
	}
}

/**
 * Type of the table cell.
 */
export type TableCellType = 'data' | 'header';

/**
 * Increments the `headingRows` and `headingColumns` attributes of the tables
 * containing the given table cells being changed to `header` cell type,
 * but only if the entire row/column is of header type and the heading attributes
 * are directly preceding the changed cell.
 *
 * ```
 * +---+---+---+                   +---+---+---+
 * | H | H | H |                   | H | H | H |
 * +===+===+===+                   +---+---+---+
 * | D | D | D |   change cells    | H | H | H |
 * +---+---+---+   to 'header'     +===+===+===+  <-- headingRows incremented
 * | D | D | D |   ----------->    | D | D | D |
 * +---+---+---+                   +---+---+---+
 *
 * headingRows: 1                  headingRows: 2
 * ```
 */
function adjustHeadingAttributesWhenChangingToHeader(
	tableUtils: TableUtils,
	writer: ModelWriter,
	tableCells: Array<ModelElement>
): void {
	const tablesMap = groupCellsByTable( tableCells );

	// Process each table.
	for ( const [ table, cells ] of tablesMap ) {
		const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
		const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

		const tableRowCount = tableUtils.getRows( table );
		const tableColumnCount = tableUtils.getColumns( table );

		// Track which rows and columns were changed.
		const changedRowsSet = new Set<number>();
		const changedColumnsSet = new Set<number>();

		for ( const cell of cells ) {
			const { row, column } = tableUtils.getCellLocation( cell );

			changedRowsSet.add( row );
			changedColumnsSet.add( column );
		}

		// Check if we should increment headingRows.
		// We only increment if the changed row index equals the current headingRows value.
		if (
			changedRowsSet.has( headingRows ) &&
			headingRows < tableRowCount &&
			isEntireCellsLineHeader( { table, row: headingRows } )
		) {
			tableUtils.setHeadingRowsCount( writer, table, headingRows + 1, {
				updateCellType: false
			} );
		}

		// Check if we should increment headingColumns.
		// We only increment if the changed column index equals the current headingColumns value.
		if (
			changedColumnsSet.has( headingColumns ) &&
			headingColumns < tableColumnCount &&
			isEntireCellsLineHeader( { table, column: headingColumns } )
		) {
			tableUtils.setHeadingColumnsCount( writer, table, headingColumns + 1, {
				updateCellType: false
			} );
		}
	}
}

/**
 * Decrements the `headingRows` and `headingColumns` attributes of the tables
 * containing the given table cells being changed to `data` cell type.
 *
 * ```
 * +---+---+---+                   +---+---+---+
 * | H | H | H |                   | H | H | H |
 * +---+---+---+   change cell     +===+===+===+
 * | H | H | H |   to 'data'       | H | D | H |  <-- headingRows decremented
 * +===+===+===+   ----------->    +---+---+---+
 * | D | D | D |                   | D | D | D |
 * +---+---+---+                   +---+---+---+
 *
 * headingRows: 2                  headingRows: 1
 * ```
 */
function adjustHeadingAttributesWhenChangingToData(
	tableUtils: TableUtils,
	writer: ModelWriter,
	tableCells: Array<ModelElement>
): void {
	const tablesMap = groupCellsByTable( tableCells );

	// Process each table.
	for ( const [ table, cells ] of tablesMap ) {
		const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
		const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

		if ( headingRows === 0 && headingColumns === 0 ) {
			continue;
		}

		let minHeadingRow = headingRows;
		let minHeadingColumn = headingColumns;

		// Check each cell being changed to 'data'
		for ( const cell of cells ) {
			const { row, column } = tableUtils.getCellLocation( cell );

			minHeadingRow = Math.min( minHeadingRow, headingRows, row );
			minHeadingColumn = Math.min( minHeadingColumn, headingColumns, column );
		}

		// Update headingRows if necessary.
		if ( minHeadingRow < headingRows ) {
			tableUtils.setHeadingRowsCount( writer, table, minHeadingRow, { updateCellType: false } );
		}

		// Update headingColumns if necessary.
		if ( minHeadingColumn < headingColumns ) {
			tableUtils.setHeadingColumnsCount( writer, table, minHeadingColumn, { updateCellType: false } );
		}
	}
}
