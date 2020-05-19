/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/setheaderrowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor, updateNumericAttribute } from './utils';
import { getVerticallyOverlappingCells, getRowIndexes, getSelectionAffectedTableCells, splitHorizontally } from '../utils';

/**
 * The header row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'setTableColumnHeader'` editor command.
 *
 * You can make the row containing the selected cell a [header](https://www.w3.org/TR/html50/tabular-data.html#the-th-element) by executing:
 *
 *		editor.execute( 'setTableRowHeader' );
 *
 * **Note:** All preceding rows will also become headers. If the current row is already a header, executing this command
 * will make it a regular row back again (including the following rows).
 *
 * @extends module:core/command~Command
 */
export default class SetHeaderRowCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const selectedCells = getSelectionAffectedTableCells( model.document.selection );
		const isInTable = selectedCells.length > 0;

		this.isEnabled = isInTable;

		/**
		 * Flag indicating whether the command is active. The command is active when the
		 * {@link module:engine/model/selection~Selection} is in a header row.
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
	 * When the selection is in a non-header row, the command will set the `headingRows` table attribute to cover that row.
	 *
	 * When the selection is already in a header row, it will set `headingRows` so the heading section will end before that row.
	 *
	 * @fires execute
	 * @param {Object} options
	 * @param {Boolean} [options.forceValue] If set, the command will set (`true`) or unset (`false`) the header rows according to
	 * the `forceValue` parameter instead of the current model state.
	 */
	execute( options = {} ) {
		if ( options.forceValue === this.value ) {
			return;
		}
		const model = this.editor.model;
		const selectedCells = getSelectionAffectedTableCells( model.document.selection );
		const table = findAncestor( 'table', selectedCells[ 0 ] );

		const { first, last } = getRowIndexes( selectedCells );
		const headingRowsToSet = this.value ? first : last + 1;
		const currentHeadingRows = table.getAttribute( 'headingRows' ) || 0;

		model.change( writer => {
			if ( headingRowsToSet ) {
				// Changing heading rows requires to check if any of a heading cell is overlapping vertically the table head.
				// Any table cell that has a rowspan attribute > 1 will not exceed the table head so we need to fix it in rows below.
				const startRow = headingRowsToSet > currentHeadingRows ? currentHeadingRows : 0;
				const overlappingCells = getVerticallyOverlappingCells( table, headingRowsToSet, startRow );

				for ( const { cell } of overlappingCells ) {
					splitHorizontally( cell, headingRowsToSet, writer );
				}
			}

			updateNumericAttribute( 'headingRows', headingRowsToSet, table, writer, 0 );
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
		const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );

		return !!headingRows && tableCell.parent.index < headingRows;
	}
}
