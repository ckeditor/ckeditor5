/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellpaddingcommand
 */

import { addDefaultUnitToNumericValue, getSingleValue } from '../../commands/utils';
import TableCellPropertyCommand from './tablecellpropertycommand';

/**
 * The table cell padding command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellPadding'` editor command.
 *
 * To change the padding of selected cells, execute the command:
 *
 *		editor.execute( 'tableCellPadding', {
 *			value: '5px'
 *		} );
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 *		editor.execute( 'tableCellPadding', {
 *			value: '5'
 *		} );
 *
 * will set the `padding` attribute to `'5px'` in the model.
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand
 */
export default class TableCellPaddingCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellPaddingCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'padding' );
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
