/**
 * Copyright (c) 2016 - 2018, CKSource - Frederico Knabben. All rights reserved.
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { isTableWidgetSelected } from '@ckeditor/ckeditor5-table/src/utils';
import WidgetToolbar from '@ckeditor/ckeditor5-widget/src/widgettoolbar';

/**
 * The table widget toolbar class. It creates a table toolbar that shows up when the table widget is selected.
 *
 * The toolbar uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableWidgetToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ WidgetToolbar ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableWidgetToolbar';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const widgetToolbar = editor.plugins.get( 'WidgetToolbar' );

		widgetToolbar.add( {
			toolbarItems: editor.config.get( 'table.widgetToolbar' ) || [],
			isSelected: isTableWidgetSelected,
		} );
	}
}

