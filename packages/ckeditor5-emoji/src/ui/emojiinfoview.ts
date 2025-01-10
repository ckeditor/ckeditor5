/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
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
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'emoji', null );
		this.set( 'name', null );

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
