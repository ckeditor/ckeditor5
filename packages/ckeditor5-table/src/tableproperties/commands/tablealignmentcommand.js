/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tablealignmentcommand
 */

import TablePropertyCommand from './tablepropertycommand';

/**
 * The table alignment command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableAlignment'` editor command.
 *
 * To change the alignment of the selected table, execute the command:
 *
 *		editor.execute( 'tableAlignment', {
 *			value: 'right'
 *		} );
 *
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
 */
export default class TableAlignmentCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableAlignmentCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value for the "alignment" attribute.
	 */
	constructor( editor, defaultValue ) {
		super( editor, 'tableAlignment', defaultValue );
	}
}
