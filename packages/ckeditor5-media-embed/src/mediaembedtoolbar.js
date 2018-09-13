/**
 * Copyright (c) 2016 - 2018, CKSource - Frederico Knabben. All rights reserved.
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetToolbar from '@ckeditor/ckeditor5-widget/src/widgettoolbar';;
import { isMediaWidgetSelected } from './utils';

/**
 * The media embed comment toolbar class. Creates a toolbar for media embed that shows up when the media widget is selected.
 *
 * The toolbar uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MediaEmbedToolbar extends Plugin {
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
		return 'MediaEmbedToolbar';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const widgetToolbar = editor.plugins.get( 'WidgetToolbar' );

		widgetToolbar.add( {
			toolbarItems: editor.config.get( 'media.toolbar' ) || [],
			isSelected: isMediaWidgetSelected,
		} );
	}
}
