/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tableborderwidthcommand
 */

import type { Element } from 'ckeditor5/src/engine';
import type { Editor } from 'ckeditor5/src/core';

import TablePropertyCommand from './tablepropertycommand';
import { addDefaultUnitToNumericValue, getSingleValue } from '../../utils/table-properties';

/**
 * The table width border command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderWidth'` editor command.
 *
 * To change the border width of the selected table, execute the command:
 *
 *		editor.execute( 'tableBorderWidth', {
 *			value: '5px'
 *		} );
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 *		editor.execute( 'tableBorderWidth', {
 *			value: '5'
 *		} );
 *
 * will set the `borderWidth` attribute to `'5px'` in the model.
 *
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
 */
export default class TableBorderWidthCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableBorderWidthCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, defaultValue: string ) {
		super( editor, 'tableBorderWidth', defaultValue );
	}

	/**
	 * @inheritDoc
	 */
	public override _getValue( table: Element ): string | undefined {
		if ( !table ) {
			return;
		}

		const value = getSingleValue( table.getAttribute( this.attributeName ) as string );

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}

	/**
	 * @inheritDoc
	 */
	public override _getValueToSet( value: string ): string | undefined {
		const newValue = addDefaultUnitToNumericValue( value, 'px' ) as string;

		if ( newValue === this._defaultValue ) {
			return;
		}

		return newValue;
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface CommandsMap {
		tableBorderWidth: TableBorderWidthCommand;
	}
}
