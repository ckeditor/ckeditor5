/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablelayout/commands/settabletype
 */

import { Command } from 'ckeditor5/src/core.js';
import type { Element } from 'ckeditor5/src/engine.js';

import { getSelectionAffectedTable } from '../../utils/common.js';

export type TableType = 'layout' | 'content';

/**
 * The set table type command.
 *
 * The command is registered by {@link module:table/tablelayout/tablelayoutediting~TableLayoutEditing}
 * as the `'setTableType'` editor command.
 *
 * To set the table type at the current selection, execute the command and specify the table type:
 *
 * ```ts
 * editor.execute( 'setTableType', 'layout' );
 * ```
 */
export default class SetTableType extends Command {
	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;

		this.isEnabled = !!getSelectionAffectedTable( selection );
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
			const newTable = writer.createElement( 'table' );

			writer.setAttribute( 'tableType', tableType, newTable );

			const tableChildren = table.getChildren();

			for ( const child of tableChildren ) {
				if ( model.schema.checkChild( newTable, child ) ) {
					writer.append( writer.cloneElement( child as Element ), newTable );
				}
			}

			writer.insert( newTable, table, 'after' );
			writer.remove( table );
		} );
	}
}
