/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	HtmlEmbed,
	HtmlEmbedCommand,
	HtmlEmbedConfig,
	HtmlEmbedEditing,
	HtmlEmbedUI
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the HTML embed feature. Introduced by the {@link module:html-embed/htmlembedediting~HtmlEmbedEditing}
		 * feature.
		 *
		 * Read more in {@link module:core/editor/editorconfig~EditorConfig all editor options}.
		 */
		htmlEmbed?: HtmlEmbedConfig;
	}

	interface PluginsMap {
		[ HtmlEmbed.pluginName ]: HtmlEmbed;
		[HtmlEmbedEditing.pluginName]: HtmlEmbedEditing;
		[ HtmlEmbedUI.pluginName ]: HtmlEmbedUI;
	}

	interface CommandsMap {
		htmlEmbed: HtmlEmbedCommand;
	}
}
