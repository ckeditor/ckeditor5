/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/inserttablecommand
 */

import { Command } from 'ckeditor5/src/core';

/**
 * The insert table command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'insertTable'` editor command.
 *
 * To insert a table at the current selection, execute the command and specify the dimensions:
 *
 *		editor.execute( 'insertTable', { rows: 20, columns: 5 } );
 *
 * @extends module:core/command~Command
 */
export default class InsertTableCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
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
	 * @param {Object} options
	 * @param {Number} [options.rows=2] The number of rows to create in the inserted table.
	 * @param {Number} [options.columns=2] The number of columns to create in the inserted table.
	 * @param {Number} [options.headingRows] The number of heading rows.
	 * If not provided it will default to {@link module:table/table~TableConfig#defaultHeadings `config.table.defaultHeadings.rows`}
	 * table config.
	 * @param {Number} [options.headingColumns] The number of heading columns.
	 * If not provided it will default to {@link module:table/table~TableConfig#defaultHeadings `config.table.defaultHeadings.columns`}
	 * table config.
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const tableUtils = this.editor.plugins.get( 'TableUtils' );
		const config = this.editor.config.get( 'table' );

		const defaultRows = config.defaultHeadings.rows;
		const defaultColumns = config.defaultHeadings.columns;

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

// Checks if the table is allowed in the parent.
//
// @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
// @param {module:engine/model/schema~Schema} schema
// @returns {Boolean}
function isAllowedInParent( selection, schema ) {
	const positionParent = selection.getFirstPosition().parent;
	const validParent = positionParent === positionParent.root ? positionParent : positionParent.parent;

	return schema.checkChild( validParent, 'table' );
}
