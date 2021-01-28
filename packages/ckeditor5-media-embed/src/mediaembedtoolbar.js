/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembedtoolbar
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';
import { getSelectedMediaViewWidget } from './utils';

/**
 * The media embed toolbar plugin. It creates a toolbar for media embed that shows up when the media element is selected.
 *
 * Instances of toolbar components (e.g. buttons) are created based on the
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#toolbar `media.toolbar` configuration option}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MediaEmbedToolbar extends Plugin {
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
		return 'MediaEmbedToolbar';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const t = editor.t;
		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

		widgetToolbarRepository.register( 'mediaEmbed', {
			ariaLabel: t( 'Media toolbar' ),
			items: editor.config.get( 'mediaEmbed.toolbar' ) || [],
			getRelatedElement: getSelectedMediaViewWidget
		} );
	}
}

/**
 * Items to be placed in the media embed toolbar.
 * This option requires adding {@link module:media-embed/mediaembedtoolbar~MediaEmbedToolbar} to the plugin list.
 *
 * Read more about configuring toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>} module:media-embed/mediaembed~MediaEmbedConfig#toolbar
 */
