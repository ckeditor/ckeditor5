/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/inserttablecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import TableUtils from '../tableutils';

/**
 * The insert table command.
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

		const validParent = getInsertTableParent( selection.getFirstPosition() );

		this.isEnabled = schema.checkChild( validParent, 'table' );
	}

	/**
	 * Executes the command.
	 *
	 * Inserts a table with the given number of rows and columns into the editor.
	 *
	 * @param {Object} options
	 * @param {Number} [options.rows=2] The number of rows to create in the inserted table.
	 * @param {Number} [options.columns=2] The number of columns to create in the inserted table.
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const tableUtils = this.editor.plugins.get( TableUtils );

		const rows = parseInt( options.rows ) || 2;
		const columns = parseInt( options.columns ) || 2;

		const firstPosition = selection.getFirstPosition();

		const isRoot = firstPosition.parent === firstPosition.root;
		const insertPosition = isRoot ? Position.createAt( firstPosition ) : Position.createAfter( firstPosition.parent );

		tableUtils.createTable( insertPosition, rows, columns );
	}
}

// Returns valid parent to insert table
//
// @param {module:engine/model/position} position
function getInsertTableParent( position ) {
	const parent = position.parent;

	return parent === parent.root ? parent : parent.parent;
}
