/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tableborderwidthcommand
 */

import { addDefaultUnitToNumericValue, getSingleValue } from '../../commands/utils';
import TablePropertyCommand from './tablepropertycommand';

/**
 * The table width border command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderWidth'` editor command.
 *
 * To change the border width of the selected table, execute the command:
 *
 *		editor.execute( 'tableBorderWidth', {
 *			value: '5px'
 *		} );
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 *		editor.execute( 'tableBorderWidth', {
 *			value: '5'
 *		} );
 *
 * will set the `borderWidth` attribute to `'5px'` in the model.
 *
 * @extends module:table/tableproperties/commands/tablepropertycommand
 */
export default class TableBorderWidthCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableBorderWidthCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'borderWidth' );
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

	/**
	 * @inheritDoc
	 */
	_getValueToSet( value ) {
		return addDefaultUnitToNumericValue( value, 'px' );
	}
}
