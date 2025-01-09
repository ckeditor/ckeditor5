/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	Highlight,
	HighlightCommand,
	HighlightConfig,
	HighlightEditing,
	HighlightUI
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:highlight/highlight~Highlight} feature.
		 *
		 * Read more in {@link module:highlight/highlightconfig~HighlightConfig}.
		 */
		highlight?: HighlightConfig;
	}

	interface PluginsMap {
		[ Highlight.pluginName ]: Highlight;
		[ HighlightEditing.pluginName ]: HighlightEditing;
		[ HighlightUI.pluginName ]: HighlightUI;
	}

	interface CommandsMap {
		highlight: HighlightCommand;
	}
}
