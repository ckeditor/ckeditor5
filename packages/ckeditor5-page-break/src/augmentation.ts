/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	PageBreak,
	PageBreakEditing,
	PageBreakUI,
	PageBreakCommand
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ PageBreak.pluginName ]: PageBreak;
		[ PageBreakEditing.pluginName ]: PageBreakEditing;
		[ PageBreakUI.pluginName ]: PageBreakUI;
	}

	interface CommandsMap {
		pageBreak: PageBreakCommand;
	}
}
