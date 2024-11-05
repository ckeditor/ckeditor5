/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	Emoji,
	EmojiConfig,
	EmojiMentionIntegration
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[Emoji.pluginName]: Emoji;
		[EmojiMentionIntegration.pluginName]: EmojiMentionIntegration;
	}

	interface EditorConfig {

		/**
		 * The configuration of the {@link module:emoji/emoji~Emoji} feature.
		 *
		 * Read more in {@link module:emoji/emojiconfig~EmojiConfig}.
		 */
		emoji?: EmojiConfig;
	}
}
