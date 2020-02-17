/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellbordercolorcommand
 */

import TableCellPropertyCommand from './tablecellpropertycommand';
import { getSingleValue } from '../../commands/utils';

/**
 * The table cell border color command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * `'tableCellBorderColor'` editor command.
 *
 * To change the border color of selected cells, execute the command:
 *
 *		editor.execute( 'tableCellBorderColor', {
 *			value: '#f00'
 *		} );
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand~TableCellPropertyCommand
 */
export default class TableCellBorderColorCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellBorderWidthCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'borderColor' );
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
