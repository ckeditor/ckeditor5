/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module mention
 */

export { Mention, type MentionAttribute } from './mention.js';
export { MentionEditing } from './mentionediting.js';
export { MentionUI } from './mentionui.js';
export { MentionsView } from './ui/mentionsview.js';
export { MentionListItemView } from './ui/mentionlistitemview.js';
export { MentionDomWrapperView } from './ui/domwrapperview.js';
export { MentionCommand } from './mentioncommand.js';

export type {
	MentionConfig,
	MentionFeed,
	MentionFeedItem,
	MentionItemRenderer,
	MentionFeedObjectItem,
	MentionFeedbackCallback
} from './mentionconfig.js';

export { createRegExp as _createMentionMarkerRegExp } from './mentionui.js';
export {
	_addMentionAttributes as _addMentionAttributes,
	_toMentionAttribute as _toMentionAttribute
} from './mentionediting.js';

import './augmentation.js';
