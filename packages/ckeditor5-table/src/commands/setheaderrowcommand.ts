/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/setheaderrowcommand
 */

import { Command } from 'ckeditor5/src/core';
import type { Element } from 'ckeditor5/src/engine';
import type TableUtils from '../tableutils';

import { updateNumericAttribute } from '../utils/common';
import { getVerticallyOverlappingCells, splitHorizontally } from '../utils/structure';

/**
 * The header row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'setTableColumnHeader'` editor command.
 *
 * You can make the row containing the selected cell a [header](https://www.w3.org/TR/html50/tabular-data.html#the-th-element) by executing:
 *
 * ```ts
 * editor.execute( 'setTableRowHeader' );
 * ```
 *
 * **Note:** All preceding rows will also become headers. If the current row is already a header, executing this command
 * will make it a regular row back again (including the following rows).
 */
export default class SetHeaderRowCommand extends Command {
	/**
	 * Flag indicating whether the command is active. The command is active when the
	 * {@link module:engine/model/selection~Selection} is in a header row.
	 *
	 * @observable
	 */
	public declare value: boolean;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const tableUtils: TableUtils = this.editor.plugins.get( 'TableUtils' );
		const model = this.editor.model;
		const selectedCells = tableUtils.getSelectionAffectedTableCells( model.document.selection );
		const isInTable = selectedCells.length > 0;

		this.isEnabled = isInTable;
		this.value = isInTable && selectedCells.every( cell => this._isInHeading( cell, cell.parent!.parent as Element ) );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is in a non-header row, the command will set the `headingRows` table attribute to cover that row.
	 *
	 * When the selection is already in a header row, it will set `headingRows` so the heading section will end before that row.
	 *
	 * @fires execute
	 * @param options.forceValue If set, the command will set (`true`) or unset (`false`) the header rows according to
	 * the `forceValue` parameter instead of the current model state.
	 */
	public override execute( options: { forceValue?: boolean } = {} ): void {
		if ( options.forceValue === this.value ) {
			return;
		}

		const tableUtils: TableUtils = this.editor.plugins.get( 'TableUtils' );
		const model = this.editor.model;

		const selectedCells = tableUtils.getSelectionAffectedTableCells( model.document.selection );
		const table = selectedCells[ 0 ].findAncestor( 'table' )!;

		const { first, last } = tableUtils.getRowIndexes( selectedCells );
		const headingRowsToSet = this.value ? first : last + 1;
		const currentHeadingRows = table.getAttribute( 'headingRows' ) as number || 0;

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
	 */
	private _isInHeading( tableCell: Element, table: Element ): boolean {
		const headingRows = parseInt( table.getAttribute( 'headingRows' ) as string || '0' );

		return !!headingRows && ( tableCell.parent as Element ).index! < headingRows;
	}
}
