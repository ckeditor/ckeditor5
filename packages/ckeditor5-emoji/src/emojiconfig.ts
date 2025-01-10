/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { SkinToneId } from './ui/emojitoneview.js';

/**
 * @module emoji/emojiconfig
 */

/**
 * The configuration of the emoji feature.
 *
 * Read more about {@glink features/emoji#configuration configuring the emoji feature}.
 *
 * ```ts
 * ClassicEditor
 *   .create( editorElement, {
 *     emoji: ... // Emoji feature options.
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 */
export interface EmojiConfig {

	/**
	 * The maximum number of emojis displayed in the dropdown list.
	 *
	 * ```ts
	 *		ClassicEditor
	 *			.create( editorElement, {
	 *				plugins: [ Emoji, ... ],
	 *				emoji: {
	 *					dropdownLimit: 4
	 *					// More of editor configuration.
	 * 					// ...
	 * 				}
	 *			} )
	 *			.then( ... )
	 *			.catch( ... );
	 * ```
	 */
	dropdownLimit?: number;

	/**
	 * Initial skin tone for the emoji picker.
	 *
	 * ```ts
	 *		ClassicEditor
	 *			.create( editorElement, {
	 *				plugins: [ Emoji, ... ],
	 *				emoji: {
	 *					defaultSkinTone: 'medium'
	 *					// More of editor configuration.
	 * 					// ...
	 * 				}
	 *			} )
	 *			.then( ... )
	 *			.catch( ... );
	 * ```
	 */
	defaultSkinTone?: SkinToneId;
}
