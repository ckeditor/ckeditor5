/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module typing
 */

export { Typing } from './typing.js';
export { Input } from './input.js';
export { Delete } from './delete.js';

export { TextWatcher } from './textwatcher.js';
export { TwoStepCaretMovement } from './twostepcaretmovement.js';
export { TextTransformation } from './texttransformation.js';
export type { TextTransformationConfig } from './typingconfig.js';

export { inlineHighlight } from './utils/inlinehighlight.js';
export { findAttributeRange, findAttributeRangeBound } from './utils/findattributerange.js';
export { getLastTextLine, type LastTextLineData } from './utils/getlasttextline.js';

export { InsertTextCommand, type InsertTextCommandExecuteEvent } from './inserttextcommand.js';
export { DeleteCommand } from './deletecommand.js';

export { DeleteObserver as _DeleteObserver } from './deleteobserver.js';

export type { TypingConfig } from './typingconfig.js';
export type { ViewDocumentDeleteEvent } from './deleteobserver.js';
export type { ViewDocumentInsertTextEvent, InsertTextEventData } from './inserttextobserver.js';
export type { TextWatcherMatchedEvent } from './textwatcher.js';
export type { TextWatcherMatchedDataEvent } from './textwatcher.js';

import './augmentation.js';
