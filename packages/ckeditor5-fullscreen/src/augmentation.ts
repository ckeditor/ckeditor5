/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	Fullscreen,
	FullscreenEditing,
	FullscreenUI,
	FullscreenCommand
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Fullscreen.pluginName ]: Fullscreen;
		[ FullscreenEditing.pluginName ]: FullscreenEditing;
		[ FullscreenUI.pluginName ]: FullscreenUI;
	}

	interface CommandsMap {
		fullscreen: FullscreenCommand;
	}
}

