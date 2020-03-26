/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellwidthcommand
 */

import { addDefaultUnitToNumericValue } from '../../commands/utils';
import TableCellPropertyCommand from './tablecellpropertycommand';

/**
 * The table cell width command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
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
	 */
	constructor( editor ) {
		super( editor, 'width' );
	}

	/**
	 * @inheritDoc
	 */
	_getValueToSet( value ) {
		return addDefaultUnitToNumericValue( value, 'px' );
	}
}
