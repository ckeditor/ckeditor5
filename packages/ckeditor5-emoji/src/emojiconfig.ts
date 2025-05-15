/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/emojiconfig
 */

/**
 * The configuration of the Emoji feature.
 *
 * Read more about {@glink features/emoji#configuration configuring the Emoji feature}.
 *
 * ```ts
 *	ClassicEditor
 *		.create( editorElement, {
 *			emoji: ... // Emoji feature options.
 *		} )
 *		.then( ... )
 *		.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 */
export interface EmojiConfig {

	/**
	 * The maximum number of emojis displayed in the dropdown list.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ Emoji, ... ],
	 *			emoji: {
	 *				dropdownLimit: 4
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 *
	 * @default 6
	 */
	dropdownLimit?: number;

	/**
	 * Initial skin tone for the emojis that support skin tones.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ Emoji, ... ],
	 *			emoji: {
	 *				skinTone: 'medium'
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 *
	 * @default 'default'
	 */
	skinTone?: SkinToneId;

	/**
	 * The URL from which the emoji definitions should be loaded.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ Emoji, ... ],
	 *			emoji: {
	 *				definitionsUrl: ''
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 */
	definitionsUrl?: string;

	/**
	 * The emoji database version.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ Emoji, ... ],
	 *			emoji: {
	 *				version: 15
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 *
	 * If the {@link module:emoji/emojiconfig~EmojiConfig#definitionsUrl `emoji.definitionsUrl`}
	 * option is provided, `version` is ignored as the defined URL takes precedence over the `version`.
	 */
	version?: EmojiVersion;

	/**
	 * The availability of the emoji depends on the operating system. Different systems will have different Unicode support.
	 *
	 * By default, the feature tries to filter out emojis not supported by your operating system.
	 * This means that instead of previewing an emoji, the feature renders a black square.
	 *
	 * If you customize the {@glink features/emoji#emoji-availability-and-appearance emoji availability and appearance}, it is
	 * highly recommended to disable the filtering mechanism because it uses a font built into your system
	 * instead of the provided custom font.
	 */
	useCustomFont?: boolean;
}

export type SkinToneId = 'default' | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';

export type EmojiVersion = 15 | 16;
