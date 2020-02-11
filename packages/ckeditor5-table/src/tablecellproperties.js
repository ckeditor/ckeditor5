/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TableCellPropertiesUI from './tablecellproperties/tablecellpropertiesui';
import TableCellPropertiesEditing from './tablecellproperties/tablecellpropertiesediting';

/**
 * The table cell properties feature.
 *
 * This is a "glue" plugin which loads the
 * {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing table cell properties editing feature} and
 * the {@link module:table/tablecellproperties/tablecellpropertiesui~TableCellPropertiesUI table cell properties UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableCellProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableCellProperties';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableCellPropertiesEditing, TableCellPropertiesUI ];
	}
}

/**
 * TODO
 *
 *		const tableConfig = {
 *			tableCellProperties: {
 *				border: {
 *					colors: [ ... ]
 *				},
 *				backgroundColors: [ ... ]
 *			}
 *		};
 *
 * TODO: Mention {@link module:table/table~TableColorConfig}.
 *
 * The default colors for the background and the border are the same and defined as follows:
 *
 *		[
 *			{
 *				color: 'hsl(0, 0%, 0%)',
 *				label: 'Black'
 *			},
 *			{
 *				color: 'hsl(0, 0%, 30%)',
 *				label: 'Dim grey'
 *			},
 *			{
 *				color: 'hsl(0, 0%, 60%)',
 *				label: 'Grey'
 *			},
 *			{
 *				color: 'hsl(0, 0%, 90%)',
 *				label: 'Light grey'
 *			},
 *			{
 *				color: 'hsl(0, 0%, 100%)',
 *				label: 'White',
 *				hasBorder: true
 *			},
 *			{
 *				color: 'hsl(0, 75%, 60%)',
 *				label: 'Red'
 *			},
 *			{
 *				color: 'hsl(30, 75%, 60%)',
 *				label: 'Orange'
 *			},
 *			{
 *				color: 'hsl(60, 75%, 60%)',
 *				label: 'Yellow'
 *			},
 *			{
 *				color: 'hsl(90, 75%, 60%)',
 *				label: 'Light green'
 *			},
 *			{
 *				color: 'hsl(120, 75%, 60%)',
 *				label: 'Green'
 *			},
 *			{
 *				color: 'hsl(150, 75%, 60%)',
 *				label: 'Aquamarine'
 *			},
 *			{
 *				color: 'hsl(180, 75%, 60%)',
 *				label: 'Turquoise'
 *			},
 *			{
 *				color: 'hsl(210, 75%, 60%)',
 *				label: 'Light blue'
 *			},
 *			{
 *				color: 'hsl(240, 75%, 60%)',
 *				label: 'Blue'
 *			},
 *			{
 *				color: 'hsl(270, 75%, 60%)',
 *				label: 'Purple'
 *			}
 *		]
 *
 * **Note**: The colors configuration does not impact the data loaded into the editor;
 * it is reflected only in the UI allowing users to pick colors in a more convenient way.
 *
 * Read more about configuring the table feature in {@link module:table/table~TableConfig}.
 *
 * @member {Object} module:table/table~TableConfig#tableCellProperties
 */
