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

	execute( options = {} ) {
		const editor = this.editor;
		const model = editor.model;

		const { tableWidth, batch, columnWidths } = options;

		const table = options.table || model.document.selection.getSelectedElement();

		model.enqueueChange( batch, writer => {
			if ( tableWidth ) {
				writer.setAttribute( this.attributeName, tableWidth, table );
				writer.setAttribute( 'columnWidths', columnWidths, table );
			} else {
				writer.removeAttribute( this.attributeName, table );
			}
		} );
	}

	refresh() {
		this.isEnabled = true;
	}
}
