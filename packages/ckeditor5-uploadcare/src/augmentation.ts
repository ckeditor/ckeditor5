/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	Uploadcare,
	UploadcareEditing,
	UploadcareCommand,
	UploadcareConfig
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:uploadcare/uploadcare~Uploadcare Uploadcare feature}.
		 *
		 * Read more in {@link module:uploadcare/uploadcareconfig~UploadcareConfig}.
		 */
		ckbox?: UploadcareConfig;
	}

	interface PluginsMap {
		[ Uploadcare.pluginName ]: Uploadcare;
		[ UploadcareEditing.pluginName ]: UploadcareEditing;
	}

	interface CommandsMap {
		uploadcare: UploadcareCommand;
	}
}
