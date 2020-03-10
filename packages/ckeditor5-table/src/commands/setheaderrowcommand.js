/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/setheaderrowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { createEmptyTableCell, findAncestor, updateNumericAttribute } from './utils';
import { getTableCellsInSelection } from '../tableselection/utils';
import TableWalker from '../tablewalker';

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
		const selectedCells = getTableCellsInSelection( model.document.selection, true );
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
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const position = selection.getFirstPosition();
		const tableCell = findAncestor( 'tableCell', position );
		const tableRow = tableCell.parent;
		const table = tableRow.parent;

		const currentHeadingRows = table.getAttribute( 'headingRows' ) || 0;
		const selectionRow = tableRow.index;

		if ( options.forceValue === this.value ) {
			return;
		}

		const headingRowsToSet = this.value ? selectionRow : selectionRow + 1;

		model.change( writer => {
			if ( headingRowsToSet ) {
				// Changing heading rows requires to check if any of a heading cell is overlapping vertically the table head.
				// Any table cell that has a rowspan attribute > 1 will not exceed the table head so we need to fix it in rows below.
				const cellsToSplit = getOverlappingCells( table, headingRowsToSet, currentHeadingRows );

				for ( const cell of cellsToSplit ) {
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

// Returns cells that span beyond the new heading section.
//
// @param {module:engine/model/element~Element} table The table to check.
// @param {Number} headingRowsToSet New heading rows attribute.
// @param {Number} currentHeadingRows Current heading rows attribute.
// @returns {Array.<module:engine/model/element~Element>}
function getOverlappingCells( table, headingRowsToSet, currentHeadingRows ) {
	const cellsToSplit = [];

	const startAnalysisRow = headingRowsToSet > currentHeadingRows ? currentHeadingRows : 0;
	// We're analyzing only when headingRowsToSet > 0.
	const endAnalysisRow = headingRowsToSet - 1;

	const tableWalker = new TableWalker( table, { startRow: startAnalysisRow, endRow: endAnalysisRow } );

	for ( const { row, rowspan, cell } of tableWalker ) {
		if ( rowspan > 1 && row + rowspan > headingRowsToSet ) {
			cellsToSplit.push( cell );
		}
	}

	return cellsToSplit;
}

// Splits the table cell horizontally.
//
// @param {module:engine/model/element~Element} tableCell
// @param {Number} headingRows
// @param {module:engine/model/writer~Writer} writer
function splitHorizontally( tableCell, headingRows, writer ) {
	const tableRow = tableCell.parent;
	const table = tableRow.parent;
	const rowIndex = tableRow.index;

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) );
	const newRowspan = headingRows - rowIndex;

	const attributes = {};

	const spanToSet = rowspan - newRowspan;

	if ( spanToSet > 1 ) {
		attributes.rowspan = spanToSet;
	}

	const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );

	if ( colspan > 1 ) {
		attributes.colspan = colspan;
	}

	const startRow = table.getChildIndex( tableRow );
	const endRow = startRow + newRowspan;
	const tableMap = [ ...new TableWalker( table, { startRow, endRow, includeSpanned: true } ) ];

	let columnIndex;

	for ( const { row, column, cell, cellIndex } of tableMap ) {
		if ( cell === tableCell && columnIndex === undefined ) {
			columnIndex = column;
		}

		if ( columnIndex !== undefined && columnIndex === column && row === endRow ) {
			const tableRow = table.getChild( row );
			const tableCellPosition = writer.createPositionAt( tableRow, cellIndex );

			createEmptyTableCell( writer, tableCellPosition, attributes );
		}
	}

	// Update the rowspan attribute after updating table.
	updateNumericAttribute( 'rowspan', newRowspan, tableCell, writer );
}
