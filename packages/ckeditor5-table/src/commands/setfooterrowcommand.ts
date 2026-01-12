/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/commands/setfooterrowcommand
 */

import { Command } from 'ckeditor5/src/core.js';
import type { ModelElement } from 'ckeditor5/src/engine.js';
import { type TableUtils } from '../tableutils.js';

import { getVerticallyOverlappingCells, splitHorizontally } from '../utils/structure.js';

/**
 * The footer row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'setTableFooterRow'` editor command.
 *
 * You can make the row containing the selected cell a footer by executing:
 *
 * ```ts
 * editor.execute( 'setTableFooterRow' );
 * ```
 *
 * **Note:** All following rows will also become footers. If the current row is already a footer, executing this command
 * will make it a regular row back again (including the preceding rows).
 */
export class SetFooterRowCommand extends Command {
	/**
	 * Flag indicating whether the command is active. The command is active when the
	 * {@link module:engine/model/selection~ModelSelection} is in a footer row.
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

		if ( selectedCells.length === 0 ) {
			this.isEnabled = false;
			this.value = false;

			return;
		}

		const table = selectedCells[ 0 ].findAncestor( 'table' )!;

		this.isEnabled = model.schema.checkAttribute( table, 'footerRows' );
		this.value = selectedCells.every( cell => this._isInFooter( cell, table ) );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is in a non-footer row, the command will set the `footerRows` table attribute to cover that row.
	 *
	 * When the selection is already in a footer row, it will set `footerRows` so the footer section will start after that row.
	 *
	 * @fires execute
	 * @param options.forceValue If set, the command will set (`true`) or unset (`false`) the footer rows according to
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
		const totalRows = tableUtils.getRows( table );
		const footerRowsToSet = this.value ? totalRows - ( last + 1 ) : totalRows - first;
		const currentFooterRows = table.getAttribute( 'footerRows' ) as number || 0;

		model.change( writer => {
			if ( footerRowsToSet ) {
				// Changing footer rows requires to check if any of a footer cell is overlapping vertically the table footer.
				const splitRow = totalRows - footerRowsToSet;
				const currentSplitRow = totalRows - currentFooterRows;
				const startRow = splitRow > currentSplitRow ? currentSplitRow : 0;

				const overlappingCells = getVerticallyOverlappingCells( table, splitRow, startRow );

				for ( const { cell } of overlappingCells ) {
					splitHorizontally( cell, splitRow, writer );
				}
			}

			tableUtils.setFooterRowsCount( writer, table, footerRowsToSet );
		} );
	}

	/**
	 * Checks if a table cell is in the footer section.
	 */
	private _isInFooter( tableCell: ModelElement, table: ModelElement ): boolean {
		const footerRows = parseInt( table.getAttribute( 'footerRows' ) as string || '0' );
		const totalRows = this.editor.plugins.get( 'TableUtils' ).getRows( table );
		const rowIndex = ( tableCell.parent as ModelElement ).index!;

		return !!footerRows && rowIndex >= ( totalRows - footerRows );
	}
}
