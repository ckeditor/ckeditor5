/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/insertrowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { getParentTable } from './utils';
import TableUtils from '../tableutils';

/**
 * The insert row command.
 *
 * @extends module:core/command~Command
 */
export default class InsertRowCommand extends Command {
	/**
	 * Creates a new `InsertRowCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 * @param {Object} options
	 * @param {String} [options.order="below"] The order of insertion relative to a row in which caret is located.
	 * Possible values: "above" and "below".
	 */
	constructor( editor, options = {} ) {
		super( editor );

		/**
		 * The order of insertion relative to a row in which caret is located.
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

		const tableParent = getParentTable( selection.getFirstPosition() );

		this.isEnabled = !!tableParent;
	}

	/**
	 * Executes the command.
	 *
	 * Depending on command's {@link #order} value it inserts a row `'below'` or `'above'` the row in which selection is set.
	 *
	 * @fires execute
	 */
	execute() {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const tableUtils = editor.plugins.get( TableUtils );

		const tableCell = selection.getFirstPosition().parent;
		const table = getParentTable( selection.getFirstPosition() );

		const row = table.getChildIndex( tableCell.parent );
		const insertAt = this.order === 'below' ? row + 1 : row;

		tableUtils.insertRows( table, { rows: 1, at: insertAt } );
	}
}
