/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module
 */

import TableWidthCommand from '../tableproperties/commands/tablewidthcommand';

/**
 * @extends module:table/tableproperties/commands/tablewidthcommand~TableWidthCommand
 */
export default class TableResizeWidthCommand extends TableWidthCommand {
	/**
	 * Creates a new `TableResizeWidthCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value of the attribute.
	 */
	constructor( editor, defaultValue ) {
		super( editor, 'tableWidth', defaultValue );
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
	 * Changes the `tableWidth` and `columnWidths` attribute values for the given or currently selected table.
	 *
	 * @param {Object} options
	 * @param {String} [options.tableWidth] The new table width.
	 * @param {String} [options.columnWidths] The new table column widths.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const table = options.table || model.document.selection.getSelectedElement();
		const { tableWidth, columnWidths } = options;

		model.change( writer => {
			if ( tableWidth ) {
				writer.setAttribute( this.attributeName, tableWidth, table );
				writer.setAttribute( 'columnWidths', columnWidths, table );
			} else {
				writer.removeAttribute( this.attributeName, table );
			}
		} );
	}
}
