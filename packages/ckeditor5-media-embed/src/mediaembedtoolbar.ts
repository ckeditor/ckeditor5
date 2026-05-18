/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedtoolbar
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { WidgetToolbarRepository } from '@ckeditor/ckeditor5-widget';

import { getSelectedMediaViewWidget } from './utils.js';
import type { MediaStyleDropdownDefinition } from './mediaembedconfig.js';

/**
 * The media embed toolbar plugin. It creates a toolbar for media embed that shows up when the media element is selected.
 *
 * Instances of toolbar components (e.g. buttons) are created based on the
 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar `media.toolbar` configuration option}.
 */
export class MediaEmbedToolbar extends Plugin {
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
			items: normalizeDeclarativeConfig( editor.config.get( 'mediaEmbed.toolbar' ) || [] ),
			getRelatedElement: getSelectedMediaViewWidget
		} );
	}
}

/**
 * Converts media style dropdown definitions (object entries) in the toolbar config to their
 * registered factory keys (string names). The dropdown components themselves are registered
 * by {@link module:media-embed/mediaembedstyle/mediaembedstyleui~MediaEmbedStyleUI}; this
 * normalization makes the toolbar resolve them by name instead of treating each object as a
 * generic nested-toolbar grouping. Mirrors image's `imagetoolbar.ts` `normalizeDeclarativeConfig`.
 *
 * The discriminator is `defaultItem` — the same one used by
 * {@link module:media-embed/mediaembedstyle/mediaembedstyleui~MediaEmbedStyleUI}. Entries
 * without it (plain strings, generic `{ label, items }` groupings) are passed through unchanged
 * so the core toolbar machinery can handle them.
 */
function normalizeDeclarativeConfig(
	config: ReadonlyArray<string | MediaStyleDropdownDefinition>
): Array<string> {
	return config.map( item => isMediaStyleDropdown( item ) ? item.name : item );
}

function isMediaStyleDropdown(
	item: string | MediaStyleDropdownDefinition
): item is MediaStyleDropdownDefinition {
	return typeof item === 'object' && item !== null && typeof item.defaultItem === 'string';
}
