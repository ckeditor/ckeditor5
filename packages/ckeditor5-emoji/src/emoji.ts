/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/emoji
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { Typing } from 'ckeditor5/src/typing.js';
import { Mention } from '@ckeditor/ckeditor5-mention';
import EmojiMentionIntegration from './emojimentionintegration.js';

import '../theme/emoji.css';
import InsertEmojiCommand from './insertemojicommand.js';

/**
 * The emoji feature.
 */
export default class Emoji extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Typing, Mention, EmojiMentionIntegration ] as const;
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

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this.editor.commands.add( 'insertEmoji', new InsertEmojiCommand( this.editor ) );
	}
}
