/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	Undo,
	UndoEditing,
	UndoUI,
	UndoCommand,
	RedoCommand
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface CommandsMap {
		undo: UndoCommand;
		redo: RedoCommand;
	}

	interface PluginsMap {
		[ Undo.pluginName ]: Undo;
		[ UndoEditing.pluginName ]: UndoEditing;
		[ UndoUI.pluginName ]: UndoUI;
	}
}
