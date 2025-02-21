/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/commands/inserttablecommand
 */

import InsertTableCommand from './inserttablecommand.js';
import type TableUtils from '../tableutils.js';

// TODO: This command will be implemented in the PR with editing part.
export default class InsertTableLayoutCommand extends InsertTableCommand {
	public override execute(
		options: {
			rows?: number;
			columns?: number;
		}
	): void {
		const editor = this.editor;
		const model = editor.model;
		const tableUtils: TableUtils = editor.plugins.get( 'TableUtils' );

		model.change( writer => {
			const table = tableUtils.createTable( writer, options );

			model.insertObject( table, null, null, { findOptimalPosition: 'auto' } );

			writer.setSelection( writer.createPositionAt( table.getNodeByPath( [ 0, 0, 0 ] ), 0 ) );
		} );
	}
}
