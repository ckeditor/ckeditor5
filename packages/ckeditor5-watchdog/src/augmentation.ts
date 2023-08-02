/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// eslint-disable-next-line ckeditor5-rules/no-cross-package-imports
import type { EditorData } from './editorwatchdog';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The temporary property that is used for passing data to the plugin which restores the editor state.
		 *
		 * @internal
		 */
		_watchdogInitialData?: EditorData;
	}
}
