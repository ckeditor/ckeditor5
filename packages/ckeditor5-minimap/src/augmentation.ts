/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	MinimapConfig,
	Minimap
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the minimap feature. Introduced by the {@link module:minimap/minimap~Minimap} feature.
		 *
		 * Read more in {@link module:minimap/minimapconfig~MinimapConfig}.
		 */
		minimap?: MinimapConfig;
	}

	interface PluginsMap {
		[ Minimap.pluginName ]: Minimap;
	}
}

