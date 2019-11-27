/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SpecialCharactersArrows extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Arrows', [
			{ title: 'leftwards double arrow', character: '⇐' },
			{ title: 'rightwards double arrow', character: '⇒' },
			{ title: 'upwards double arrow', character: '⇑' },
			{ title: 'downwards double arrow', character: '⇓' },
			{ title: 'leftwards dashed arrow', character: '⇠' },
			{ title: 'rightwards dashed arrow', character: '⇢' },
			{ title: 'upwards dashed arrow', character: '⇡' },
			{ title: 'downwards dashed arrow', character: '⇣' },
			{ title: 'leftwards arrow to bar', character: '⇤' },
			{ title: 'rightwards arrow to bar', character: '⇥' },
			{ title: 'upwards arrow to bar', character: '⤒' },
			{ title: 'downwards arrow to bar', character: '⤓' },
			{ title: 'up down arrow with base', character: '↨' },
			{ title: 'back with leftwards arrow above', character: '🔙' },
			{ title: 'end with leftwards arrow above', character: '🔚' },
			{ title: 'on with exclamation mark with left right arrow above', character: '🔛' },
			{ title: 'soon with rightwards arrow above', character: '🔜' },
			{ title: 'top with upwards arrow above', character: '🔝' }
		] );
	}
}
