/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tableproperties/commands/tableborderstylecommand
 */

import type { Element } from 'ckeditor5/src/engine.js';

import TablePropertyCommand from './tablepropertycommand.js';
import { getSingleValue } from '../../utils/table-properties.js';
import type { Editor } from 'ckeditor5/src/core.js';

/**
 * The table style border command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderStyle'` editor command.
 *
 * To change the border style of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableBorderStyle', {
 *   value: 'dashed'
 * } );
 * ```
 */
export default class TableBorderStyleCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableBorderStyleCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableBorderStyle', defaultValue );
	}

	/**
	 * @inheritDoc
	 */
	protected override _getValue( table: Element ): unknown {
		if ( !table ) {
			return;
		}

		const value = getSingleValue( table.getAttribute( this.attributeName ) as string );

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}
}
