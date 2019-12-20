/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/characterinfoview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';

import '../../theme/characterinfo.css';

export default class CharacterInfoView extends View {
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'character', null );
		this.set( 'name', null );

		this.bind( 'code' ).to( this, 'character', char => {
			if ( char === null ) {
				return '';
			}

			const hexCode = char.codePointAt( 0 ).toString( 16 );

			return 'U+' + ( '0000' + hexCode ).slice( -4 );
		} );

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
							text: bind.to( 'name', name => {
								if ( !name ) {
									// ZWSP to prevent vertical collapsing.
									return '\u200B';
								}

								return name;
							} )
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
