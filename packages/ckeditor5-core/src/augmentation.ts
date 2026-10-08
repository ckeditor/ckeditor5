/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { PendingActions } from './index.js';
import type { ActionsRecorderConfig } from './actionsrecorderconfig.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ PendingActions.pluginName ]: PendingActions;
	}

	interface EditorConfig {

		/**
		 * The configuration for the actions recorder plugin.
		 */
		actionsRecorder?: ActionsRecorderConfig;
	}
}
