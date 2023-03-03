/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type SelectAll from './selectall';
import type SelectAllCommand from './selectallcommand';
import type SelectAllEditing from './selectallediting';
import type SelectAllUI from './selectallui';

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
