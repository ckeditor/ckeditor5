/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedtoolbar
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget.js';

import { getSelectedMediaViewWidget } from './utils.js';

import './mediaembedconfig.js';

/**
 * The media embed toolbar plugin. It creates a toolbar for media embed that shows up when the media element is selected.
 *
 * Instances of toolbar components (e.g. buttons) are created based on the
 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar `media.toolbar` configuration option}.
 */
export default class MediaEmbedToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ WidgetToolbarRepository ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MediaEmbedToolbar' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
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
