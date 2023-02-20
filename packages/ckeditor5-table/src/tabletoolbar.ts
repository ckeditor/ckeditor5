/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tabletoolbar
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget';
import { getSelectedTableWidget, getTableWidgetAncestor } from './utils/ui/widget';

import './tableconfig';

/**
 * The table toolbar class. It creates toolbars for the table feature and its content (for now only for the table cell content).
 *
 * The table toolbar shows up when a table widget is selected. Its components (e.g. buttons) are created based on the
 * {@link module:table/tableconfig~TableConfig#tableToolbar `table.tableToolbar` configuration option}.
 *
 * Table content toolbar shows up when the selection is inside the content of a table. It creates its component based on the
 * {@link module:table/tableconfig~TableConfig#contentToolbar `table.contentToolbar` configuration option}.
 */
export default class TableToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ WidgetToolbarRepository ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'TableToolbar' {
		return 'TableToolbar';
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
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

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
			[ TableToolbar.pluginName ]: TableToolbar;
	}
}
