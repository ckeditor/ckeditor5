/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablelayout/commands/tabletypecommand
 */

import { Command } from 'ckeditor5/src/core.js';

import { getSelectionAffectedTable } from '../../utils/common.js';
import type { TableType } from '../../tableconfig.js';

/**
 * The set table type command.
 *
 * The command is registered by {@link module:table/tablelayout/tablelayoutediting~TableLayoutEditing}
 * as the `'tableType'` editor command.
 *
 * To set the table type at the current selection, execute the command and specify the table type:
 *
 * ```ts
 * editor.execute( 'tableType', 'layout' );
 * ```
 */
export default class TableTypeCommand extends Command {
	/**
	 * The table type of selected table.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: TableType | null;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedTable = getSelectionAffectedTable( selection );

		if ( selectedTable ) {
			this.isEnabled = true;
			this.value = selectedTable.getAttribute( 'tableType' ) as TableType;
		} else {
			this.isEnabled = false;
			this.value = null;
		}
	}

	/**
	 * Executes the command.
	 *
	 * Set table type by the given table type parameter.
	 *
	 * @param tableType The type of table it should become.
	 * @fires execute
	 */
	public override execute( tableType: TableType ): void {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;
		const table = getSelectionAffectedTable( selection );
		const currentTableType = table.getAttribute( 'tableType' );

		if ( currentTableType === tableType ) {
			return;
		}

		model.change( writer => {
			writer.setAttribute( 'tableType', tableType, table );

			model.schema.removeDisallowedAttributes( [ table ], writer );

			const tableChildren = table.getChildren();

			// Check if all children are allowed for the new table type.
			for ( const child of tableChildren ) {
				if ( !model.schema.checkChild( table, child ) ) {
					writer.remove( child );
				}
			}
		} );
	}
}
