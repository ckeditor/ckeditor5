/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module enter
 */

export { Enter } from './enter.js';
export { ShiftEnter } from './shiftenter.js';
export { EnterObserver, type ViewDocumentEnterEvent, type ViewDocumentEnterEventData } from './enterobserver.js';
export { EnterCommand, type EnterCommandAfterExecuteEvent } from './entercommand.js';
export { ShiftEnterCommand, type ShiftEnterCommandAfterExecuteEvent } from './shiftentercommand.js';

export { getCopyOnEnterAttributes as _getCopyOnEnterAttributes } from './utils.js';

import './augmentation.js';
