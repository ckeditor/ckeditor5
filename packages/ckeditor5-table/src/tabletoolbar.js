/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tabletoolbar
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getSelectedTableWidget, getTableWidgetAncestor } from './utils';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';

/**
 * The table toolbar class. It creates toolbars for the table feature and its content (for now only for a table cell content).
 *
 * Table toolbar shows up when a table widget is selected. Its components (e.g. buttons) are created based on the
 * {@link module:table/table~TableConfig#toolbar `table.tableToolbar` configuration option}.
 *
 * Table content toolbar shows up when the selection is inside the content of a table. It creates its component based on the
 * {@link module:table/table~TableConfig#contentToolbar `table.contentToolbar` configuration option}.
 *
 * Note that the old {@link module:table/table~TableConfig#toolbar `table.toolbar` configuration option} is deprecated
 * and will be removed in the next major release.
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
		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

		const tableContentToolbarItems = editor.config.get( 'table.contentToolbar' );
		const deprecatedTableContentToolbarItems = editor.config.get( 'table.toolbar' );

		const tableToolbarItems = editor.config.get( 'table.tableToolbar' );

		if ( deprecatedTableContentToolbarItems ) {
			// eslint-disable-next-line
			console.warn(
				'`config.table.toolbar` is deprecated and will be removed in the next major release.' +
				' Use `config.table.contentToolbar` instead.'
			);
		}

		if ( tableContentToolbarItems || deprecatedTableContentToolbarItems ) {
			widgetToolbarRepository.register( 'tableContent', {
				items: tableContentToolbarItems || deprecatedTableContentToolbarItems,
				getRelatedElement: getTableWidgetAncestor
			} );
		}

		if ( tableToolbarItems ) {
			widgetToolbarRepository.register( 'table', {
				items: tableToolbarItems,
				getRelatedElement: getSelectedTableWidget
			} );
		}
	}
}

/**
 * Items to be placed in the table content toolbar.
 *
 * **Note:** This configuration option is deprecated! Use {@link module:table/table~TableConfig#contentToolbar} instead.
 *
 * Read more about configuring toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @deprecated
 * @member {Array.<String>} module:table/table~TableConfig#toolbar
 */

/**
 * Items to be placed in the table content toolbar.
 * The {@link module:table/tabletoolbar~TableToolbar} plugin is required to make this toolbar working.
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
 * Read more about configuring toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>} module:table/table~TableConfig#contentToolbar
 */

/**
 * Items to be placed in the table toolbar.
 * The {@link module:table/tabletoolbar~TableToolbar} plugin is required to make this toolbar working.
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
 * Read more about configuring toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>} module:table/table~TableConfig#tableToolbar
 */
