/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tablealignmentcommand
 */

import type { Editor } from 'ckeditor5/src/core';
import TablePropertyCommand from './tablepropertycommand';

/**
 * The table alignment command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableAlignment'` editor command.
 *
 * To change the alignment of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableAlignment', {
 *   value: 'right'
 * } );
 * ```
 */
export default class TableAlignmentCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableAlignmentCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value for the "alignment" attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableAlignment', defaultValue );
	}
}
