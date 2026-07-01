/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedtoolbar
 */

import { Plugin, type PluginDependenciesOf, type ToolbarConfigItem } from '@ckeditor/ckeditor5-core';
import type { ComponentFactory } from '@ckeditor/ckeditor5-ui';
import { WidgetToolbarRepository } from '@ckeditor/ckeditor5-widget';

import { getSelectedMediaViewWidget } from './utils.js';
import { isMediaStyleDropdown } from './mediaembedstyle/utils.js';
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
	public static get requires(): PluginDependenciesOf<[ WidgetToolbarRepository ]> {
		return [ WidgetToolbarRepository ];
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
			items: normalizeDeclarativeConfig(
				editor.ui.componentFactory,
				editor.config.get( 'mediaEmbed.toolbar' ) || []
			),
			getRelatedElement: getSelectedMediaViewWidget
		} );
	}
}

/**
 * Flattens dropdown definitions to their factory names, dropping any `mediaEmbed:`-prefixed
 * name the style UI did not register — otherwise the toolbar crashes with `componentfactory-item-missing`.
 * Non-string entries (e.g. generic `{ label, items }` toolbar groupings) pass through unchanged.
 */
function normalizeDeclarativeConfig(
	factory: ComponentFactory,
	config: ReadonlyArray<ToolbarConfigItem | MediaStyleDropdownDefinition>
): Array<ToolbarConfigItem> {
	return config
		.map( item => isMediaStyleDropdown( item ) ? item.name : item )
		.filter( item =>
			typeof item !== 'string' || !item.startsWith( 'mediaEmbed:' ) || factory.has( item )
		);
}
