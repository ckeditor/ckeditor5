/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/setheadercolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { getParentTable, updateNumericAttribute } from './utils';

/**
 * The header coloumn command.
 *
 * @extends module:core/command~Command
 */
export default class SetHeaderColumnCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const position = selection.getFirstPosition();
		const tableParent = getParentTable( position );

		const isInTable = !!tableParent;

		this.isEnabled = isInTable;

		/**
		 * Flag indicating whether the command is active. The command is active when the
		 * {@link module:engine/model/selection~Selection} is in a header column.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #value
		 */
		this.value = isInTable && this._isInHeading( position.parent, tableParent );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is non-header column, the command will set `headingColumns` table's attribute to cover that column.
	 *
	 * When selection is already in a header column then it will set `headingColumns` so the heading section will end before that column.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;
		const tableUtils = this.editor.plugins.get( 'TableUtils' );

		const position = selection.getFirstPosition();
		const tableCell = position.parent;
		const tableRow = tableCell.parent;
		const table = tableRow.parent;

		const currentHeadingColumns = parseInt( table.getAttribute( 'headingColumns' ) || 0 );

		let { column } = tableUtils.getCellLocation( tableCell );

		if ( column + 1 !== currentHeadingColumns ) {
			column++;
		}

		model.change( writer => {
			updateNumericAttribute( 'headingColumns', column, table, writer, 0 );
		} );
	}

	/**
	 * Checks if a table cell is in the heading section.
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @param {module:engine/model/element~Element} table
	 * @returns {Boolean}
	 * @private
	 */
	_isInHeading( tableCell, table ) {
		const headingColumns = parseInt( table.getAttribute( 'headingColumns' ) || 0 );

		const tableUtils = this.editor.plugins.get( 'TableUtils' );

		const { column } = tableUtils.getCellLocation( tableCell );

		return !!headingColumns && column < headingColumns;
	}
}
