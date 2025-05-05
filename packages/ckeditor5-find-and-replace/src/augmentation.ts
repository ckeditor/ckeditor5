/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
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
	ReplaceCommand,
	FindAndReplaceConfig
} from './index.js';

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

	interface EditorConfig {

		/**
		 * The configuration of the {@link module:find-and-replace/findandreplace~FindAndReplace}.
		 *
		 * Read more in {@link module:find-and-replace/findandreplaceconfig~FindAndReplaceConfig}.
		 */
		findAndReplace?: FindAndReplaceConfig;
	}
}
