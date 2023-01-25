/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/tablecolumnwidthscommand
 */

import type { Editor } from 'ckeditor5/src/core';
import TablePropertyCommand, { type TablePropertyCommandExecuteOptions } from '../tableproperties/commands/tablepropertycommand';

/**
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
 */
export default class TableColumnWidthsCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableColumnWidthsCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, defaultValue?: string | undefined ) {
		super( editor, 'columnWidths', defaultValue );
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		// The command is always enabled as it doesn't care about the actual selection - table can be resized
		// even if the selection is elsewhere.
		this.isEnabled = true;
	}

	/**
	 * Changes the `columnWidths` attribute value for the given or currently selected table.
	 *
	 * @param options.columnWidths New value of the `columnWidths` attribute.
	 * @param options.table The table that is having the columns resized.
	 */
	public override execute( options: TablePropertyCommandExecuteOptions = {} ): void {
		const model = this.editor.model;
		const table = options.table || model.document.selection.getSelectedElement()!;
		const { columnWidths } = options;

		model.change( writer => {
			if ( columnWidths ) {
				writer.setAttribute( this.attributeName, columnWidths, table );
			} else {
				writer.removeAttribute( this.attributeName, table );
			}
		} );
	}
}
