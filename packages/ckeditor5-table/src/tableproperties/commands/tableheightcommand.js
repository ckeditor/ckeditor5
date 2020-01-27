/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tableheightcommand
 */

import TablePropertyCommand from './tablepropertycommand';

/**
 * The table height command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * `'tableHeight'` editor command.
 *
 * To change height of the selected table, execute the command:
 *
 *		editor.execute( 'tableHeight', {
 *			value: '500px'
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class TableHeightCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableHeightCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'height' );
	}
}
