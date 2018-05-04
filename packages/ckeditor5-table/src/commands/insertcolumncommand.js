/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/insertcolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { getParentTable } from './utils';
import TableUtils from '../tableutils';

/**
 * The insert column command.
 *
 * @extends module:core/command~Command
 */
export default class InsertColumnCommand extends Command {
	/**
	 * Creates a new `InsertRowCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 * @param {Object} options
	 * @param {String} [options.order="after"] The order of insertion relative to a column in which caret is located.
	 * Possible values: "after" and "before".
	 */
	constructor( editor, options = {} ) {
		super( editor );

		/**
		 * The order of insertion relative to a column in which caret is located.
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

		const tableParent = getParentTable( selection.getFirstPosition() );

		this.isEnabled = !!tableParent;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const tableUtils = editor.plugins.get( TableUtils );

		const table = getParentTable( selection.getFirstPosition() );
		const tableCell = selection.getFirstPosition().parent;

		const { column } = tableUtils.getCellLocation( tableCell );
		const insertAt = this.order === 'after' ? column + 1 : column;

		tableUtils.insertColumns( table, { columns: 1, at: insertAt } );
	}
}
