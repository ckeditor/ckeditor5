/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellpaddingcommand
 */

import TableCellPropertyCommand from './tablecellpropertycommand';
import { getSingleValue } from '../../commands/utils';

/**
 * The table cell padding command.
 *
 * The command is registered by {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * `'tableCellPadding'` editor command.
 *
 * To change cell padding of the selected cell, execute the command:
 *
 *		editor.execute( 'tableCellPadding', {
 *			value: '5px'
 *		} );
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand
 */
export default class TableCellPaddingCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellPaddingCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'padding' );
	}

	/**
	 * @inheritDoc
	 */
	_getAttribute( tableCell ) {
		if ( !tableCell ) {
			return;
		}

		return getSingleValue( tableCell.getAttribute( this.attributeName ) );
	}
}
