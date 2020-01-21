/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellwidthcommand
 */

import TableCellPropertyCommand from './tablecellpropertycommand';

/**
 * The table cell width command.
 *
 * The command is registered by {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * `'tableCellWidth'` editor command.
 *
 * To change cell width of the selected cell, execute the command:
 *
 *		editor.execute( 'tableCellWidth', {
 *			value: '50px'
 *		} );
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand
 */
export default class TableCellWidthCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellWidthCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'width' );
	}
}
