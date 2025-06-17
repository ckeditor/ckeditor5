/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module undo
 */

export { Undo } from './undo.js';
export { UndoEditing } from './undoediting.js';
export { UndoUI } from './undoui.js';
export { UndoCommand, type UndoCommandRevertEvent } from './undocommand.js';
export { RedoCommand } from './redocommand.js';
export { UndoRedoBaseCommand } from './basecommand.js';

import './augmentation.js';
