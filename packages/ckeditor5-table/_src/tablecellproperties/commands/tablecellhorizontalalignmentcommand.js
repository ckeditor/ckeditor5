/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellhorizontalalignmentcommand
 */

import TableCellPropertyCommand from './tablecellpropertycommand';

/**
 * The table cell horizontal alignment command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellHorizontalAlignment'` editor command.
 *
 * To change the horizontal text alignment of selected cells, execute the command:
 *
 *		editor.execute( 'tableCellHorizontalAlignment', {
 *			value: 'right'
 *		} );
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand~TableCellPropertyCommand
 */
export default class TableCellHorizontalAlignmentCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellHorizontalAlignmentCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value for the "alignment" attribute.
	 */
	constructor( editor, defaultValue ) {
		super( editor, 'tableCellHorizontalAlignment', defaultValue );
	}
}
