/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	FindAndReplace,
	FindAndReplaceEditing,
	FindAndReplaceUI,
	FindAndReplaceUtils,
	FindCommand,
	FindNextCommand,
	FindPreviousCommand,
	ReplaceAllCommand,
	ReplaceCommand
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ FindAndReplace.pluginName ]: FindAndReplace;
		[ FindAndReplaceEditing.pluginName ]: FindAndReplaceEditing;
		[ FindAndReplaceUI.pluginName ]: FindAndReplaceUI;
		[ FindAndReplaceUtils.pluginName ]: FindAndReplaceUtils;
	}

	interface CommandsMap {
		find: FindCommand;
		findNext: FindNextCommand;
		findPrevious: FindPreviousCommand;
		replace: ReplaceCommand;
		replaceAll: ReplaceAllCommand;
	}
}
