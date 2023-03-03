/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing
 */

export { default as Typing } from './typing';
export { default as Input } from './input';
export { default as Delete } from './delete';

export { default as TextWatcher } from './textwatcher';
export { default as TwoStepCaretMovement } from './twostepcaretmovement';
export { default as TextTransformation } from './texttransformation';

export { default as inlineHighlight } from './utils/inlinehighlight';
export { default as findAttributeRange } from './utils/findattributerange';
export { default as getLastTextLine, type LastTextLineData } from './utils/getlasttextline';

export { default as InsertTextCommand, type InsertTextCommandExecuteEvent } from './inserttextcommand';

export type { default as DeleteCommand } from './deletecommand';
export type { TypingConfig } from './typingconfig';
export type { ViewDocumentDeleteEvent } from './deleteobserver';
export type { ViewDocumentInsertTextEvent, InsertTextEventData } from './inserttextobserver';
export type { TextWatcherMatchedEvent } from './textwatcher';
export type { TextWatcherMatchedDataEvent } from './textwatcher';

import './augmentation';
