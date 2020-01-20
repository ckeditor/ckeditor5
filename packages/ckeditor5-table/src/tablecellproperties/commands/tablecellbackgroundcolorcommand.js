/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellbackgroundcolorcommand
 */

import TableCellPropertyCommand from './tablecellpropertycommand';

/**
 * The table cell background color command.
 *
 * The command is registered by {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * `'tableCellBackgroundColor'` editor command.
 *
 * To change cell `backgroundColor` attribute of the selected cells, execute the command:
 *
 *		editor.execute( 'tableCellBackgroundColor', {
 *			value: '#f00'
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class TableCellBackgroundColorCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellBackgroundColorCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'backgroundColor' );
	}
}
