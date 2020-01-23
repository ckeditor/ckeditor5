/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tablewidthcommand
 */

import TablePropertyCommand from './tablepropertycommand';

/**
 * The table width command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * `'tableWidth'` editor command.
 *
 * To change width of the selected table, execute the command:
 *
 *		editor.execute( 'tableWidth', {
 *			value: '400px'
 *		} );
 *
 * @extends module:table/tableproperties/commands/tablepropertycommand
 */
export default class TableWidthCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableWidthCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'width' );
	}
}
