/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellhorizontalalignmentcommand
 */

import TableCellPropertyCommand from './tablecellpropertycommand';

/**
 * The table cell horizontal alignment command.
 *
 * The command is registered by {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * `'tableCellHorizontalAlignment'` editor command.
 *
 * To change cell horizontal alignment of the selected cell, execute the command:
 *
 *		editor.execute( 'tableCellHorizontalAlignment', {
 *			value: 'right'
 *		} );
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand
 */
export default class TableCellHorizontalAlignmentCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellHorizontalAlignmentCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'horizontalAlignment' );
	}
}
