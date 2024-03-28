/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/resizecolumncommand
 */

import { Command } from 'ckeditor5/src/core.js';

/**
 * The resize table column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'resizeColumn'` editor command.
 *
 * To resize selected column, execute the command :
 *
 * ```ts
 * editor.execute( 'resizeColumn', { width: 0.25 } );
 * ```
 */
export default class TableResizeColumnCommand extends Command {
	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const selection = this.editor.model.document.selection;
		const tableUtils = this.editor.plugins.get( 'TableUtils' );
		const isAnyCellSelected = !!tableUtils.getSelectionAffectedTableCells( selection ).length;

		this.isEnabled = isAnyCellSelected;
	}

	/**
	 * Executes the command.
	 *
	 * Inserts a table with the given number of rows and columns into the editor.
	 *
	 * @param options.width Normalized percentage value of width of new table column. Example: 0.25
	 * @fires execute
	 */
	public override execute(
		options: {
			width?: number;
		} = {}
	): void {
		console.info( options );
	}
}
