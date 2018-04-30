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
	 * @param {String} [options.location="below"] Where to insert new row - relative to current row. Possible values: "above", "below".
	 */
	constructor( editor, options = {} ) {
		super( editor );

		this.direction = options.location || 'below';
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		const tableParent = getParentTable( doc.selection.getFirstPosition() );

		this.isEnabled = !!tableParent;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const element = doc.selection.getFirstPosition().parent;

		const table = getParentTable( selection.getFirstPosition() );

		const tableUtils = editor.plugins.get( TableUtils );

		const rowIndex = table.getChildIndex( element.parent );

		const insertAt = this.direction === 'below' ? rowIndex + 1 : rowIndex;

		tableUtils.insertRow( table, { rows: 1, at: insertAt } );
	}
}
