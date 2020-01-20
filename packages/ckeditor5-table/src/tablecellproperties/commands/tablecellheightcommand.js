/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellheightcommand
 */

import TableCellPropertyCommand from './tablecellpropertycommand';

/**
 * The table cell height command.
 *
 * The command is registered by {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * `'tableCellHeight'` editor command.
 *
 * To change cell height of the selected cell, execute the command:
 *
 *		editor.execute( 'tableCellHeight', {
 *			value: '5px'
 *		} );
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand
 */
export default class TableCellHeightCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellHeightCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'height' );
	}
}
