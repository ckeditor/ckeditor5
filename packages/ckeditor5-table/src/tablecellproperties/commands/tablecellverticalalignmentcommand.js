/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellverticalalignmentcommand
 */

import TableCellPropertyCommand from './tablecellpropertycommand';

/**
 * The table cell vertical alignment command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellVerticalAlignment'` editor command.
 *
 * To change the vertical text alignment of selected cells, execute the command:
 *
 *		editor.execute( 'tableCellVerticalAlignment', {
 *			value: 'top'
 *		} );
 *
 * The following values, corresponding to the
 * [`vertical-align` CSS attribute](https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align), are allowed:
 *
 * * `'top'`
 * * `'bottom'`
 *
 * The `'middle'` value is the default one so there is no need to set it.
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand~TableCellPropertyCommand
 */
export default class TableCellVerticalAlignmentCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellVerticalAlignmentCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value for the "alignment" attribute.
	 */
	constructor( editor, defaultValue ) {
		super( editor, 'tableCellVerticalAlignment', defaultValue );
	}
}
