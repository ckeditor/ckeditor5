/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tablewidthcommand
 */

import TablePropertyCommand from './tablepropertycommand';
import { addDefaultUnitToNumericValue } from '../../utils/table-properties';

/**
 * The table width command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableWidth'` editor command.
 *
 * To change the width of the selected table, execute the command:
 *
 *		editor.execute( 'tableWidth', {
 *			value: '400px'
 *		} );
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 *		editor.execute( 'tableWidth', {
 *			value: '50'
 *		} );
 *
 * will set the `width` attribute to `'50px'` in the model.
 *
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
 */
export default class TableWidthCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableWidthCommand` instance.
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
	_getValueToSet( value ) {
		value = addDefaultUnitToNumericValue( value, 'px' );

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}
}
