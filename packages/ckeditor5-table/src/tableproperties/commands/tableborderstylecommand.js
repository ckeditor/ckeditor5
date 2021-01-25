/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tableborderstylecommand
 */

import TablePropertyCommand from './tablepropertycommand';
import { getSingleValue } from '../../utils/table-properties';

/**
 * The table style border command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderStyle'` editor command.
 *
 * To change the border style of the selected table, execute the command:
 *
 *		editor.execute( 'tableBorderStyle', {
 *			value: 'dashed'
 *		} );
 *
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
 */
export default class TableBorderStyleCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableBorderStyleCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'borderStyle' );
	}

	/**
	 * @inheritDoc
	 */
	_getValue( table ) {
		if ( !table ) {
			return;
		}

		return getSingleValue( table.getAttribute( this.attributeName ) );
	}
}
