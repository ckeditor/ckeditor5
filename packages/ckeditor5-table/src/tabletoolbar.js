/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tabletoolbar
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { isTableContentSelected } from './utils';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';

/**
 * The table toolbar class. It creates a table toolbar that shows up when the table content is selected.
 *
 * Instances of toolbar components (e.g. buttons) are created using the editor's
 * {@link module:ui/componentfactory~ComponentFactory component factory}
 * based on the {@link module:table/table~TableConfig#toolbar `table.toolbar` configuration option}.
 *
 * The toolbar uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon} plugin.
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

		widgetToolbarRepository.register( 'table', {
			toolbarItems: editor.config.get( 'table.toolbar' ) || [],
			visibleWhen: isTableContentSelected,
		} );
	}
}

/**
 * Items to be placed in the table toolbar.
 * This option is used by the {@link module:table/tabletoolbar~TableToolbar} feature.
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
 *			toolbar: [ 'tableRow', 'tableColumn', 'mergeTableCells' ]
 *		};
 *
 * Of course, the same buttons can also be used in the
 * {@link module:core/editor/editorconfig~EditorConfig#toolbar main editor toolbar}.
 *
 * Read more about configuring toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>} module:table/table~TableConfig#toolbar
 */
