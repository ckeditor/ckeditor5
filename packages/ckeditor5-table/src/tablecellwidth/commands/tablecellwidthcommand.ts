/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellwidthcommand
 */

import type { Editor } from 'ckeditor5/src/core';

import TableCellPropertyCommand from '../../tablecellproperties/commands/tablecellpropertycommand';
import { addDefaultUnitToNumericValue } from '../../utils/table-properties';

/**
 * The table cell width command.
 *
 * The command is registered by the {@link module:table/tablecellwidth/tablecellwidthediting~TableCellWidthEditing} as
 * the `'tableCellWidth'` editor command.
 *
 * To change the width of selected cells, execute the command:
 *
 *		editor.execute( 'tableCellWidth', {
 *			value: '50px'
 *		} );
 *
 * **Note**: This command adds a default `'px'` unit to numeric values. Executing:
 *
 *		editor.execute( 'tableCellWidth', {
 *			value: '50'
 *		} );
 *
 * will set the `width` attribute to `'50px'` in the model.
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand~TableCellPropertyCommand
 */
export default class TableCellWidthCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellWidthCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableCellWidth', defaultValue );
	}

	/**
	 * @inheritDoc
	 */
	public override _getValueToSet( value: string ): string | undefined {
		value = addDefaultUnitToNumericValue( value, 'px' ) as string;

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface CommandsMap {
		tableCellWidth: TableCellWidthCommand;
	}
}
