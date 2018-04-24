/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/settableheaderscommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { getParentTable } from './utils';

/**
 * The set table headers command.
 *
 * @extends module:core/command~Command
 */
export default class SetTableHeadersCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const tableParent = getParentTable( selection.getFirstPosition() );

		this.isEnabled = !!tableParent;
	}

	/**
	 * Executes the command.
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {Number} [options.rows] Number of rows to set as headers.
	 * @param {Number} [options.columns] Number of columns to set as headers.
	 *
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const rows = parseInt( options.rows ) || 0;
		const columns = parseInt( options.columns ) || 0;

		const table = getParentTable( selection.getFirstPosition() );

		model.change( writer => {
			updateTableAttribute( table, 'headingRows', rows, writer );
			updateTableAttribute( table, 'headingColumns', columns, writer );
		} );
	}
}

// @private
function updateTableAttribute( table, attributeName, newValue, writer ) {
	const currentValue = parseInt( table.getAttribute( attributeName ) || 0 );

	if ( newValue !== currentValue ) {
		if ( newValue > 0 ) {
			writer.setAttribute( attributeName, newValue, table );
		} else {
			writer.removeAttribute( attributeName, table );
		}
	}
}
