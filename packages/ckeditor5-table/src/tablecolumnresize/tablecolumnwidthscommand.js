/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module
 */

import TablePropertyCommand from '../tableproperties/commands/tablepropertycommand';

/**
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
 */
export default class TableColumnWidths extends TablePropertyCommand {
	/**
	 * Creates a new `TableColumnWidths` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value of the attribute.
	 */
	constructor( editor, defaultValue ) {
		super( editor, 'columnWidths', defaultValue );
	}

	execute( options = {} ) {
		const editor = this.editor;
		const model = editor.model;

		const { columnWidths, batch } = options;

		const table = options.table || model.document.selection.getSelectedElement();

		model.enqueueChange( batch, writer => {
			if ( columnWidths ) {
				writer.setAttribute( this.attributeName, columnWidths, table );
			} else {
				writer.removeAttribute( this.attributeName, table );
			}
		} );
	}

	refresh() {
		this.isEnabled = true;
	}
}
