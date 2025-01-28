/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module special-characters/ui/characterinfoview
 */

import type { Locale } from 'ckeditor5/src/utils.js';
import { View } from 'ckeditor5/src/ui.js';

import '../../theme/characterinfo.css';

/**
 * The view displaying detailed information about a special character glyph, e.g. upon
 * hovering it with a mouse.
 */
export default class CharacterInfoView extends View<HTMLDivElement> {
	/**
	 * The character whose information is displayed by the view. For instance, "∑" or "¿".
	 *
	 * @observable
	 */
	declare public character: string | null;

	/**
	 * The name of the {@link #character}. For instance, "N-ary summation" or "Inverted question mark".
	 *
	 * @observable
	 */
	declare public name: string | null;

	/**
	 * The "Unicode string" of the {@link #character}. For instance "U+0061".
	 *
	 * @observable
	 */
	declare public readonly code: string;

	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'character', null );
		this.set( 'name', null );
		this.bind( 'code' ).to( this, 'character', characterToUnicodeString );

		this.setTemplate( {
			tag: 'div',
			children: [
				{
					tag: 'span',
					attributes: {
						class: [
							'ck-character-info__name'
						]
					},
					children: [
						{
							// Note: ZWSP to prevent vertical collapsing.
							text: bind.to( 'name', name => name ? name : '\u200B' )
						}
					]
				},
				{
					tag: 'span',
					attributes: {
						class: [
							'ck-character-info__code'
						]
					},
					children: [
						{
							text: bind.to( 'code' )
						}
					]
				}
			],
			attributes: {
				class: [
					'ck',
					'ck-character-info'
				]
			}
		} );
	}
}

/**
 * Converts a character into a "Unicode string", for instance:
 *
 * "$" -> "U+0024"
 *
 * Returns an empty string when the character is `null`.
 */
function characterToUnicodeString( character: string | null ): string {
	if ( character === null ) {
		return '';
	}

	const hexCode = character.codePointAt( 0 )!.toString( 16 );

	return 'U+' + ( '0000' + hexCode ).slice( -4 );
}
