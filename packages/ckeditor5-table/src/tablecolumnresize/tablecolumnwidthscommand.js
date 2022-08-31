/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/tablecolumnwidthscommand
 */

import TablePropertyCommand from '../tableproperties/commands/tablepropertycommand';

/**
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
 */
export default class TableColumnWidthsCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableColumnWidthsCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value of the attribute.
	 */
	constructor( editor, defaultValue ) {
		super( editor, 'columnWidths', defaultValue );
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		// The command is always enabled as it doesn't care about the actual selection - table can be resized
		// even if the selection is elsewhere.
		this.isEnabled = true;
	}

	/**
	 * Changes the `columnWidths` attribute value for the given or currently selected table.
	 *
	 * @param {Object} options
	 * @param {String} [options.columnWidths] New value of the `columnWidths` attribute.
	 * @param {module:engine/model/element~Element} [options.table] The table that is having the columns resized.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const table = options.table || model.document.selection.getSelectedElement();
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
