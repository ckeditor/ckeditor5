/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import SpecialCharacters from './specialcharacters';

export default class SpecialCharactersLatin extends Plugin {
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
		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Latin', [
			{
				character: 'Ā',
				title: 'Latin capital letter a with macron'
			},
			{
				character: 'ā',
				title: 'Latin small letter a with macron'
			},
			{
				character: 'Ă',
				title: 'Latin capital letter a with breve'
			},
			{
				character: 'ă',
				title: 'Latin small letter a with breve'
			},
			{
				character: 'Ą',
				title: 'Latin capital letter a with ogonek'
			},
			{
				character: 'ą',
				title: 'Latin small letter a with ogonek'
			},
			{
				character: 'Ć',
				title: 'Latin capital letter c with acute'
			},
			{
				character: 'ć',
				title: 'Latin small letter c with acute'
			},
			{
				character: 'Ĉ',
				title: 'Latin capital letter c with circumflex'
			},
			{
				character: 'ĉ',
				title: 'Latin small letter c with circumflex'
			},
			{
				character: 'Ċ',
				title: 'Latin capital letter c with dot above'
			},
			{
				character: 'ċ',
				title: 'Latin small letter c with dot above'
			},
			{
				character: 'Č',
				title: 'Latin capital letter c with caron'
			},
			{
				character: 'č',
				title: 'Latin small letter c with caron'
			},
			{
				character: 'Ď',
				title: 'Latin capital letter d with caron'
			},
			{
				character: 'ď',
				title: 'Latin small letter d with caron'
			},
			{
				character: 'Đ',
				title: 'Latin capital letter d with stroke'
			},
			{
				character: 'đ',
				title: 'Latin small letter d with stroke'
			},
			{
				character: 'Ē',
				title: 'Latin capital letter e with macron'
			},
			{
				character: 'ē',
				title: 'Latin small letter e with macron'
			},
			{
				character: 'Ĕ',
				title: 'Latin capital letter e with breve'
			},
			{
				character: 'ĕ',
				title: 'Latin small letter e with breve'
			},
			{
				character: 'Ė',
				title: 'Latin capital letter e with dot above'
			},
			{
				character: 'ė',
				title: 'Latin small letter e with dot above'
			},
			{
				character: 'Ę',
				title: 'Latin capital letter e with ogonek'
			},
			{
				character: 'ę',
				title: 'Latin small letter e with ogonek'
			},
			{
				character: 'Ě',
				title: 'Latin capital letter e with caron'
			},
			{
				character: 'ě',
				title: 'Latin small letter e with caron'
			},
			{
				character: 'Ĝ',
				title: 'Latin capital letter g with circumflex'
			},
			{
				character: 'ĝ',
				title: 'Latin small letter g with circumflex'
			},
			{
				character: 'Ğ',
				title: 'Latin capital letter g with breve'
			},
			{
				character: 'ğ',
				title: 'Latin small letter g with breve'
			},
			{
				character: 'Ġ',
				title: 'Latin capital letter g with dot above'
			},
			{
				character: 'ġ',
				title: 'Latin small letter g with dot above'
			},
			{
				character: 'Ģ',
				title: 'Latin capital letter g with cedilla'
			},
			{
				character: 'ģ',
				title: 'Latin small letter g with cedilla'
			},
			{
				character: 'Ĥ',
				title: 'Latin capital letter h with circumflex'
			},
			{
				character: 'ĥ',
				title: 'Latin small letter h with circumflex'
			},
			{
				character: 'Ħ',
				title: 'Latin capital letter h with stroke'
			},
			{
				character: 'ħ',
				title: 'Latin small letter h with stroke'
			},
			{
				character: 'Ĩ',
				title: 'Latin capital letter i with tilde'
			},
			{
				character: 'ĩ',
				title: 'Latin small letter i with tilde'
			},
			{
				character: 'Ī',
				title: 'Latin capital letter i with macron'
			},
			{
				character: 'ī',
				title: 'Latin small letter i with macron'
			},
			{
				character: 'Ĭ',
				title: 'Latin capital letter i with breve'
			},
			{
				character: 'ĭ',
				title: 'Latin small letter i with breve'
			},
			{
				character: 'Į',
				title: 'Latin capital letter i with ogonek'
			},
			{
				character: 'į',
				title: 'Latin small letter i with ogonek'
			},
			{
				character: 'İ',
				title: 'Latin capital letter i with dot above'
			},
			{
				character: 'ı',
				title: 'Latin small letter dotless i'
			},
			{
				character: 'Ĳ',
				title: 'Latin capital ligature ij'
			},
			{
				character: 'ĳ',
				title: 'Latin small ligature ij'
			},
			{
				character: 'Ĵ',
				title: 'Latin capital letter j with circumflex'
			},
			{
				character: 'ĵ',
				title: 'Latin small letter j with circumflex'
			},
			{
				character: 'Ķ',
				title: 'Latin capital letter k with cedilla'
			},
			{
				character: 'ķ',
				title: 'Latin small letter k with cedilla'
			},
			{
				character: 'ĸ',
				title: 'Latin small letter kra'
			},
			{
				character: 'Ĺ',
				title: 'Latin capital letter l with acute'
			},
			{
				character: 'ĺ',
				title: 'Latin small letter l with acute'
			},
			{
				character: 'Ļ',
				title: 'Latin capital letter l with cedilla'
			},
			{
				character: 'ļ',
				title: 'Latin small letter l with cedilla'
			},
			{
				character: 'Ľ',
				title: 'Latin capital letter l with caron'
			},
			{
				character: 'ľ',
				title: 'Latin small letter l with caron'
			},
			{
				character: 'Ŀ',
				title: 'Latin capital letter l with middle dot'
			},
			{
				character: 'ŀ',
				title: 'Latin small letter l with middle dot'
			},
			{
				character: 'Ł',
				title: 'Latin capital letter l with stroke'
			},
			{
				character: 'ł',
				title: 'Latin small letter l with stroke'
			},
			{
				character: 'Ń',
				title: 'Latin capital letter n with acute'
			},
			{
				character: 'ń',
				title: 'Latin small letter n with acute'
			},
			{
				character: 'Ņ',
				title: 'Latin capital letter n with cedilla'
			},
			{
				character: 'ņ',
				title: 'Latin small letter n with cedilla'
			},
			{
				character: 'Ň',
				title: 'Latin capital letter n with caron'
			},
			{
				character: 'ň',
				title: 'Latin small letter n with caron'
			},
			{
				character: 'ŉ',
				title: 'Latin small letter n preceded by apostrophe'
			},
			{
				character: 'Ŋ',
				title: 'Latin capital letter eng'
			},
			{
				character: 'ŋ',
				title: 'Latin small letter eng'
			},
			{
				character: 'Ō',
				title: 'Latin capital letter o with macron'
			},
			{
				character: 'ō',
				title: 'Latin small letter o with macron'
			},
			{
				character: 'Ŏ',
				title: 'Latin capital letter o with breve'
			},
			{
				character: 'ŏ',
				title: 'Latin small letter o with breve'
			},
			{
				character: 'Ő',
				title: 'Latin capital letter o with double acute'
			},
			{
				character: 'ő',
				title: 'Latin small letter o with double acute'
			},
			{
				character: 'Œ',
				title: 'Latin capital ligature oe'
			},
			{
				character: 'œ',
				title: 'Latin small ligature oe'
			},
			{
				character: 'Ŕ',
				title: 'Latin capital letter r with acute'
			},
			{
				character: 'ŕ',
				title: 'Latin small letter r with acute'
			},
			{
				character: 'Ŗ',
				title: 'Latin capital letter r with cedilla'
			},
			{
				character: 'ŗ',
				title: 'Latin small letter r with cedilla'
			},
			{
				character: 'Ř',
				title: 'Latin capital letter r with caron'
			},
			{
				character: 'ř',
				title: 'Latin small letter r with caron'
			},
			{
				character: 'Ś',
				title: 'Latin capital letter s with acute'
			},
			{
				character: 'ś',
				title: 'Latin small letter s with acute'
			},
			{
				character: 'Ŝ',
				title: 'Latin capital letter s with circumflex'
			},
			{
				character: 'ŝ',
				title: 'Latin small letter s with circumflex'
			},
			{
				character: 'Ş',
				title: 'Latin capital letter s with cedilla'
			},
			{
				character: 'ş',
				title: 'Latin small letter s with cedilla'
			},
			{
				character: 'Š',
				title: 'Latin capital letter s with caron'
			},
			{
				character: 'š',
				title: 'Latin small letter s with caron'
			},
			{
				character: 'Ţ',
				title: 'Latin capital letter t with cedilla'
			},
			{
				character: 'ţ',
				title: 'Latin small letter t with cedilla'
			},
			{
				character: 'Ť',
				title: 'Latin capital letter t with caron'
			},
			{
				character: 'ť',
				title: 'Latin small letter t with caron'
			},
			{
				character: 'Ŧ',
				title: 'Latin capital letter t with stroke'
			},
			{
				character: 'ŧ',
				title: 'Latin small letter t with stroke'
			},
			{
				character: 'Ũ',
				title: 'Latin capital letter u with tilde'
			},
			{
				character: 'ũ',
				title: 'Latin small letter u with tilde'
			},
			{
				character: 'Ū',
				title: 'Latin capital letter u with macron'
			},
			{
				character: 'ū',
				title: 'Latin small letter u with macron'
			},
			{
				character: 'Ŭ',
				title: 'Latin capital letter u with breve'
			},
			{
				character: 'ŭ',
				title: 'Latin small letter u with breve'
			},
			{
				character: 'Ů',
				title: 'Latin capital letter u with ring above'
			},
			{
				character: 'ů',
				title: 'Latin small letter u with ring above'
			},
			{
				character: 'Ű',
				title: 'Latin capital letter u with double acute'
			},
			{
				character: 'ű',
				title: 'Latin small letter u with double acute'
			},
			{
				character: 'Ų',
				title: 'Latin capital letter u with ogonek'
			},
			{
				character: 'ų',
				title: 'Latin small letter u with ogonek'
			},
			{
				character: 'Ŵ',
				title: 'Latin capital letter w with circumflex'
			},
			{
				character: 'ŵ',
				title: 'Latin small letter w with circumflex'
			},
			{
				character: 'Ŷ',
				title: 'Latin capital letter y with circumflex'
			},
			{
				character: 'ŷ',
				title: 'Latin small letter y with circumflex'
			},
			{
				character: 'Ÿ',
				title: 'Latin capital letter y with diaeresis'
			},
			{
				character: 'Ź',
				title: 'Latin capital letter z with acute'
			},
			{
				character: 'ź',
				title: 'Latin small letter z with acute'
			},
			{
				character: 'Ż',
				title: 'Latin capital letter z with dot above'
			},
			{
				character: 'ż',
				title: 'Latin small letter z with dot above'
			},
			{
				character: 'Ž',
				title: 'Latin capital letter z with caron'
			},
			{
				character: 'ž',
				title: 'Latin small letter z with caron'
			},
			{
				character: 'ſ',
				title: 'Latin small letter long s'
			}
		] );
	}
}
