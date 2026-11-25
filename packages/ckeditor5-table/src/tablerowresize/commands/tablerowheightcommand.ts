/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablerowresize/commands/tablerowheightcommand
 */

import { Command } from '@ckeditor/ckeditor5-core';
import type { Batch, ModelElement } from '@ckeditor/ckeditor5-engine';

import { type TableUtils } from '../../tableutils.js';
import {
	getUnsetHeightValue,
	getRowEdgesIndexes,
	getTableRows,
	isEmptyHeightValue,
	removeRowHeight,
	setRowHeight,
	toRowHeightInPixels
} from '../utils.js';

/**
 * The table row height command.
 *
 * The command is registered by the {@link module:table/tablerowresize/tablerowresizeediting~TableRowResizeEditing}
 * as the `'tableRowHeight'` editor command.
 *
 * It sets the height of the rows of the selected cells. For a cell spanning several rows, it is the last of them (the one
 * that dragging the bottom edge of the cell resizes). The height is stored in pixels, and a value in another unit is ignored.
 *
 * ```ts
 * editor.execute( 'tableRowHeight', {
 *   value: '50px'
 * } );
 * ```
 *
 * **Note**: This command adds a default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableRowHeight', {
 *   value: '50'
 * } );
 * ```
 *
 * will set the row height to `'50px'`. An empty value removes the row height, together with the heights of the cells
 * covering the row, so the row gets the height its content requires.
 */
export class TableRowHeightCommand extends Command {
	/**
	 * The height of the row of the first selected cell (for a cell spanning several rows, the last of them). When the row
	 * has no height, it is the height of the first selected cell, as the cell height field shows it without the row resize
	 * feature. It is `null` when neither of them has a height, or there is no cell selected.
	 *
	 * @readonly
	 * @observable
	 */
	declare public value: string | null;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const tableUtils: TableUtils = this.editor.plugins.get( 'TableUtils' );
		const cells = tableUtils.getSelectionAffectedTableCells( this.editor.model.document.selection );
		const rows = this._getSelectedRows( cells );

		this.isEnabled = !!rows.length;

		if ( !rows.length ) {
			this.value = null;

			return;
		}

		const rowHeight = rows[ 0 ].getAttribute( 'rowHeight' ) as string | undefined;
		const cellHeight = cells[ 0 ].getAttribute( 'tableCellHeight' ) as string | undefined;

		if ( rowHeight ) {
			this.value = rowHeight;
		} else if ( cellHeight && cellHeight !== 'auto' ) {
			// A row without a height shows the cell height. A cell height of `auto` only overrides a default one, so it is not shown.
			this.value = cellHeight;
		} else {
			this.value = null;
		}
	}

	/**
	 * Executes the command.
	 *
	 * @param options.value The new row height. A numeric value gets the `'px'` unit. An empty value (also only whitespace)
	 * removes the height of the row and of the cells covering it.
	 * @param options.batch The batch to make the change in.
	 */
	public override execute( options: { value?: string | number; batch?: Batch } = {} ): void {
		const tableUtils: TableUtils = this.editor.plugins.get( 'TableUtils' );
		const rows = this._getSelectedRows( tableUtils.getSelectionAffectedTableCells( this.editor.model.document.selection ) );
		const { value } = options;

		const resizePlugin = this.editor.plugins.get( 'TableRowResizeEditing' );
		// The command is enabled only when cells are selected, and all of them are in the same table.
		const table = rows[ 0 ].parent as ModelElement;
		const unsetCellHeight = getUnsetHeightValue( this.editor, table, 'cell' );

		if ( isEmptyHeightValue( value ) ) {
			this.editor.model.enqueueChange( options.batch, writer => {
				resizePlugin._replaceTableHeightWithRowHeights( writer, table );

				for ( const row of rows ) {
					// The cell heights go too, as the command value shows a cell height when the row has none.
					removeRowHeight( writer, row, unsetCellHeight );
				}
			} );

			return;
		}

		const height = toRowHeightInPixels( value! );

		if ( !height ) {
			return;
		}

		this.editor.model.enqueueChange( options.batch, writer => {
			resizePlugin._replaceTableHeightWithRowHeights( writer, table );

			for ( const row of rows ) {
				setRowHeight( writer, row, height, unsetCellHeight );
			}
		} );
	}

	/**
	 * Returns the rows of the selected cells. For a cell spanning several rows it is the last of them, the one whose bottom
	 * edge is the bottom edge of the cell - the same row that dragging that edge resizes.
	 *
	 * Returns no rows when the cells are in different tables (such a selection can only be set through the API).
	 */
	private _getSelectedRows( cells: Array<ModelElement> ): Array<ModelElement> {
		const tableUtils: TableUtils = this.editor.plugins.get( 'TableUtils' );

		if ( !cells.length ) {
			return [];
		}

		const table = cells[ 0 ].findAncestor( 'table' )!;

		if ( cells.some( cell => cell.findAncestor( 'table' ) !== table ) ) {
			return [];
		}

		const tableRows = getTableRows( table );
		const rows = new Set( cells.map( cell => tableRows[ getRowEdgesIndexes( cell, tableUtils ).bottomEdge ] ) );

		return Array.from( rows );
	}
}
