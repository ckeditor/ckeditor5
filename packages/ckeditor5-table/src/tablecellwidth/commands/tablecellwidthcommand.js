/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellwidthcommand
 */
import TableCellPropertyCommand from '../../tablecellproperties/commands/tablecellpropertycommand';
import { addDefaultUnitToNumericValue } from '../../utils/table-properties';

/**
 * The table cell width command.
 *
 * The command is registered by the {@link module:table/tablecellwidth/tablecellwidthediting~TableCellWidthEditing} as
 * the `'tableCellWidth'` editor command.
 *
 * To change the width of selected cells, execute the command:
 *
 *		editor.execute( 'tableCellWidth', {
 *			value: '50px'
 *		} );
 *
 * **Note**: This command adds a default `'px'` unit to numeric values. Executing:
 *
 *		editor.execute( 'tableCellWidth', {
 *			value: '50'
 *		} );
 *
 * will set the `width` attribute to `'50px'` in the model.
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand~TableCellPropertyCommand
 */
export default class TableCellWidthCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellWidthCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value of the attribute.
	 */
	constructor( editor, defaultValue ) {
		super( editor, 'tableCellWidth', defaultValue );
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
