/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { LineHeightConfig } from './lineheightconfig.js';
import type LineHeight from './lineheight.js';
import type LineHeightEditing from './lineheightediting.js';
import type LineHeightUI from './lineheightui.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ LineHeight.pluginName ]: LineHeight;
		[ LineHeightEditing.pluginName ]: LineHeightEditing;
		[ LineHeightUI.pluginName ]: LineHeightUI;
	}

	interface EditorConfig {

		/**
		 * The configuration of the {@link module:line-height/lineheight~LineHeight} feature.
		 *
		 * Read more in {@link module:line-height/lineheightconfig~LineHeightConfig}.
		 */
		lineHeight?: LineHeightConfig;
	}
}
