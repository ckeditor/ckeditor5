/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablerowresize/commands/tablerowheightscommand
 */

import { Command } from '@ckeditor/ckeditor5-core';
import type { ModelElement } from '@ckeditor/ckeditor5-engine';

import { getUnsetHeightValue, getTableRows, removeRowHeight, setRowHeight } from '../utils.js';

/**
 * Command used by the {@link module:table/tablerowresize~TableRowResize table row resize feature} that updates
 * the heights of the rows of a table.
 *
 * The command is registered by the {@link module:table/tablerowresize/tablerowresizeediting~TableRowResizeEditing}
 * as the `'resizeRowHeights'` editor command.
 *
 * ```ts
 * editor.execute( 'resizeRowHeights', {
 *   table,
 *   rowHeights: [ '40px', null, '80px' ]
 * } );
 * ```
 *
 * To change only some rows, leave the other entries `undefined`, for example `[ , , '80px' ]`.
 */
export class TableRowHeightsCommand extends Command {
	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		// The command is always enabled as it doesn't care about the actual selection - a row can be resized
		// even if the selection is elsewhere.
		this.isEnabled = true;
	}

	/**
	 * Updates the `rowHeight` attribute of the rows of the table. A table height is replaced with the rendered heights
	 * of the rows first, as the rows would not get the heights they are set to otherwise.
	 */
	public override execute( options: TableRowHeightsCommandOptions = {} ): void {
		const { model } = this.editor;
		const {
			table = model.document.selection.getSelectedElement()!,
			rowHeights = [],
			_renderedRowHeights
		} = options;

		const resizePlugin = this.editor.plugins.get( 'TableRowResizeEditing' );
		const unsetCellHeight = getUnsetHeightValue( this.editor, table, 'cell' );

		model.change( writer => {
			resizePlugin._replaceTableHeightWithRowHeights( writer, table, _renderedRowHeights );

			getTableRows( table ).forEach( ( row, index ) => {
				const height = rowHeights[ index ];

				if ( height === undefined ) {
					return;
				}

				if ( height ) {
					setRowHeight( writer, row, height, unsetCellHeight );
				} else {
					removeRowHeight( writer, row, unsetCellHeight );
				}
			} );
		} );
	}
}

export interface TableRowHeightsCommandOptions {

	/**
	 * New heights of the rows, in the order of the rows. A `null` entry removes the height of that row and of the cells
	 * covering it. Rows with an `undefined` entry (including holes and rows beyond the length of the array) are left unchanged.
	 */
	rowHeights?: Array<string | null | undefined>;

	/**
	 * The table that is having the rows resized. Defaults to the selected table.
	 */
	table?: ModelElement;

	/**
	 * The rendered heights of the rows that replace the table height, measured at the start of a drag. When not set, the rows
	 * are measured when the command is executed.
	 *
	 * @internal
	 */
	_renderedRowHeights?: Array<{ modelRow: ModelElement; renderedHeight: string }>;
}
