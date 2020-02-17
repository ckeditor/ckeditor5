/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tableheightcommand
 */

import TablePropertyCommand from './tablepropertycommand';
import { addDefaultUnitToNumericValue } from '../../commands/utils';

/**
 * The table height command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * `'tableHeight'` editor command.
 *
 * To change height of the selected table, execute the command:
 *
 *		editor.execute( 'tableHeight', {
 *			value: '500px'
 *		} );
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 *		editor.execute( 'tableHeight', {
 *			value: '50'
 *		} );
 *
 * Will set the `height` attribute to `'50px'` in the model.
 *
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
 */
export default class TableHeightCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableHeightCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'height' );
	}

	/**
	 * @inheritDoc
	 */
	_getValueToSet( value ) {
		return addDefaultUnitToNumericValue( value, 'px' );
	}
}
