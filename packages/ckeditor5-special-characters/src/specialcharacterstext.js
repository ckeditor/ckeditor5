/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import SpecialCharacters from './specialcharacters';

export default class SpecialCharactersText extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [
			SpecialCharacters
		];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Text', [
			{ character: '‹', title: t( 'Single left-pointing angle quotation mark' ) },
			{ character: '›', title: t( 'Single right-pointing angle quotation mark' ) },
			{ character: '«', title: t( 'Left-pointing double angle quotation mark' ) },
			{ character: '»', title: t( 'Right-pointing double angle quotation mark' ) },
			{ character: '‘', title: t( 'Left single quotation mark' ) },
			{ character: '’', title: t( 'Right single quotation mark' ) },
			{ character: '“', title: t( 'Left double quotation mark' ) },
			{ character: '”', title: t( 'Right double quotation mark' ) },
			{ character: '‚', title: t( 'Single low-9 quotation mark' ) },
			{ character: '„', title: t( 'Double low-9 quotation mark' ) },
			{ character: '¡', title: t( 'Inverted exclamation mark' ) },
			{ character: '¿', title: t( 'Inverted question mark' ) },
			{ character: '‥', title: t( 'Two dot leader' ) },
			{ character: '…', title: t( 'Horizontal ellipsis' ) },
			{ character: '‡', title: t( 'Double dagger' ) },
			{ character: '‰', title: t( 'Per mille sign' ) },
			{ character: '‱', title: t( 'Per ten thousand sign' ) },
			{ character: '‼', title: t( 'Double exclamation mark' ) },
			{ character: '⁈', title: t( 'Question exclamation mark' ) },
			{ character: '⁉', title: t( 'Exclamation question mark' ) },
			{ character: '⁇', title: t( 'Double question mark' ) }
		] );
	}
}
