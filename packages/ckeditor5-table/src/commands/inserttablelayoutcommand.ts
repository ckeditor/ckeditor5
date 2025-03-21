/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/commands/inserttablelayoutcommand
 */

import { Command } from 'ckeditor5/src/core.js';

import type {
	DocumentSelection,
	Schema,
	Selection,
	Element
} from 'ckeditor5/src/engine.js';

import type TableUtils from '../tableutils.js';
import type TableWidthsCommand from '../../src/tablecolumnresize/tablewidthscommand.js';

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
export default class InsertTableLayoutCommand extends Command {
	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const schema = model.schema;

		this.isEnabled = isAllowedInParent( selection, schema );
	}

	/**
	 * Executes the command.
	 *
	 * Inserts a layout table with the given number of rows and columns into the editor.
	 *
	 * @param options.rows The number of rows to create in the inserted table. Default value is 2.
	 * @param options.columns The number of columns to create in the inserted table. Default value is 2.
	 * @fires execute
	 */
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
			const normalizedOptions = { rows: options.rows || 2, columns: options.columns || 2 };
			const table = tableUtils.createTable( writer, normalizedOptions );

			writer.setAttribute( 'tableType', 'layout', table );

			model.insertObject( table, null, null, { findOptimalPosition: 'auto' } );

			const singleColumnWidth = `${ 100 / normalizedOptions.columns! }%`;
			const columnWidths = Array( normalizedOptions.columns ).fill( singleColumnWidth );
			const tableWidthsCommand: TableWidthsCommand = editor.commands.get( 'resizeColumnWidths' )!;

			// Make the table full-width with equal columns width.
			tableWidthsCommand.execute( { tableWidth: '100%', columnWidths, table } );

			writer.setSelection( writer.createPositionAt( table.getNodeByPath( [ 0, 0, 0 ] ), 0 ) );
		} );
	}
}

/**
 * Checks if the table is allowed in the parent.
 */
function isAllowedInParent( selection: Selection | DocumentSelection, schema: Schema ) {
	const positionParent = selection.getFirstPosition()!.parent;
	const validParent = positionParent === positionParent.root ? positionParent : positionParent.parent;

	return schema.checkChild( validParent as Element, 'table' );
}
