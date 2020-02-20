/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tabletoolbar
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getSelectedTableWidget, getTableWidgetAncestor } from './utils';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';

/**
 * The table toolbar class. It creates toolbars for the table feature and its content (for now only for the table cell content).
 *
 * The table toolbar shows up when a table widget is selected. Its components (e.g. buttons) are created based on the
 * {@link module:table/table~TableConfig#tableToolbar `table.tableToolbar` configuration option}.
 *
 * Table content toolbar shows up when the selection is inside the content of a table. It creates its component based on the
 * {@link module:table/table~TableConfig#contentToolbar `table.contentToolbar` configuration option}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ WidgetToolbarRepository ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableToolbar';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const t = editor.t;
		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

		const tableContentToolbarItems = editor.config.get( 'table.contentToolbar' );

		const tableToolbarItems = editor.config.get( 'table.tableToolbar' );

		if ( tableContentToolbarItems ) {
			widgetToolbarRepository.register( 'tableContent', {
				ariaLabel: t( 'Table toolbar' ),
				items: tableContentToolbarItems,
				getRelatedElement: getTableWidgetAncestor
			} );
		}

		if ( tableToolbarItems ) {
			widgetToolbarRepository.register( 'table', {
				ariaLabel: t( 'Table toolbar' ),
				items: tableToolbarItems,
				getRelatedElement: getSelectedTableWidget
			} );
		}
	}
}

/**
 * Items to be placed in the table content toolbar.
 * The {@link module:table/tabletoolbar~TableToolbar} plugin is required to make this toolbar work.
 *
 * Assuming that you use the {@link module:table/tableui~TableUI} feature, the following toolbar items will be available
 * in {@link module:ui/componentfactory~ComponentFactory}:
 *
 * * `'tableRow'`,
 * * `'tableColumn'`,
 * * `'mergeTableCells'`.
 *
 * You can thus configure the toolbar like this:
 *
 *		const tableConfig = {
 *			contentToolbar: [ 'tableRow', 'tableColumn', 'mergeTableCells' ]
 *		};
 *
 * Of course, the same buttons can also be used in the
 * {@link module:core/editor/editorconfig~EditorConfig#toolbar main editor toolbar}.
 *
 * Read more about configuring the toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>} module:table/table~TableConfig#contentToolbar
 */

/**
 * Items to be placed in the table toolbar.
 * The {@link module:table/tabletoolbar~TableToolbar} plugin is required to make this toolbar work.
 *
 * You can thus configure the toolbar like this:
 *
 *		const tableConfig = {
 *			tableToolbar: [ 'blockQuote' ]
 *		};
 *
 * Of course, the same buttons can also be used in the
 * {@link module:core/editor/editorconfig~EditorConfig#toolbar main editor toolbar}.
 *
 * Read more about configuring the toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>} module:table/table~TableConfig#tableToolbar
 */
