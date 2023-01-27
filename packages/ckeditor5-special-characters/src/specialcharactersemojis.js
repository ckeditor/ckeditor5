/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharactersarrows
 */

import { Plugin } from 'ckeditor5/src/core';

/**
 * A plugin that provides special characters for the "Emojis" category.
 *
 *		ClassicEditor
 *			.create( {
 *				plugins: [ ..., SpecialCharacters, SpecialCharactersEmojis ],
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharactersEmojis extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SpecialCharactersEmojis';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.plugins.get( 'SpecialCharacters' ).addItems( 'Emojis', [
			{ title: 'smiley_face', character: '😊' },
			{ title: 'grining_face', character: '😄' },
			{ title: 'grinning_face_with_big_eyes', character: '😃' },
			{ title: 'grinning_face_with_sweat', character: '😅' },
			{ title: 'beaming_face_with_smiling_eyes', character: '😃' },
			{ title: 'neutral face', character: '😐' },
			{ title: 'rolling_on_the_floor_laughing', character: '🤣' },
			{ title: 'face_with_tears_of_joy', character: '😂' },
			{ title: 'heart', character: '❤️' },
			{ title: 'hands_pressed_together', character: '🙏' },
			{ title: 'thumbs_up', character: '👍' },
			{ title: 'rocket', character: '🚀' },
			{ title: '100', character: '💯' },
			{ title: 'wind blowing face', character: '🌬️' },
			{ title: 'floppy disk', character: '💾' }
		], { label: t( 'Emojis' ) } );
	}
}
