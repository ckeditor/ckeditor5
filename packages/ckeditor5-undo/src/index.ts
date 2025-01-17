/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module undo
 */

export { default as Undo } from './undo.js';
export { default as UndoEditing } from './undoediting.js';
export { default as UndoUI } from './undoui.js';
export type { default as UndoCommand } from './undocommand.js';
export type { default as RedoCommand } from './redocommand.js';

import './augmentation.js';
