/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacterslatin
 */

import { Plugin } from 'ckeditor5/src/core';

/**
 * A plugin that provides special characters for the "Latin" category.
 *
 *		ClassicEditor
 *			.create( {
 *				plugins: [ ..., SpecialCharacters, SpecialCharactersLatin ],
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharactersLatin extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SpecialCharactersLatin';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.plugins.get( 'SpecialCharacters' ).addItems( 'Latin', [
			{ character: 'Ā', title: t( 'Latin capital letter a with macron' ) },
			{ character: 'ā', title: t( 'Latin small letter a with macron' ) },
			{ character: 'Ă', title: t( 'Latin capital letter a with breve' ) },
			{ character: 'ă', title: t( 'Latin small letter a with breve' ) },
			{ character: 'Ą', title: t( 'Latin capital letter a with ogonek' ) },
			{ character: 'ą', title: t( 'Latin small letter a with ogonek' ) },
			{ character: 'Ć', title: t( 'Latin capital letter c with acute' ) },
			{ character: 'ć', title: t( 'Latin small letter c with acute' ) },
			{ character: 'Ĉ', title: t( 'Latin capital letter c with circumflex' ) },
			{ character: 'ĉ', title: t( 'Latin small letter c with circumflex' ) },
			{ character: 'Ċ', title: t( 'Latin capital letter c with dot above' ) },
			{ character: 'ċ', title: t( 'Latin small letter c with dot above' ) },
			{ character: 'Č', title: t( 'Latin capital letter c with caron' ) },
			{ character: 'č', title: t( 'Latin small letter c with caron' ) },
			{ character: 'Ď', title: t( 'Latin capital letter d with caron' ) },
			{ character: 'ď', title: t( 'Latin small letter d with caron' ) },
			{ character: 'Đ', title: t( 'Latin capital letter d with stroke' ) },
			{ character: 'đ', title: t( 'Latin small letter d with stroke' ) },
			{ character: 'Ē', title: t( 'Latin capital letter e with macron' ) },
			{ character: 'ē', title: t( 'Latin small letter e with macron' ) },
			{ character: 'Ĕ', title: t( 'Latin capital letter e with breve' ) },
			{ character: 'ĕ', title: t( 'Latin small letter e with breve' ) },
			{ character: 'Ė', title: t( 'Latin capital letter e with dot above' ) },
			{ character: 'ė', title: t( 'Latin small letter e with dot above' ) },
			{ character: 'Ę', title: t( 'Latin capital letter e with ogonek' ) },
			{ character: 'ę', title: t( 'Latin small letter e with ogonek' ) },
			{ character: 'Ě', title: t( 'Latin capital letter e with caron' ) },
			{ character: 'ě', title: t( 'Latin small letter e with caron' ) },
			{ character: 'Ĝ', title: t( 'Latin capital letter g with circumflex' ) },
			{ character: 'ĝ', title: t( 'Latin small letter g with circumflex' ) },
			{ character: 'Ğ', title: t( 'Latin capital letter g with breve' ) },
			{ character: 'ğ', title: t( 'Latin small letter g with breve' ) },
			{ character: 'Ġ', title: t( 'Latin capital letter g with dot above' ) },
			{ character: 'ġ', title: t( 'Latin small letter g with dot above' ) },
			{ character: 'Ģ', title: t( 'Latin capital letter g with cedilla' ) },
			{ character: 'ģ', title: t( 'Latin small letter g with cedilla' ) },
			{ character: 'Ĥ', title: t( 'Latin capital letter h with circumflex' ) },
			{ character: 'ĥ', title: t( 'Latin small letter h with circumflex' ) },
			{ character: 'Ħ', title: t( 'Latin capital letter h with stroke' ) },
			{ character: 'ħ', title: t( 'Latin small letter h with stroke' ) },
			{ character: 'Ĩ', title: t( 'Latin capital letter i with tilde' ) },
			{ character: 'ĩ', title: t( 'Latin small letter i with tilde' ) },
			{ character: 'Ī', title: t( 'Latin capital letter i with macron' ) },
			{ character: 'ī', title: t( 'Latin small letter i with macron' ) },
			{ character: 'Ĭ', title: t( 'Latin capital letter i with breve' ) },
			{ character: 'ĭ', title: t( 'Latin small letter i with breve' ) },
			{ character: 'Į', title: t( 'Latin capital letter i with ogonek' ) },
			{ character: 'į', title: t( 'Latin small letter i with ogonek' ) },
			{ character: 'İ', title: t( 'Latin capital letter i with dot above' ) },
			{ character: 'ı', title: t( 'Latin small letter dotless i' ) },
			{ character: 'Ĳ', title: t( 'Latin capital ligature ij' ) },
			{ character: 'ĳ', title: t( 'Latin small ligature ij' ) },
			{ character: 'Ĵ', title: t( 'Latin capital letter j with circumflex' ) },
			{ character: 'ĵ', title: t( 'Latin small letter j with circumflex' ) },
			{ character: 'Ķ', title: t( 'Latin capital letter k with cedilla' ) },
			{ character: 'ķ', title: t( 'Latin small letter k with cedilla' ) },
			{ character: 'ĸ', title: t( 'Latin small letter kra' ) },
			{ character: 'Ĺ', title: t( 'Latin capital letter l with acute' ) },
			{ character: 'ĺ', title: t( 'Latin small letter l with acute' ) },
			{ character: 'Ļ', title: t( 'Latin capital letter l with cedilla' ) },
			{ character: 'ļ', title: t( 'Latin small letter l with cedilla' ) },
			{ character: 'Ľ', title: t( 'Latin capital letter l with caron' ) },
			{ character: 'ľ', title: t( 'Latin small letter l with caron' ) },
			{ character: 'Ŀ', title: t( 'Latin capital letter l with middle dot' ) },
			{ character: 'ŀ', title: t( 'Latin small letter l with middle dot' ) },
			{ character: 'Ł', title: t( 'Latin capital letter l with stroke' ) },
			{ character: 'ł', title: t( 'Latin small letter l with stroke' ) },
			{ character: 'Ń', title: t( 'Latin capital letter n with acute' ) },
			{ character: 'ń', title: t( 'Latin small letter n with acute' ) },
			{ character: 'Ņ', title: t( 'Latin capital letter n with cedilla' ) },
			{ character: 'ņ', title: t( 'Latin small letter n with cedilla' ) },
			{ character: 'Ň', title: t( 'Latin capital letter n with caron' ) },
			{ character: 'ň', title: t( 'Latin small letter n with caron' ) },
			{ character: 'ŉ', title: t( 'Latin small letter n preceded by apostrophe' ) },
			{ character: 'Ŋ', title: t( 'Latin capital letter eng' ) },
			{ character: 'ŋ', title: t( 'Latin small letter eng' ) },
			{ character: 'Ō', title: t( 'Latin capital letter o with macron' ) },
			{ character: 'ō', title: t( 'Latin small letter o with macron' ) },
			{ character: 'Ŏ', title: t( 'Latin capital letter o with breve' ) },
			{ character: 'ŏ', title: t( 'Latin small letter o with breve' ) },
			{ character: 'Ő', title: t( 'Latin capital letter o with double acute' ) },
			{ character: 'ő', title: t( 'Latin small letter o with double acute' ) },
			{ character: 'Œ', title: t( 'Latin capital ligature oe' ) },
			{ character: 'œ', title: t( 'Latin small ligature oe' ) },
			{ character: 'Ŕ', title: t( 'Latin capital letter r with acute' ) },
			{ character: 'ŕ', title: t( 'Latin small letter r with acute' ) },
			{ character: 'Ŗ', title: t( 'Latin capital letter r with cedilla' ) },
			{ character: 'ŗ', title: t( 'Latin small letter r with cedilla' ) },
			{ character: 'Ř', title: t( 'Latin capital letter r with caron' ) },
			{ character: 'ř', title: t( 'Latin small letter r with caron' ) },
			{ character: 'Ś', title: t( 'Latin capital letter s with acute' ) },
			{ character: 'ś', title: t( 'Latin small letter s with acute' ) },
			{ character: 'Ŝ', title: t( 'Latin capital letter s with circumflex' ) },
			{ character: 'ŝ', title: t( 'Latin small letter s with circumflex' ) },
			{ character: 'Ş', title: t( 'Latin capital letter s with cedilla' ) },
			{ character: 'ş', title: t( 'Latin small letter s with cedilla' ) },
			{ character: 'Š', title: t( 'Latin capital letter s with caron' ) },
			{ character: 'š', title: t( 'Latin small letter s with caron' ) },
			{ character: 'Ţ', title: t( 'Latin capital letter t with cedilla' ) },
			{ character: 'ţ', title: t( 'Latin small letter t with cedilla' ) },
			{ character: 'Ť', title: t( 'Latin capital letter t with caron' ) },
			{ character: 'ť', title: t( 'Latin small letter t with caron' ) },
			{ character: 'Ŧ', title: t( 'Latin capital letter t with stroke' ) },
			{ character: 'ŧ', title: t( 'Latin small letter t with stroke' ) },
			{ character: 'Ũ', title: t( 'Latin capital letter u with tilde' ) },
			{ character: 'ũ', title: t( 'Latin small letter u with tilde' ) },
			{ character: 'Ū', title: t( 'Latin capital letter u with macron' ) },
			{ character: 'ū', title: t( 'Latin small letter u with macron' ) },
			{ character: 'Ŭ', title: t( 'Latin capital letter u with breve' ) },
			{ character: 'ŭ', title: t( 'Latin small letter u with breve' ) },
			{ character: 'Ů', title: t( 'Latin capital letter u with ring above' ) },
			{ character: 'ů', title: t( 'Latin small letter u with ring above' ) },
			{ character: 'Ű', title: t( 'Latin capital letter u with double acute' ) },
			{ character: 'ű', title: t( 'Latin small letter u with double acute' ) },
			{ character: 'Ų', title: t( 'Latin capital letter u with ogonek' ) },
			{ character: 'ų', title: t( 'Latin small letter u with ogonek' ) },
			{ character: 'Ŵ', title: t( 'Latin capital letter w with circumflex' ) },
			{ character: 'ŵ', title: t( 'Latin small letter w with circumflex' ) },
			{ character: 'Ŷ', title: t( 'Latin capital letter y with circumflex' ) },
			{ character: 'ŷ', title: t( 'Latin small letter y with circumflex' ) },
			{ character: 'Ÿ', title: t( 'Latin capital letter y with diaeresis' ) },
			{ character: 'Ź', title: t( 'Latin capital letter z with acute' ) },
			{ character: 'ź', title: t( 'Latin small letter z with acute' ) },
			{ character: 'Ż', title: t( 'Latin capital letter z with dot above' ) },
			{ character: 'ż', title: t( 'Latin small letter z with dot above' ) },
			{ character: 'Ž', title: t( 'Latin capital letter z with caron' ) },
			{ character: 'ž', title: t( 'Latin small letter z with caron' ) },
			{ character: 'ſ', title: t( 'Latin small letter long s' ) }
		], { label: t( 'Latin' ) } );
	}
}
