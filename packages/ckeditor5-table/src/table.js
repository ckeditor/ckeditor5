/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/table
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TableEditing from './tableediting';
import TableUI from './tableui';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import '../theme/table.css';

/**
 * The table plugin.
 *
 * For a detailed overview, check the {@glink features/table Table feature documentation}.
 *
 * This is a "glue" plugin which loads the {@link module:table/tableediting~TableEditing table editing feature}
 * and {@link module:table/tableui~TableUI table UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Table extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableEditing, TableUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Table';
	}
}

/**
 * The configuration of the table features. Used by the table features in the `@ckeditor/ckeditor5-table` package.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				table: ... // Table feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface TableConfig
 */

/**
 * The configuration of the {@link module:table/table~Table} feature.
 *
 * Read more in {@link module:table/table~TableConfig}.
 *
 * @member {module:table/table~TableConfig} module:core/editor/editorconfig~EditorConfig#table
 */

/**
 * Available colors defined as an array of strings or objects.
 *
 * Used by {@link module:table/table~TableConfig#tableProperties} and {@link module:table/table~TableConfig#tableCellProperties}
 * configurations.
 *
 * The default value registers the following colors:
 *
 *		const colorDefinitions = [
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
 * @typedef {Array.<String|Object>} module:table/table~TableColorConfig
 */
