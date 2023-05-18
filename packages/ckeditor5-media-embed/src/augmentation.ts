/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	MediaEmbedConfig,
	AutoMediaEmbed,
	MediaEmbed,
	MediaEmbedEditing,
	MediaEmbedToolbar,
	MediaEmbedUI,
	MediaEmbedCommand
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:media-embed/mediaembed~MediaEmbed} feature.
		 *
		 * Read more in {@link module:media-embed/mediaembedconfig~MediaEmbedConfig}.
		 */
		mediaEmbed?: MediaEmbedConfig;
	}

	interface PluginsMap {
		[ AutoMediaEmbed.pluginName ]: AutoMediaEmbed;
		[ MediaEmbed.pluginName ]: MediaEmbed;
		[ MediaEmbedEditing.pluginName ]: MediaEmbedEditing;
		[ MediaEmbedToolbar.pluginName ]: MediaEmbedToolbar;
		[ MediaEmbedUI.pluginName ]: MediaEmbedUI;
	}

	interface CommandsMap {
		mediaEmbed: MediaEmbedCommand;
	}
}
