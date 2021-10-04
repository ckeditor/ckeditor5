/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties
 */

import { Plugin } from 'ckeditor5/src/core';

import TablePropertiesEditing from './tableproperties/tablepropertiesediting';
import TablePropertiesUI from './tableproperties/tablepropertiesui';

/**
 * The table properties feature. Enables support for setting properties of tables (size, border, background, etc.).
 *
 * Read more in the {@glink features/table#table-and-cell-styling-tools Table and cell styling tools} section.
 * See also the {@link module:table/tablecellproperties~TableCellProperties} plugin.
 *
 * This is a "glue" plugin that loads the
 * {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing table properties editing feature} and
 * the {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI table properties UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableProperties';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TablePropertiesEditing, TablePropertiesUI ];
	}
}

/**
 * The configuration of the table properties user interface (balloon). It allows to define:
 *
 * * The color palette for the table border color style field (`tableProperties.borderColors`),
 * * The color palette for the table background style field (`tableProperties.backgroundColors`).
 *
 *		const tableConfig = {
 *			tableProperties: {
 *				borderColors: [
 *					{
 *						color: 'hsl(0, 0%, 90%)',
 *						label: 'Light grey'
 *					},
 *					// ...
 *				],
 *				backgroundColors: [
 *					{
 *						color: 'hsl(120, 75%, 60%)',
 *						label: 'Green'
 *					},
 *					// ...
 *				]
 *			}
 *		};
 *
 * * The default styles for tables (`tableProperties.defaultProperties`):
 *
 *		const tableConfig = {
 *			tableProperties: {
 *				defaultProperties: {
 *					borderStyle: 'dashed',
 *					borderColor: 'hsl(0, 0%, 90%)',
 *					borderWidth: '3px',
 *					alignment: 'left'
 *				}
 *			}
 *		}
 *
 * 	 {@link module:table/tableproperties~TablePropertiesOptions Read more about the supported properties.}
 *
 * **Note**: The `borderColors` and `backgroundColors` options do not impact the data loaded into the editor,
 * i.e. they do not limit or filter the colors in the data. They are used only in the user interface
 * allowing users to pick colors in a more convenient way. The `defaultProperties` option does impact the data.
 * Default values will not be kept in the editor model.
 *
 * The default color palettes for the table background and the table border are the same
 * ({@link module:table/utils/ui/table-properties~defaultColors check out their content}).
 *
 * Both color palette configurations must follow the
 * {@link module:table/table~TableColorConfig table color configuration format}.
 *
 * Read more about configuring the table feature in {@link module:table/table~TableConfig}.
 *
 * @member {Object} module:table/table~TableConfig#tableProperties
 */

/**
 * The configuration of the table default properties feature.
 *
 * @typedef {Object} module:table/tableproperties~TablePropertiesOptions
 *
 * @property {String} width The default `width` of the table.
 *
 * @property {String} height The default `height` of the table.
 *
 * @property {String} backgroundColor The default `background-color` of the table.
 *
 * @property {String} borderColor The default `border-color` of the table.
 *
 * @property {String} borderWidth The default `border-width` of the table.
 *
 * @property {String} [borderStyle='none'] The default `border-style` of the table.
 *
 * @property {String} [alignment='center'] The default `alignment` of the table.
 */
