/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tableproperties/commands/tableheightcommand
 */

import TablePropertyCommand from './tablepropertycommand.js';
import { addDefaultUnitToNumericValue } from '../../utils/table-properties.js';
import type { Editor } from 'ckeditor5/src/core.js';

/**
 * The table height command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableHeight'` editor command.
 *
 * To change the height of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableHeight', {
 *   value: '500px'
 * } );
 * ```
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableHeight', {
 *   value: '50'
 * } );
 * ```
 *
 * will set the `height` attribute to `'50px'` in the model.
 */
export default class TableHeightCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableHeightCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableHeight', defaultValue );
	}

	/**
	 * @inheritDoc
	 */
	protected override _getValueToSet( value: string | number | undefined ): unknown {
		value = addDefaultUnitToNumericValue( value, 'px' );

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}
}
