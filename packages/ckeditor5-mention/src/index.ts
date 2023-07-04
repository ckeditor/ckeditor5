/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module mention
 */

export { default as Mention } from './mention.js';
export { default as MentionEditing } from './mentionediting.js';
export { default as MentionUI } from './mentionui.js';

export type { MentionConfig, MentionFeed, ItemRenderer } from './mentionconfig.js';
export type { default as MentionCommand } from './mentioncommand.js';

import './augmentation.js';
