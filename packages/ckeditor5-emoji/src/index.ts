/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji
 */

export { Emoji } from './emoji.js';

export { EmojiMention } from './emojimention.js';

export { EmojiPicker } from './emojipicker.js';

export {
	EmojiRepository,
	type EmojiCategory,
	type EmojiCdnResource,
	type EmojiEntry,
	type EmojiMap,
	type EmojiSkinTone
} from './emojirepository.js';

export { EmojiUtils } from './emojiutils.js';

export { EmojiCommand } from './emojicommand.js';

export type { EmojiConfig, EmojiSkinToneId, EmojiVersion } from './emojiconfig.js';

export { EmojiCategoriesView } from './ui/emojicategoriesview.js';

export {
	EmojiGridView,
	type EmojiGridViewEventData,
	type EmojiGridViewExecuteEvent,
	type EmojiSearchQueryCallback
} from './ui/emojigridview.js';

export { EmojiPickerFormView, type EmojiPickerFormViewCancelEvent } from './ui/emojipickerformview.js';

export { EmojiPickerView, type EmojiPickerViewUpdateEvent } from './ui/emojipickerview.js';

export { EmojiSearchView } from './ui/emojisearchview.js';

export { EmojiToneView } from './ui/emojitoneview.js';

export { isEmojiSupported as _isEmojiSupported } from './utils/isemojisupported.js';

import './augmentation.js';
