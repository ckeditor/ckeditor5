/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/insertcolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import TableWalker from '../tablewalker';
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
	 * @param {String} [options.location="after"] Where to insert new row - relative to current row. Possible values: "after", "before".
	 */
	constructor( editor, options = {} ) {
		super( editor );

		this.direction = options.location || 'after';
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

		const table = getParentTable( selection.getFirstPosition() );

		const element = doc.selection.getFirstPosition().parent;
		const rowIndex = table.getChildIndex( element.parent );

		let columnIndex;

		for ( const tableWalkerValue of new TableWalker( table, { startRow: rowIndex, endRow: rowIndex } ) ) {
			if ( tableWalkerValue.cell === element ) {
				columnIndex = tableWalkerValue.column;
			}
		}

		const insertAt = this.direction === 'after' ? columnIndex + 1 : columnIndex;

		const tableUtils = editor.plugins.get( TableUtils );

		tableUtils.insertColumns( table, { columns: 1, at: insertAt } );
	}
}
