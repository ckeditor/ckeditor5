/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module
 */

import TablePropertyCommand from '@ckeditor/ckeditor5-table/src/tableproperties/commands/tablepropertycommand';

/**
*
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
		const model = this.editor.model;

		const { value, batch, table } = options;
		delete options.table;

		const valueToSet = this._getValueToSet( value );

		model.enqueueChange( batch, writer => {
			if ( valueToSet ) {
				writer.setAttribute( this.attributeName, valueToSet, table );
			} else {
				writer.removeAttribute( this.attributeName, table );
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	_getValueToSet( value ) {
		return value;
	}

	refresh() {
		this.isEnabled = true;
	}
}
