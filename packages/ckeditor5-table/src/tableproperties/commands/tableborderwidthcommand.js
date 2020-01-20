/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tableborderwidthcommand
 */

import TablePropertyCommand from './tablepropertycommand';
import { getSingleValue } from '../../commands/utils';

/**
 * The table width border command.
 *
 * The command is registered by {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * `'tableBorderWidth'` editor command.
 *
 * To change border of the selected , execute the command:
 *
 *		editor.execute( 'tableBorderWidth', {
 *			value: '5px'
 *		} );
 *
 * @extends module:table/tableproperties/commands/tablepropertycommand
 */
export default class TableBorderWidthCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableBorderWidthCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'borderWidth' );
	}

	/**
	 * @inheritDoc
	 */
	_getValue( table ) {
		if ( !table ) {
			return;
		}

		return getSingleValue( table.getAttribute( this.attributeName ) );
	}
}
