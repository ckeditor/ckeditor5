/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	CKBox,
	CKBoxCommand,
	CKBoxConfig,
	CKBoxEditing,
	CKBoxImageEdit,
	CKBoxImageEditEditing,
	CKBoxImageEditCommand,
	CKBoxImageEditUI
} from './index.js';

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
		[ CKBoxImageEdit.pluginName ]: CKBoxImageEdit;
		[ CKBoxImageEditEditing.pluginName ]: CKBoxImageEditEditing;
		[ CKBoxImageEditUI.pluginName ]: CKBoxImageEditUI;
	}

	interface CommandsMap {
		ckbox: CKBoxCommand;
		ckboxImageEdit: CKBoxImageEditCommand;
	}
}

declare global {
	// eslint-disable-next-line no-var
	var CKBox: {
		mount( wrapper: Element, options: Record<string, unknown> ): void;
		mountImageEditor( wrapper: Element, options: Record<string, unknown> ): void;
	};
}
