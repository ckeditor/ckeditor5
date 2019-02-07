/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/setheadercolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor, updateNumericAttribute } from './utils';

/**
 * The header column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as `'setTableColumnHeader'` editor command.
 *
 * You can make the column containing the selected cell a [header](https://www.w3.org/TR/html50/tabular-data.html#the-th-element)
 * by executing:
 *
 *		editor.execute( 'setTableColumnHeader' );
 *
 * **Note:** All preceding columns will also become headers. If the current column is already a header, executing this command
 * will make it a regular column back again (including the following columns).
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
		const tableCell = findAncestor( 'tableCell', position );

		const isInTable = !!tableCell;

		this.isEnabled = isInTable;

		/**
		 * Flag indicating whether the command is active. The command is active when the
		 * {@link module:engine/model/selection~Selection} is in a header column.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #value
		 */
		this.value = isInTable && this._isInHeading( tableCell, tableCell.parent.parent );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is in a non-header column, the command will set the `headingColumns` table attribute to cover that column.
	 *
	 * When the selection is already in a header column, it will set `headingColumns` so the heading section will end before that column.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;
		const tableUtils = this.editor.plugins.get( 'TableUtils' );

		const position = selection.getFirstPosition();
		const tableCell = findAncestor( 'tableCell', position.parent );
		const tableRow = tableCell.parent;
		const table = tableRow.parent;

		const currentHeadingColumns = parseInt( table.getAttribute( 'headingColumns' ) || 0 );
		const { column: selectionColumn } = tableUtils.getCellLocation( tableCell );

		const headingColumnsToSet = currentHeadingColumns > selectionColumn ? selectionColumn : selectionColumn + 1;

		model.change( writer => {
			updateNumericAttribute( 'headingColumns', headingColumnsToSet, table, writer, 0 );
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
