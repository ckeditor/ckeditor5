/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecolumnresize/commands/tablecolumnwidthcommand
 */

import { Command } from '@ckeditor/ckeditor5-core';
import type { Batch } from '@ckeditor/ckeditor5-engine';

import { type TableUtils } from '../../tableutils.js';
import { addDefaultUnitToNumericValue } from '../../utils/table-properties.js';
import { type TableColumnResizeEditing } from '../tablecolumnresizeediting.js';
import { removeCellWidthsFromTable } from '../utils.js';

/**
 * The table column width command.
 *
 * The command is registered by the {@link module:table/tablecolumnresize/tablecolumnresizeediting~TableColumnResizeEditing}
 * as the `'tableColumnWidth'` editor command.
 *
 * It sets the width of every column covered by the selected cells (keeping the whole table's width mode consistent),
 * so the change actually takes effect in a resized table - where a per-cell width would be shadowed by the column
 * group. The command is enabled whenever the selection maps onto the columns of a resized, regular table.
 *
 * ```ts
 * editor.execute( 'tableColumnWidth', {
 *   value: '150px'
 * } );
 * ```
 *
 * **Note**: This command adds a default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableColumnWidth', {
 *   value: '150'
 * } );
 * ```
 *
 * will set the column width to `'150px'`.
 */
export class TableColumnWidthCommand extends Command {
	/**
	 * The width of the first column covered by the selection, or `null` when the selection does not map onto table
	 * columns (for example when there is no cell selected or the table is not resized).
	 *
	 * @readonly
	 * @observable
	 */
	public declare value: string | null;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;
		const tableUtils: TableUtils = editor.plugins.get( 'TableUtils' );
		const tableColumnResize = editor.plugins.get( 'TableColumnResizeEditing' ) as TableColumnResizeEditing;
		const tableCells = tableUtils.getSelectionAffectedTableCells( editor.model.document.selection );
		const columns = tableColumnResize.getColumnIndexesForCells( tableCells );

		if ( !columns ) {
			this.isEnabled = false;
			this.value = null;

			return;
		}

		this.isEnabled = true;

		// When the selection covers columns of different widths, the field reflects the first one.
		this.value = tableColumnResize
			.getTableColumnElements( columns.table )[ columns.columnIndexes[ 0 ] ]
			.getAttribute( 'columnWidth' ) as string;
	}

	/**
	 * @inheritDoc
	 */
	public override execute( options: { value?: string | number; batch?: Batch } = {} ): void {
		const editor = this.editor;
		const model = editor.model;
		const tableUtils: TableUtils = editor.plugins.get( 'TableUtils' );
		const tableColumnResize = editor.plugins.get( 'TableColumnResizeEditing' ) as TableColumnResizeEditing;
		const value = addDefaultUnitToNumericValue( options.value, 'px' ) as string | undefined;
		const tableCells = tableUtils.getSelectionAffectedTableCells( model.document.selection );
		const columns = tableColumnResize.getColumnIndexesForCells( tableCells );

		// A non-numeric value (for example untrimmed whitespace) must not reach the model as `NaN%` / `NaNpx`.
		if ( !value || !columns || Number.isNaN( parseFloat( value ) ) ) {
			return;
		}

		model.enqueueChange( options.batch, writer => {
			tableColumnResize.applyColumnWidths( writer, columns.table, columns.columnIndexes, value );

			// A per-cell width is now obsolete (the column width governs the layout), so drop it from the whole table.
			removeCellWidthsFromTable( writer, columns.table );
		} );
	}
}
