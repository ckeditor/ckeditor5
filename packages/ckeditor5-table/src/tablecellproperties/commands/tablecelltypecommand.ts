/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/commands/tablecelltypecommand
 */

import type { Editor } from 'ckeditor5/src/core.js';

import { TableCellPropertyCommand } from './tablecellpropertycommand.js';
import { getSelectionAffectedTable } from '../../utils/common.js';

/**
 * The table cell type command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellType'` editor command.
 *
 * To change the type of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellType', {
 *   value: 'header'
 * } );
 * ```
 *
 * The `value` can be either `'header'` or `'data'`.
 */
export class TableCellTypeCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellTypeCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 */
	constructor( editor: Editor ) {
		super( editor, 'tableCellType', 'data' );
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		super.refresh();

		const table = getSelectionAffectedTable( this.editor.model.document.selection );

		if ( this.isEnabled && table && table.getAttribute( 'tableType' ) === 'layout' ) {
			this.isEnabled = false;
		}
	}
}

/**
 * Type of the table cell.
 */
export type TableCellType = 'data' | 'header';

