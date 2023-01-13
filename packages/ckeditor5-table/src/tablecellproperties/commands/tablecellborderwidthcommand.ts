/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellborderwidthcommand
 */

import type { Editor } from 'ckeditor5/src/core';
import type { Element } from 'ckeditor5/src/engine';

import TableCellPropertyCommand from './tablecellpropertycommand';
import { addDefaultUnitToNumericValue, getSingleValue } from '../../utils/table-properties';

/**
 * The table cell border width command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellBorderWidth'` editor command.
 *
 * To change the border width of selected cells, execute the command:
 *
 *		editor.execute( 'tableCellBorderWidth', {
 *			value: '5px'
 *		} );
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 *		editor.execute( 'tableCellBorderWidth', {
 *			value: '5'
 *		} );
 *
 * will set the `borderWidth` attribute to `'5px'` in the model.
 *
 * @extends module:table/tablecellproperties/commands/tablecellpropertycommand~TableCellPropertyCommand
 */
export default class TableCellBorderWidthCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellBorderWidthCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableCellBorderWidth', defaultValue );
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

	/**
	 * @inheritDoc
	 */
	public override _getValueToSet( value?: string ): string | undefined {
		value = addDefaultUnitToNumericValue( value, 'px' );

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface CommandsMap {
		tableCellBorderWidth: TableCellBorderWidthCommand;
	}
}
