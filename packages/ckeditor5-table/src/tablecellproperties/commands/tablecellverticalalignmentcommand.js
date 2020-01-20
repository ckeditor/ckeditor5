/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellverticalalignmentcommand
 */

import TableCellPropertyCommand from './tablecellpropertycommand';

/**
 * The table cell vertical alignment command.
 *
 * The command is registered by {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * `'tableCellVerticalAlignment'` editor command.
 *
 * To change cell vertical alignment of the selected cell, execute the command:
 *
 *		editor.execute( 'tableCellVerticalAlignment', {
 *			value: 'top'
 *		} );
 *
 * The editor UI allows to set those attributes from
 * [a `vertical-align` CSS attribute](https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align):
 *
 * * `'top'`
 * * `'bottom'`
 * * `'middle'`
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand
 */
export default class TableCellVerticalAlignmentCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellVerticalAlignmentCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'verticalAlignment' );
	}
}
