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
import type UploadcareImageEditCommand from './uploadcareimageedit/uploadcareimageeditcommand.js';
import type UploadcareImageEdit from './uploadcareimageedit.js';
import type UploadcareImageEditEditing from './uploadcareimageedit/uploadcareimageeditediting.js';
import type UploadcareImageEditUI from './uploadcareimageedit/uploadcareimageeditui.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:uploadcare/uploadcare~Uploadcare Uploadcare feature}.
		 *
		 * Read more in {@link module:uploadcare/uploadcareconfig~UploadcareConfig}.
		 */
		uploadcare?: UploadcareConfig;
	}

	interface PluginsMap {
		[ Uploadcare.pluginName ]: Uploadcare;
		[ UploadcareEditing.pluginName ]: UploadcareEditing;
		[ UploadcareImageEdit.pluginName ]: UploadcareImageEdit;
		[ UploadcareImageEditEditing.pluginName ]: UploadcareImageEditEditing;
		[ UploadcareImageEditUI.pluginName ]: UploadcareImageEditUI;
	}

	interface CommandsMap {
		uploadcare: UploadcareCommand;
		uploadcareImageEdit: UploadcareImageEditCommand;
	}
}
