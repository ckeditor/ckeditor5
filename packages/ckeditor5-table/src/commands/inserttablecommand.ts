/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/commands/inserttablecommand
 */

import { Command } from 'ckeditor5/src/core.js';

import type {
	DocumentSelection,
	Schema,
	Selection,
	Element
} from 'ckeditor5/src/engine.js';
import type TableUtils from '../tableutils.js';

/**
 * The insert table command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'insertTable'` editor command.
 *
 * To insert a table at the current selection, execute the command and specify the dimensions:
 *
 * ```ts
 * editor.execute( 'insertTable', { rows: 20, columns: 5 } );
 * ```
 */
export default class InsertTableCommand extends Command {
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
	 * Inserts a table with the given number of rows and columns into the editor.
	 *
	 * @param options.rows The number of rows to create in the inserted table. Default value is 2.
	 * @param options.columns The number of columns to create in the inserted table. Default value is 2.
	 * @param options.headingRows The number of heading rows. If not provided it will default to
	 * {@link module:table/tableconfig~TableConfig#defaultHeadings `config.table.defaultHeadings.rows`} table config.
	 * @param options.headingColumns The number of heading columns. If not provided it will default to
	 * {@link module:table/tableconfig~TableConfig#defaultHeadings `config.table.defaultHeadings.columns`} table config.
	 * @fires execute
	 */
	public override execute(
		options: {
			rows?: number;
			columns?: number;
			headingRows?: number;
			headingColumns?: number;
		} = {}
	): void {
		const editor = this.editor;
		const model = editor.model;
		const tableUtils: TableUtils = editor.plugins.get( 'TableUtils' );

		const defaultRows = editor.config.get( 'table.defaultHeadings.rows' );
		const defaultColumns = editor.config.get( 'table.defaultHeadings.columns' );

		if ( options.headingRows === undefined && defaultRows ) {
			options.headingRows = defaultRows;
		}

		if ( options.headingColumns === undefined && defaultColumns ) {
			options.headingColumns = defaultColumns;
		}

		model.change( writer => {
			const table = tableUtils.createTable( writer, options );

			model.insertObject( table, null, null, { findOptimalPosition: 'auto' } );

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
