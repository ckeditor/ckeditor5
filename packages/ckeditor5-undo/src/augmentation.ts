/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type RedoCommand from './redocommand';
import type Undo from './undo';
import type UndoCommand from './undocommand';
import type UndoEditing from './undoediting';
import type UndoUI from './undoui';

declare module '@ckeditor/ckeditor5-core' {
	interface CommandsMap {
		redo: RedoCommand;
		undo: UndoCommand;
	}

	interface PluginsMap {
		[ Undo.pluginName ]: Undo;
		[ UndoEditing.pluginName ]: UndoEditing;
		[ UndoUI.pluginName ]: UndoUI;
	}
}
