/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tablebordercolorcommand
 */

import type { Element } from 'ckeditor5/src/engine';
import type { Editor } from 'ckeditor5/src/core';

import TablePropertyCommand from './tablepropertycommand';
import { getSingleValue } from '../../utils/table-properties';

/**
 * The table border color command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderColor'` editor command.
 *
 * To change the border color of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableBorderColor', {
 *   value: '#f00'
 * } );
 * ```
 */
export default class TableBorderColorCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableBorderColorCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableBorderColor', defaultValue );
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
