/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/table
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TableEditing from './tableediting';
import TableUI from './tableui';
import TableSelection from './tableselection';
import TableClipboard from './tableclipboard';
import TableKeyboard from './tablekeyboard';
import TableMouse from './tablemouse';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import '../theme/table.css';

/**
 * The table plugin.
 *
 * For a detailed overview, check the {@glink features/table Table feature documentation}.
 *
 * This is a "glue" plugin that loads the following table features:
 *
 * * {@link module:table/tableediting~TableEditing editing feature},
 * * {@link module:table/tableselection~TableSelection selection feature},
 * * {@link module:table/tablekeyboard~TableKeyboard keyboard navigation feature},
 * * {@link module:table/tablemouse~TableMouse mouse selection feature},
 * * {@link module:table/tableclipboard~TableClipboard clipboard feature},
 * * {@link module:table/tableui~TableUI UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Table extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableEditing, TableUI, TableSelection, TableMouse, TableKeyboard, TableClipboard, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Table';
	}
}

/**
 * The configuration of the table feature. Used by the table feature in the `@ckeditor/ckeditor5-table` package.
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
 * An array of color definitions (either strings or objects).
 *
 *		const colors = [
 *			{
 *				color: 'hsl(0, 0%, 60%)',
 *				label: 'Grey'
 *			},
 *			'hsl(0, 0%, 80%)',
 *			{
 *				color: 'hsl(0, 0%, 90%)',
 *				label: 'Light grey'
 *			},
 *			{
 *				color: 'hsl(0, 0%, 100%)',
 *				label: 'White',
 *				hasBorder: true
 *			},
 *			'#FF0000'
 *		]
 *
 * Usually used as a configuration parameter, for instance in
 * {@link module:table/table~TableConfig#tableProperties `config.table.tableProperties`}
 * or {@link module:table/table~TableConfig#tableCellProperties `config.table.tableCellProperties`}.
 *
 * @typedef {Array.<String|Object>} module:table/table~TableColorConfig
 */
