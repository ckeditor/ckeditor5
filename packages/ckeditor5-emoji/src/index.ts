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
export { EmojiRepository } from './emojirepository.js';
export { EmojiUtils } from './emojiutils.js';
export { EmojiCommand } from './emojicommand.js';

export type { EmojiConfig } from './emojiconfig.js';

export { isEmojiSupported as _isEmojiSupported } from './utils/isemojisupported.js';

import './augmentation.js';
