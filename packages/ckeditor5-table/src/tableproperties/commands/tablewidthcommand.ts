/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tablewidthcommand
 */

import TablePropertyCommand from './tablepropertycommand';
import { addDefaultUnitToNumericValue } from '../../utils/table-properties';
import type { Editor } from 'ckeditor5/src/core';

/**
 * The table width command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableWidth'` editor command.
 *
 * To change the width of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableWidth', {
 *   value: '400px'
 * } );
 * ```
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableWidth', {
 *   value: '50'
 * } );
 * ```
 *
 * will set the `width` attribute to `'50px'` in the model.
 */
export default class TableWidthCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableWidthCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableWidth', defaultValue );
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
