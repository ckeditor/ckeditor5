/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { SourceEditing, SourceEditingConfig } from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the source editing feature.
		 *
		 * Read more in {@link module:source-editing/sourceeditingconfig~SourceEditingConfig}.
		 */
		sourceEditing?: SourceEditingConfig;
	}

	interface PluginsMap {
		[ SourceEditing.pluginName ]: SourceEditing;
	}
}
