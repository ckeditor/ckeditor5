/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharactersemojis
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
			{ title: 'smiley face', character: '😊' },
			{ title: 'grining face', character: '😄' },
			{ title: 'grinning face with big eyes', character: '😃' },
			{ title: 'grinning face with sweat', character: '😅' },
			{ title: 'beaming face with smiling eyes', character: '😃' },
			{ title: 'neutral face', character: '😐' },
			{ title: 'rolling on the floor laughing', character: '🤣' },
			{ title: 'face with tears of joy', character: '😂' },
			{ title: 'heart', character: '❤️' },
			{ title: 'hands pressed together', character: '🙏' },
			{ title: 'thumbs up', character: '👍' },
			{ title: 'rocket', character: '🚀' },
			{ title: '100', character: '💯' },
			{ title: 'wind blowing face', character: '🌬️' },
			{ title: 'floppy disk', character: '💾' }
		], { label: t( 'Emojis' ) } );
	}
}
