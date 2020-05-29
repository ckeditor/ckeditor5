/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/insertcolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findAncestor } from './utils';
import { getColumnIndexes, getSelectionAffectedTableCells } from '../utils/utils';

/**
 * The insert column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'insertTableColumnLeft'` and
 * `'insertTableColumnRight'` editor commands.
 *
 * To insert a column to the left of the selected cell, execute the following command:
 *
 *		editor.execute( 'insertTableColumnLeft' );
 *
 * To insert a column to the right of the selected cell, execute the following command:
 *
 *		editor.execute( 'insertTableColumnRight' );
 *
 * @extends module:core/command~Command
 */
export default class InsertColumnCommand extends Command {
	/**
	 * Creates a new `InsertColumnCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor on which this command will be used.
	 * @param {Object} options
	 * @param {String} [options.order="right"] The order of insertion relative to the column in which the caret is located.
	 * Possible values: `"left"` and `"right"`.
	 */
	constructor( editor, options = {} ) {
		super( editor );

		/**
		 * The order of insertion relative to the column in which the caret is located.
		 *
		 * @readonly
		 * @member {String} module:table/commands/insertcolumncommand~InsertColumnCommand#order
		 */
		this.order = options.order || 'right';
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
	 * Depending on the command's {@link #order} value, it inserts a column to the `'left'` or `'right'` of the column
	 * in which the selection is set.
	 *
	 * @fires execute
	 */
	execute() {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const tableUtils = editor.plugins.get( 'TableUtils' );
		const insertBefore = this.order === 'left';

		const affectedTableCells = getSelectionAffectedTableCells( selection );
		const columnIndexes = getColumnIndexes( affectedTableCells );

		const column = insertBefore ? columnIndexes.first : columnIndexes.last;
		const table = findAncestor( 'table', affectedTableCells[ 0 ] );

		tableUtils.insertColumns( table, { columns: 1, at: insertBefore ? column : column + 1 } );
	}
}
