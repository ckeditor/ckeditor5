/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorData } from './editorwatchdog.js';
import type { ActionsRecorderConfig } from './actionsrecorderconfig.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The temporary property that is used for passing data to the plugin which restores the editor state.
		 *
		 * @internal
		 */
		_watchdogInitialData?: EditorData;

		/**
		 * The configuration for the actions recorder plugin.
		 */
		actionsRecorder?: ActionsRecorderConfig;
	}
}
