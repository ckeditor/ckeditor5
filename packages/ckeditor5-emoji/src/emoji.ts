/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emoji
 */

import { Plugin } from 'ckeditor5/src/core.js';
import EmojiMention from './emojimention.js';
import EmojiPicker from './emojipicker.js';

import '../theme/emoji.css';

/**
 * The emoji plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:emoji/emojimention~EmojiMention},
 * * {@link module:emoji/emojipicker~EmojiPicker},
 */
export default class Emoji extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ EmojiMention, EmojiPicker ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Emoji' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
