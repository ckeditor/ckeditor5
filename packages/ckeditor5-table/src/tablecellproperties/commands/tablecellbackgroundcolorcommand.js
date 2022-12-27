/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellbackgroundcolorcommand
 */

import TableCellPropertyCommand from './tablecellpropertycommand';

/**
 * The table cell background color command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellBackgroundColor'` editor command.
 *
 * To change the background color of selected cells, execute the command:
 *
 *		editor.execute( 'tableCellBackgroundColor', {
 *			value: '#f00'
 *		} );
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand~TableCellPropertyCommand
 */
export default class TableCellBackgroundColorCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellBackgroundColorCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value of the attribute.
	 */
	constructor( editor, defaultValue ) {
		super( editor, 'tableCellBackgroundColor', defaultValue );
	}
}
