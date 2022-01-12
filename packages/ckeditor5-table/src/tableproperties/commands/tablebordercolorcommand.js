/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tablebordercolorcommand
 */

import TablePropertyCommand from './tablepropertycommand';
import { getSingleValue } from '../../utils/table-properties';

/**
 * The table border color command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderColor'` editor command.
 *
 * To change the border color of the selected table, execute the command:
 *
 *		editor.execute( 'tableBorderColor', {
 *			value: '#f00'
 *		} );
 *
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
 */
export default class TableBorderColorCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableBorderColorCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value of the attribute.
	 */
	constructor( editor, defaultValue ) {
		super( editor, 'tableBorderColor', defaultValue );
	}

	/**
	 * @inheritDoc
	 */
	_getValue( table ) {
		if ( !table ) {
			return;
		}

		const value = getSingleValue( table.getAttribute( this.attributeName ) );

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}
}
