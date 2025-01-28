/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Autosave, AutosaveConfig } from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Autosave.pluginName ]: Autosave;
	}

	interface EditorConfig {

		/**
		 * The configuration of the {@link module:autosave/autosave~Autosave autosave feature}.
		 *
		 * Read more in {@link module:autosave/autosave~AutosaveConfig}.
		 */
		autosave?: AutosaveConfig;
	}
}
