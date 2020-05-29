/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/insertrowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { getRowIndexes, getSelectionAffectedTableCells } from '../utils/selection';
import { findAncestor } from '../utils/common';

/**
 * The insert row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'insertTableRowBelow'` and
 * `'insertTableRowAbove'` editor commands.
 *
 * To insert a row below the selected cell, execute the following command:
 *
 *		editor.execute( 'insertTableRowBelow' );
 *
 * To insert a row above the selected cell, execute the following command:
 *
 *		editor.execute( 'insertTableRowAbove' );
 *
 * @extends module:core/command~Command
 */
export default class InsertRowCommand extends Command {
	/**
	 * Creates a new `InsertRowCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor on which this command will be used.
	 * @param {Object} options
	 * @param {String} [options.order="below"] The order of insertion relative to the row in which the caret is located.
	 * Possible values: `"above"` and `"below"`.
	 */
	constructor( editor, options = {} ) {
		super( editor );

		/**
		 * The order of insertion relative to the row in which the caret is located.
		 *
		 * @readonly
		 * @member {String} module:table/commands/insertrowcommand~InsertRowCommand#order
		 */
		this.order = options.order || 'below';
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
	 * Depending on the command's {@link #order} value, it inserts a row `'below'` or `'above'` the row in which selection is set.
	 *
	 * @fires execute
	 */
	execute() {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const tableUtils = editor.plugins.get( 'TableUtils' );
		const insertAbove = this.order === 'above';

		const affectedTableCells = getSelectionAffectedTableCells( selection );
		const rowIndexes = getRowIndexes( affectedTableCells );

		const row = insertAbove ? rowIndexes.first : rowIndexes.last;
		const table = findAncestor( 'table', affectedTableCells[ 0 ] );

		tableUtils.insertRows( table, { at: insertAbove ? row : row + 1, copyStructureFromAbove: !insertAbove } );
	}
}
