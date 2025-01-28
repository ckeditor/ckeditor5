/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module enter
 */

export { default as Enter } from './enter.js';
export { default as ShiftEnter } from './shiftenter.js';
export type { ViewDocumentEnterEvent } from './enterobserver.js';
export type { default as EnterCommand, EnterCommandAfterExecuteEvent } from './entercommand.js';
export type { default as ShiftEnterCommand } from './shiftentercommand.js';

import './augmentation.js';
