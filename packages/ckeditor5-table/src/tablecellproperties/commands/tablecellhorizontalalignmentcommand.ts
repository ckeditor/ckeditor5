/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/commands/tablecellhorizontalalignmentcommand
 */

import type { Editor } from 'ckeditor5/src/core.js';

import TableCellPropertyCommand from './tablecellpropertycommand.js';

/**
 * The table cell horizontal alignment command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellHorizontalAlignment'` editor command.
 *
 * To change the horizontal text alignment of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellHorizontalAlignment', {
 *  value: 'right'
 * } );
 * ```
 */
export default class TableCellHorizontalAlignmentCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellHorizontalAlignmentCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value for the "alignment" attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableCellHorizontalAlignment', defaultValue );
	}
}
