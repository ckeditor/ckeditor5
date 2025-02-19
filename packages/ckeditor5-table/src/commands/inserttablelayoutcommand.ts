/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/commands/inserttablelayoutcommand
 */

import InsertTableCommand from './inserttablecommand.js';
import type TableUtils from '../tableutils.js';

/**
 * The insert table layout command.
 *
 * The command is registered by {@link module:table/tablelayout/tablelayoutediting~TableLayoutEditing}
 * as the `'insertTableLayout'` editor command.
 *
 * To insert a layout table at the current selection, execute the command and specify the dimensions:
 *
 * ```ts
 * editor.execute( 'insertTableLayout', { rows: 20, columns: 5 } );
 * ```
 */
export default class InsertTableLayoutCommand extends InsertTableCommand {
	public override execute(
		options: {
			rows?: number;
			columns?: number;
		} = {}
	): void {
		const editor = this.editor;
		const model = editor.model;
		const tableUtils: TableUtils = editor.plugins.get( 'TableUtils' );

		model.change( writer => {
			const table = tableUtils.createTableLayout( writer, options );

			model.insertObject( table, null, null, { findOptimalPosition: 'auto' } );

			writer.setSelection( writer.createPositionAt( table.getNodeByPath( [ 0, 0, 0 ] ), 0 ) );
		} );
	}
}
