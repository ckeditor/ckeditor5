/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module code-block
 */

export { default as CodeBlock } from './codeblock.js';
export { default as CodeBlockEditing } from './codeblockediting.js';
export { default as CodeBlockUI } from './codeblockui.js';
export type { default as CodeBlockCommand } from './codeblockcommand.js';
export type { default as IndentCodeBlockCommand } from './indentcodeblockcommand.js';
export type { default as OutdentCodeBlockCommand } from './outdentcodeblockcommand.js';
export type { CodeBlockConfig } from './codeblockconfig.js';

import './augmentation.js';
