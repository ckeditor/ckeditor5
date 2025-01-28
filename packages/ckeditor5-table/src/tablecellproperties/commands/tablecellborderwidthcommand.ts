/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/commands/tablecellborderwidthcommand
 */

import type { Editor } from 'ckeditor5/src/core.js';
import type { Element } from 'ckeditor5/src/engine.js';

import TableCellPropertyCommand from './tablecellpropertycommand.js';
import { addDefaultUnitToNumericValue, getSingleValue } from '../../utils/table-properties.js';

/**
 * The table cell border width command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellBorderWidth'` editor command.
 *
 * To change the border width of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellBorderWidth', {
 *   value: '5px'
 * } );
 * ```
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableCellBorderWidth', {
 *   value: '5'
 * } );
 * ```
 *
 * will set the `borderWidth` attribute to `'5px'` in the model.
 */
export default class TableCellBorderWidthCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellBorderWidthCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableCellBorderWidth', defaultValue );
	}

	/**
	 * @inheritDoc
	 */
	protected override _getAttribute( tableCell: Element ): unknown {
		if ( !tableCell ) {
			return;
		}

		const value = getSingleValue( tableCell.getAttribute( this.attributeName ) as string );

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}

	/**
	 * @inheritDoc
	 */
	protected override _getValueToSet( value: string | number | undefined ): unknown {
		const newValue = addDefaultUnitToNumericValue( value, 'px' );

		if ( newValue === this._defaultValue ) {
			return;
		}

		return newValue;
	}
}
