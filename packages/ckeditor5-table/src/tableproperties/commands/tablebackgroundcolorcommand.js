/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tablebackgroundcolorcommand
 */

import TablePropertyCommand from './tablepropertycommand';

/**
 * The table background color command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBackgroundColor'` editor command.
 *
 * To change the background color of the selected table, execute the command:
 *
 *		editor.execute( 'tableBackgroundColor', {
 *			value: '#f00'
 *		} );
 *
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
 */
export default class TableBackgroundColorCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableBackgroundColorCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'backgroundColor' );
	}
}
