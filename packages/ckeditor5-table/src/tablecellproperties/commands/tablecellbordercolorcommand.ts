/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellbordercolorcommand
 */

import type { Element } from 'ckeditor5/src/engine';
import type { Editor } from 'ckeditor5/src/core';

import TableCellPropertyCommand from './tablecellpropertycommand';
import { getSingleValue } from '../../utils/table-properties';

/**
 * The table cell border color command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellBorderColor'` editor command.
 *
 * To change the border color of selected cells, execute the command:
 *
 *		editor.execute( 'tableCellBorderColor', {
 *			value: '#f00'
 *		} );
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand~TableCellPropertyCommand
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
	public override _getAttribute( tableCell: Element ): string | undefined {
		if ( !tableCell ) {
			return;
		}

		const value = getSingleValue( tableCell.getAttribute( this.attributeName ) );

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface CommandsMap {
		tableCellBorderColor: TableCellBorderColorCommand;
	}
}
