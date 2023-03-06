/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block
 */

export { default as CodeBlock } from './codeblock';
export { default as CodeBlockEditing } from './codeblockediting';
export { default as CodeBlockUI } from './codeblockui';
export type { default as CodeBlockCommand } from './codeblockcommand';
export type { default as IndentCodeBlockCommand } from './indentcodeblockcommand';
export type { default as OutdentCodeBlockCommand } from './outdentcodeblockcommand';
export type { CodeBlockConfig } from './codeblockconfig';

import './augmentation';
