/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellpaddingcommand
 */

import TableCellPropertyCommand from './tablecellpropertycommand';
import { addDefaultUnitToNumericValue, getSingleValue } from '../../utils/table-properties';

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
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand~TableCellPropertyCommand
 */
export default class TableCellPaddingCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellPaddingCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value of the attribute.
	 */
	constructor( editor, defaultValue ) {
		super( editor, 'tableCellPadding', defaultValue );
	}

	/**
	 * @inheritDoc
	 */
	_getAttribute( tableCell ) {
		if ( !tableCell ) {
			return;
		}

		const value = getSingleValue( tableCell.getAttribute( this.attributeName ) );

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
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
