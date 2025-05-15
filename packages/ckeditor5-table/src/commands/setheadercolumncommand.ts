/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/commands/setheadercolumncommand
 */

import { Command } from 'ckeditor5/src/core.js';
import type TableUtils from '../tableutils.js';

import {
	isHeadingColumnCell,
	updateNumericAttribute
} from '../utils/common.js';
import { getHorizontallyOverlappingCells, splitVertically } from '../utils/structure.js';

/**
 * The header column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'setTableColumnHeader'` editor command.
 *
 * You can make the column containing the selected cell a [header](https://www.w3.org/TR/html50/tabular-data.html#the-th-element)
 * by executing:
 *
 * ```ts
 * editor.execute( 'setTableColumnHeader' );
 * ```
 *
 * **Note:** All preceding columns will also become headers. If the current column is already a header, executing this command
 * will make it a regular column back again (including the following columns).
 */
export default class SetHeaderColumnCommand extends Command {
	/**
	 * Flag indicating whether the command is active. The command is active when the
	 * {@link module:engine/model/selection~Selection} is in a header column.
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

		this.isEnabled = model.schema.checkAttribute( table, 'headingColumns' );
		this.value = selectedCells.every( cell => isHeadingColumnCell( tableUtils, cell ) );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is in a non-header column, the command will set the `headingColumns` table attribute to cover that column.
	 *
	 * When the selection is already in a header column, it will set `headingColumns` so the heading section will end before that column.
	 *
	 * @fires execute
	 * @param options.forceValue If set, the command will set (`true`) or unset (`false`) the header columns according to
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

		const { first, last } = tableUtils.getColumnIndexes( selectedCells );
		const headingColumnsToSet = this.value ? first : last + 1;

		model.change( writer => {
			if ( headingColumnsToSet ) {
				// Changing heading columns requires to check if any of a heading cell is overlapping horizontally the table head.
				// Any table cell that has a colspan attribute > 1 will not exceed the table head so we need to fix it in columns before.
				const overlappingCells = getHorizontallyOverlappingCells( table, headingColumnsToSet );

				for ( const { cell, column } of overlappingCells ) {
					splitVertically( cell, column, headingColumnsToSet, writer );
				}
			}

			updateNumericAttribute( 'headingColumns', headingColumnsToSet, table, writer, 0 );
		} );
	}
}
