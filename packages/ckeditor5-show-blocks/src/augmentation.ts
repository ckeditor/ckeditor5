/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	ShowBlocks,
	ShowBlocksCommand,
	ShowBlocksEditing,
	ShowBlocksUI
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ ShowBlocks.pluginName ]: ShowBlocks;
		[ ShowBlocksEditing.pluginName ]: ShowBlocksEditing;
		[ ShowBlocksUI.pluginName ]: ShowBlocksUI;
	}

	interface CommandsMap {
		showBlocks: ShowBlocksCommand;
	}
}
