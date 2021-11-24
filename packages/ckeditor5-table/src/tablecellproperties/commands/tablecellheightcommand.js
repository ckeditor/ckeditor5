/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellheightcommand
 */

import TableCellPropertyCommand from './tablecellpropertycommand';
import { addDefaultUnitToNumericValue } from '../../utils/table-properties';

/**
 * The table cell height command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellHeight'` editor command.
 *
 * To change the height of selected cells, execute the command:
 *
 *		editor.execute( 'tableCellHeight', {
 *			value: '50px'
 *		} );
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 *		editor.execute( 'tableCellHeight', {
 *			value: '50'
 *		} );
 *
 * will set the `height` attribute to `'50px'` in the model.
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand~TableCellPropertyCommand
 */
export default class TableCellHeightCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellHeightCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value of the attribute.
	 */
	constructor( editor, defaultValue ) {
		super( editor, 'tableCellHeight', defaultValue );
	}

	/**
	 * @inheritDoc
	 */
	_getValueToSet( value ) {
		value = addDefaultUnitToNumericValue( value, 'px' );

		if ( value === this._defaultValue ) {
			return null;
		}

		return value;
	}
}
