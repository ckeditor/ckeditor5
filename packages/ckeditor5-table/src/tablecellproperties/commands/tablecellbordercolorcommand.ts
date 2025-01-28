/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/commands/tablecellbordercolorcommand
 */

import type { Element } from 'ckeditor5/src/engine.js';
import type { Editor } from 'ckeditor5/src/core.js';

import TableCellPropertyCommand from './tablecellpropertycommand.js';
import { getSingleValue } from '../../utils/table-properties.js';

/**
 * The table cell border color command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellBorderColor'` editor command.
 *
 * To change the border color of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellBorderColor', {
 *   value: '#f00'
 * } );
 * ```
 */
export default class TableCellBorderColorCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellBorderColorCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableCellBorderColor', defaultValue );
	}

	/**
	 * @inheritDoc
	 */
	protected override _getAttribute( tableCell: Element ): unknown {
		if ( !tableCell ) {
			return;
		}

		const value = getSingleValue( tableCell.getAttribute( this.attributeName ) as string | undefined );

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}
}
