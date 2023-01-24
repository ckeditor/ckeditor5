/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tableheightcommand
 */

import TablePropertyCommand from './tablepropertycommand';
import { addDefaultUnitToNumericValue } from '../../utils/table-properties';
import type { Editor } from 'ckeditor5/src/core';

/**
 * The table height command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableHeight'` editor command.
 *
 * To change the height of the selected table, execute the command:
 *
 *		editor.execute( 'tableHeight', {
 *			value: '500px'
 *		} );
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 *		editor.execute( 'tableHeight', {
 *			value: '50'
 *		} );
 *
 * will set the `height` attribute to `'50px'` in the model.
 *
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
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
		tableHeight: TableHeightCommand;
	}
}
