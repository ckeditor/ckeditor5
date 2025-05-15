/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module typing
 */

export { default as Typing } from './typing.js';
export { default as Input } from './input.js';
export { default as Delete } from './delete.js';

export { default as TextWatcher } from './textwatcher.js';
export { default as TwoStepCaretMovement } from './twostepcaretmovement.js';
export { default as TextTransformation } from './texttransformation.js';
export type { TextTransformationConfig } from './typingconfig.js';

export { default as inlineHighlight } from './utils/inlinehighlight.js';
export { default as findAttributeRange, findAttributeRangeBound } from './utils/findattributerange.js';
export { default as getLastTextLine, type LastTextLineData } from './utils/getlasttextline.js';

export { default as InsertTextCommand, type InsertTextCommandExecuteEvent } from './inserttextcommand.js';

export type { default as DeleteCommand } from './deletecommand.js';
export type { TypingConfig } from './typingconfig.js';
export type { ViewDocumentDeleteEvent } from './deleteobserver.js';
export type { ViewDocumentInsertTextEvent, InsertTextEventData } from './inserttextobserver.js';
export type { TextWatcherMatchedEvent } from './textwatcher.js';
export type { TextWatcherMatchedDataEvent } from './textwatcher.js';

import './augmentation.js';
