/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';

import TableCellPropertiesUI from './tablecellproperties/tablecellpropertiesui';
import TableCellPropertiesEditing from './tablecellproperties/tablecellpropertiesediting';
import type { TableColorConfig } from './table';

/**
 * The table cell properties feature. Enables support for setting properties of table cells (size, border, background, etc.).
 *
 * Read more in the {@glink features/table#table-and-cell-styling-tools Table and cell styling tools} section.
 * See also the {@link module:table/tableproperties~TableProperties} plugin.
 *
 * This is a "glue" plugin that loads the
 * {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing table cell properties editing feature} and
 * the {@link module:table/tablecellproperties/tablecellpropertiesui~TableCellPropertiesUI table cell properties UI feature}.
 */
export default class TableCellProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'TableCellProperties' {
		return 'TableCellProperties';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ TableCellPropertiesEditing, TableCellPropertiesUI ];
	}
}

/**
 * The configuration of the table cell default properties feature.
 *
 * @typedef module:table/tablecellproperties~TableCellPropertiesOptions
 *
 * @property {String} width The default `width` of the table cell.
 *
 * @property {String} height The default `height` of the table cell.
 *
 * @property {String} padding The default `padding` of the table cell.
 *
 * @property {String} backgroundColor The default `background-color` of the table cell.
 *
 * @property {String} borderColor The default `border-color` of the table cell.
 *
 * @property {String} borderWidth The default `border-width` of the table cell.
 *
 * @property {String} [borderStyle='none'] The default `border-style` of the table cell.
 *
 * @property {String} [horizontalAlignment='center'] The default `horizontalAlignment` of the table cell.
 *
 * @property {String} [verticalAlignment='middle'] The default `verticalAlignment` of the table cell.
 */
export type TableCellPropertiesOptions = {
	width?: string;
	height?: string;
	padding?: string;
	backgroundColor?: string;
	borderColor?: string;
	borderWidth?: string;
	borderStyle?: string;
	horizontalAlignment?: string;
	verticalAlignment?: string;
	defaultProperties?: DefaultCellProperties;
	borderColors?: TableColorConfig;
	backgroundColors?: TableColorConfig;
};

export type DefaultCellProperties = {
	horizontalAlignment?: 'right';
	verticalAlignment?: 'bottom';
	padding?: '5px';
};

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
			[ TableCellProperties.pluginName ]: TableCellProperties;
	}

	/**
	 * The configuration of the table cell properties user interface (balloon). It allows to define:
	 *
	 * * The color palette for the cell border color style field (`tableCellProperties.borderColors`),
	 * * The color palette for the cell background style field (`tableCellProperties.backgroundColors`).
	 *
	 * ```ts
	 * const tableConfig = {
	 *   tableCellProperties: {
	 *     borderColors: [
	 *       {
	 *         color: 'hsl(0, 0%, 90%)',
	 *         label: 'Light grey'
	 *       },
	 *       // ...
	 *     ],
	 *     backgroundColors: [
	 *       {
	 *         color: 'hsl(120, 75%, 60%)',
	 *         label: 'Green'
	 *       },
	 *       // ...
	 *     ]
	 *   }
	 * };
	 * ```
	 *
	 * * The default styles for table cells (`tableCellProperties.defaultProperties`):
	 *
	 * ```ts
	 * const tableConfig = {
	 *   tableCellProperties: {
	 *     defaultProperties: {
	 *       horizontalAlignment: 'right',
	 *       verticalAlignment: 'bottom',
	 *       padding: '5px'
	 *     }
	 *   }
	 * }
	 * ```
	 *
	 * 	 {@link module:table/tableproperties~TablePropertiesOptions Read more about the supported properties.}
	 *
	 * **Note**: The `borderColors` and `backgroundColors` options do not impact the data loaded into the editor,
	 * i.e. they do not limit or filter the colors in the data. They are used only in the user interface
	 * allowing users to pick colors in a more convenient way. The `defaultProperties` option does impact the data.
	 * Default values will not be kept in the editor model.
	 *
	 * The default color palettes for the cell background and the cell border are the same
	 * ({@link module:table/utils/ui/table-properties~defaultColors check out their content}).
	 *
	 * Both color palette configurations must follow the
	 * {@link module:table/table~TableColorConfig table color configuration format}.
	 *
	 * Read more about configuring the table feature in {@link module:table/table~TableConfig}.
	 *
	 * @member module:table/table~TableConfig#tableCellProperties
	 */
	interface EditorConfig {
		'table.tableCellProperties'?: TableCellPropertiesOptions;
		'table.tableCellProperties.defaultProperties'?: DefaultCellProperties;
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
			[ TableCellProperties.pluginName ]: TableCellProperties;
	}
}
