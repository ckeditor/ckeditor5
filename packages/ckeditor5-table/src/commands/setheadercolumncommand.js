/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/setheadercolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { updateNumericAttribute } from './utils';
import { getTableCellsInSelection } from '../tableselection/utils';

/**
 * The header column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'setTableColumnHeader'` editor command.
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
		const selectedCells = getTableCellsInSelection( model.document.selection, true );
		const isInTable = selectedCells.length > 0;

		this.isEnabled = isInTable;

		/**
		 * Flag indicating whether the command is active. The command is active when the
		 * {@link module:engine/model/selection~Selection} is in a header column.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #value
		 */
		this.value = isInTable && selectedCells.every( cell => this._isInHeading( cell, cell.parent.parent ) );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is in a non-header column, the command will set the `headingColumns` table attribute to cover that column.
	 *
	 * When the selection is already in a header column, it will set `headingColumns` so the heading section will end before that column.
	 *
	 * @fires execute
	 * @param {Object} [options]
	 * @param {Boolean} [options.forceValue] If set, the command will set (`true`) or unset (`false`) the header columns according to
	 * the `forceValue` parameter instead of the current model state.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const tableUtils = this.editor.plugins.get( 'TableUtils' );

		const selectedCells = getTableCellsInSelection( model.document.selection, true );
		const firstCell = selectedCells[ 0 ];
		const lastCell = selectedCells[ selectedCells.length - 1 ];
		const tableRow = firstCell.parent;
		const table = tableRow.parent;

		const [ selectedColumnMin, selectedColumnMax ] =
			// Returned cells might not necessary be in order, so make sure to sort it.
			[ tableUtils.getCellLocation( firstCell ).column, tableUtils.getCellLocation( lastCell ).column ].sort();

		if ( options.forceValue === this.value ) {
			return;
		}

		const headingColumnsToSet = this.value ? selectedColumnMin : selectedColumnMax + 1;

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
