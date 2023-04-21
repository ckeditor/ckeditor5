/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	SelectAll,
	SelectAllEditing,
	SelectAllUI,
	SelectAllCommand
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ SelectAll.pluginName ]: SelectAll;
		[ SelectAllEditing.pluginName ]: SelectAllEditing;
		[ SelectAllUI.pluginName ]: SelectAllUI;
	}

	interface CommandsMap {
		selectAll: SelectAllCommand;
	}
}
