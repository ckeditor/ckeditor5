/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellwidth/commands/tablecellwidthcommand
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
 * ```ts
 * editor.execute( 'tableCellWidth', {
 *   value: '50px'
 * } );
 * ```
 *
 * **Note**: This command adds a default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableCellWidth', {
 *   value: '50'
 * } );
 * ```
 *
 * will set the `width` attribute to `'50px'` in the model.
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
	public override _getValueToSet( value: string | number | undefined ): unknown {
		value = addDefaultUnitToNumericValue( value, 'px' );

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}
}
