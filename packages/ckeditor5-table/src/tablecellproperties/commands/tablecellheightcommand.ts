/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/commands/tablecellheightcommand
 */

import type { Editor } from 'ckeditor5/src/core.js';

import TableCellPropertyCommand from './tablecellpropertycommand.js';
import { addDefaultUnitToNumericValue } from '../../utils/table-properties.js';

/**
 * The table cell height command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellHeight'` editor command.
 *
 * To change the height of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellHeight', {
 *   value: '50px'
 * } );
 * ```
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableCellHeight', {
 *   value: '50'
 * } );
 * ```
 *
 * will set the `height` attribute to `'50px'` in the model.
 */
export default class TableCellHeightCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellHeightCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableCellHeight', defaultValue );
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
