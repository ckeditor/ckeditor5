/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharactersarrows
 */

import { Plugin } from 'ckeditor5/src/core';

/**
 * A plugin that provides special characters for the "Arrows" category.
 *
 *		ClassicEditor
 *			.create( {
 *				plugins: [ ..., SpecialCharacters, SpecialCharactersArrows ],
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharactersArrows extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SpecialCharactersArrows';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.plugins.get( 'SpecialCharacters' ).addItems( 'Arrows', [
			{ title: t( 'leftwards double arrow' ), character: '⇐' },
			{ title: t( 'rightwards double arrow' ), character: '⇒' },
			{ title: t( 'upwards double arrow' ), character: '⇑' },
			{ title: t( 'downwards double arrow' ), character: '⇓' },
			{ title: t( 'leftwards dashed arrow' ), character: '⇠' },
			{ title: t( 'rightwards dashed arrow' ), character: '⇢' },
			{ title: t( 'upwards dashed arrow' ), character: '⇡' },
			{ title: t( 'downwards dashed arrow' ), character: '⇣' },
			{ title: t( 'leftwards arrow to bar' ), character: '⇤' },
			{ title: t( 'rightwards arrow to bar' ), character: '⇥' },
			{ title: t( 'upwards arrow to bar' ), character: '⤒' },
			{ title: t( 'downwards arrow to bar' ), character: '⤓' },
			{ title: t( 'up down arrow with base' ), character: '↨' },
			{ title: t( 'back with leftwards arrow above' ), character: '🔙' },
			{ title: t( 'end with leftwards arrow above' ), character: '🔚' },
			{ title: t( 'on with exclamation mark with left right arrow above' ), character: '🔛' },
			{ title: t( 'soon with rightwards arrow above' ), character: '🔜' },
			{ title: t( 'top with upwards arrow above' ), character: '🔝' }
		] );
	}
}
