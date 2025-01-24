/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	FullScreen,
	FullScreenEditing,
	FullScreenUI,
	FullScreenCommand
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ FullScreen.pluginName ]: FullScreen;
		[ FullScreenEditing.pluginName ]: FullScreenEditing;
		[ FullScreenUI.pluginName ]: FullScreenUI;
	}

	interface CommandsMap {
		fullScreen: FullScreenCommand;
	}
}

