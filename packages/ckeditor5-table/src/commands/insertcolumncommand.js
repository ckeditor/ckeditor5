/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/insertcolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findAncestor } from './utils';
import TableUtils from '../tableutils';

/**
 * The insert column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as `'insertTableColumnBefore'` and
 * `'insertTableColumnAfter'` editor commands.
 *
 * To insert a column before the selected cell, execute the following command:
 *
 *		editor.execute( 'insertTableColumnBefore' );
 *
 * To insert a column after the selected cell, execute the following command:
 *
 *		editor.execute( 'insertTableColumnAfter' );
 *
 * @extends module:core/command~Command
 */
export default class InsertColumnCommand extends Command {
	/**
	 * Creates a new `InsertColumnCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor on which this command will be used.
	 * @param {Object} options
	 * @param {String} [options.order="after"] The order of insertion relative to the column in which the caret is located.
	 * Possible values: `"after"` and `"before"`.
	 */
	constructor( editor, options = {} ) {
		super( editor );

		/**
		 * The order of insertion relative to the column in which the caret is located.
		 *
		 * @readonly
		 * @member {String} module:table/commands/insertcolumncommand~InsertColumnCommand#order
		 */
		this.order = options.order || 'after';
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const selection = this.editor.model.document.selection;

		const tableParent = findAncestor( 'table', selection.getFirstPosition() );

		this.isEnabled = !!tableParent;
	}

	/**
	 * Executes the command.
	 *
	 * Depending on the command's {@link #order} value, it inserts a column `'before'` or `'after'` the column in which the selection is
	 * set.
	 *
	 * @fires execute
	 */
	execute() {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const tableUtils = editor.plugins.get( TableUtils );

		const firstPosition = selection.getFirstPosition();

		const tableCell = findAncestor( 'tableCell', firstPosition );
		const table = tableCell.parent.parent;

		const { column } = tableUtils.getCellLocation( tableCell );
		const insertAt = this.order === 'after' ? column + 1 : column;

		tableUtils.insertColumns( table, { columns: 1, at: insertAt } );
	}
}
