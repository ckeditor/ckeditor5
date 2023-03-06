/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	CKBox,
	CKBoxCommand,
	CKBoxConfig,
	CKBoxEditing
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:ckbox/ckbox~CKBox CKBox feature}.
		 *
		 * Read more in {@link module:ckbox/ckboxconfig~CKBoxConfig}.
		 */
		ckbox?: CKBoxConfig;
	}

	interface PluginsMap {
		[ CKBox.pluginName ]: CKBox;
		[ CKBoxEditing.pluginName ]: CKBoxEditing;
	}

	interface CommandsMap {
		ckbox: CKBoxCommand;
	}
}
