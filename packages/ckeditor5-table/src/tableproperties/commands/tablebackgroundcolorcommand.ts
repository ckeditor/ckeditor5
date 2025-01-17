/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tableproperties/commands/tablebackgroundcolorcommand
 */

import type { Editor } from 'ckeditor5/src/core.js';
import TablePropertyCommand from './tablepropertycommand.js';

/**
 * The table background color command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBackgroundColor'` editor command.
 *
 * To change the background color of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableBackgroundColor', {
 *   value: '#f00'
 * } );
 * ```
 */
export default class TableBackgroundColorCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableBackgroundColorCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableBackgroundColor', defaultValue );
	}
}
