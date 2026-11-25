/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellheight/tablecellheightediting
 */

import { Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import type { UpcastConversionApi, ViewElement } from '@ckeditor/ckeditor5-engine';

import { TableEditing } from './../tableediting.js';
import { TableCellHeightCommand } from '../tablecellproperties/commands/tablecellheightcommand.js';
import { getNormalizedDefaultCellProperties } from '../utils/table-properties.js';
import { enableProperty } from '../utils/common.js';

/**
 * The table cell height editing feature.
 *
 * Introduces `tableCellHeight` table cell model attribute alongside with its converters
 * and a command.
 */
export class TableCellHeightEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableCellHeightEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependenciesOf<[ TableEditing ]> {
		return [ TableEditing ];
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		const defaultTableCellProperties = getNormalizedDefaultCellProperties(
			editor.config.get( 'table.tableCellProperties.defaultProperties' )!
		);

		enableProperty( editor.model.schema, editor.conversion, {
			modelAttribute: 'tableCellHeight',
			styleName: 'height',
			attributeName: 'height',
			attributeType: 'length',
			defaultValue: defaultTableCellProperties.height
		} );

		// The converter above skips the `height` attribute of a cell with the `height` style (both set for example by Microsoft Excel),
		// as the style takes precedence. The attribute is consumed here, as General HTML Support would keep it otherwise, and the cell
		// would keep its height after the style is removed.
		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				name: /^(td|th)$/,
				attributes: {
					height: /[\s\S]+/
				}
			},
			model: {
				key: 'tableCellHeight',
				value: ( viewElement: ViewElement, conversionApi: UpcastConversionApi ) => {
					conversionApi.consumable.consume( viewElement, { attributes: 'height' } );

					return undefined;
				}
			}
		} );

		editor.commands.add( 'tableCellHeight', new TableCellHeightCommand( editor, defaultTableCellProperties.height ) );
	}
}
