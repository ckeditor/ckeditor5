/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacterstext
 */

import { Plugin } from 'ckeditor5/src/core';
import type SpecialCharacters from './specialcharacters';

/**
 * A plugin that provides special characters for the "Text" category.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., SpecialCharacters, SpecialCharactersText ],
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */
export default class SpecialCharactersText extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'SpecialCharactersText' {
		return 'SpecialCharactersText';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;
		const plugin: SpecialCharacters = editor.plugins.get( 'SpecialCharacters' );

		plugin.addItems( 'Text', [
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
			{ character: '⁇', title: t( 'Double question mark' ) },
			{ character: '©', title: t( 'Copyright sign' ) },
			{ character: '®', title: t( 'Registered sign' ) },
			{ character: '™', title: t( 'Trade mark sign' ) },
			{ character: '§', title: t( 'Section sign' ) },
			{ character: '¶', title: t( 'Paragraph sign' ) },
			{ character: '⁋', title: t( 'Reversed paragraph sign' ) }
		], { label: t( 'Text' ) } );
	}
}
