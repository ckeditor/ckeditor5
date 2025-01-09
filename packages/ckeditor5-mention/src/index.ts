/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module mention
 */

export { default as Mention } from './mention.js';
export { default as MentionEditing } from './mentionediting.js';
export { default as MentionUI } from './mentionui.js';
export { default as MentionsView } from './ui/mentionsview.js';
export { default as MentionListItemView } from './ui/mentionlistitemview.js';
export { default as DomWrapperView } from './ui/domwrapperview.js';

export type { MentionConfig, MentionFeed, ItemRenderer, MentionFeedObjectItem } from './mentionconfig.js';
export type { default as MentionCommand } from './mentioncommand.js';

import './augmentation.js';
