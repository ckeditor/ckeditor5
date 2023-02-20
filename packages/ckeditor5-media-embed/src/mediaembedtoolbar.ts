/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembedtoolbar
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget';

import { getSelectedMediaViewWidget } from './utils';

import './mediaembedconfig';

/**
 * The media embed toolbar plugin. It creates a toolbar for media embed that shows up when the media element is selected.
 *
 * Instances of toolbar components (e.g. buttons) are created based on the
 * {@link module:media-embed/mediaembed~MediaEmbedConfig#toolbar `media.toolbar` configuration option}.
 */
export default class MediaEmbedToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ WidgetToolbarRepository ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'MediaEmbedToolbar' {
		return 'MediaEmbedToolbar';
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
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

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ MediaEmbedToolbar.pluginName ]: MediaEmbedToolbar;
	}
}
