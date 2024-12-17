/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/ui/emojiinfoview
 */

import type { Locale } from 'ckeditor5/src/utils.js';
import { View } from 'ckeditor5/src/ui.js';

import '../../theme/emojiinfo.css';

/**
 * The view displaying detailed information about an emoji e.g. upon hovering it with a mouse.
 */
export default class EmojiInfoView extends View<HTMLDivElement> {
	/**
	 * The emoji whose information is displayed by the view.
	 *
	 * @observable
	 */
	declare public emoji: string | null;

	/**
	 * The name of the {@link #emoji}. For instance, "N-ary summation" or "Inverted question mark".
	 *
	 * @observable
	 */
	declare public name: string | null;

	/**
	 * The "Unicode string" of the {@link #emoji}. For instance "U+0061".
	 *
	 * @observable
	 */
	declare public readonly code: string;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'emoji', null );
		this.set( 'name', null );
		this.bind( 'code' ).to( this, 'emoji', characterToUnicodeString );

		this.setTemplate( {
			tag: 'div',
			children: [
				{
					tag: 'span',
					attributes: {
						class: [
							'ck-emoji-info__name'
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
							'ck-emoji-info__code'
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
					'ck-emoji-info'
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
function characterToUnicodeString( emoji: string | null ): string {
	if ( emoji === null ) {
		return '';
	}

	const hexCode = emoji.codePointAt( 0 )!.toString( 16 );

	return 'U+' + ( '0000' + hexCode ).slice( -4 );
}
