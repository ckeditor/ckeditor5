/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellborderwidthcommand
 */

import { addDefaultUnitToNumericValue, getSingleValue } from '../../commands/utils';
import TableCellPropertyCommand from './tablecellpropertycommand';

/**
 * The table cell border width command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * `'tableCellBorderWidth'` editor command.
 *
 * To change the border width of selected cells, execute the command:
 *
 *		editor.execute( 'tableCellBorderWidth', {
 *			value: '5px'
 *		} );
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 *		editor.execute( 'tableCellBorderWidth', {
 *			value: '5'
 *		} );
 *
 * will set the `borderWidth` attribute to `'5px'` in the model.
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand~TableCellPropertyCommand
 */
export default class TableCellBorderWidthCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellBorderWidthCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'borderWidth' );
	}

	/**
	 * @inheritDoc
	 */
	_getAttribute( tableCell ) {
		if ( !tableCell ) {
			return;
		}

		return getSingleValue( tableCell.getAttribute( this.attributeName ) );
	}

	/**
	 * @inheritDoc
	 */
	_getValueToSet( value ) {
		return addDefaultUnitToNumericValue( value, 'px' );
	}
}
