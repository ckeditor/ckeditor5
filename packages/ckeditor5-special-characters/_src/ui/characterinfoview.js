/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/characterinfoview
 */

import { View } from 'ckeditor5/src/ui';

import '../../theme/characterinfo.css';

/**
 * The view displaying detailed information about a special character glyph, e.g. upon
 * hovering it with a mouse.
 *
 * @extends module:ui/view~View
 */
export default class CharacterInfoView extends View {
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * The character whose information is displayed by the view. For instance,
		 * "∑" or "¿".
		 *
		 * @observable
		 * @member {String|null} #character
		 */
		this.set( 'character', null );

		/**
		 * The name of the {@link #character}. For instance,
		 * "N-ary summation" or "Inverted question mark".
		 *
		 * @observable
		 * @member {String|null} #name
		 */
		this.set( 'name', null );

		/**
		 * The "Unicode string" of the {@link #character}. For instance,
		 * "U+0061".
		 *
		 * @observable
		 * @readonly
		 * @member {String} #code
		 */
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

// Converts a character into a "Unicode string", for instance:
//
//	"$" -> "U+0024"
//
// Returns an empty string when the character is `null`.
//
// @param {String} character
// @returns {String}
function characterToUnicodeString( character ) {
	if ( character === null ) {
		return '';
	}

	const hexCode = character.codePointAt( 0 ).toString( 16 );

	return 'U+' + ( '0000' + hexCode ).slice( -4 );
}
