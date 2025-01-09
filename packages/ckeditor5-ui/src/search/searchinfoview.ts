/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/search/searchinfoview
*/

import type { FocusableView } from '../focuscycler.js';
import View from '../view.js';

/**
 * A view displaying an information text related to different states of {@link module:ui/search/text/searchtextview~SearchTextView}.
 *
 * @internal
 */
export default class SearchInfoView extends View implements FocusableView {
	/**
	 * Controls whether the view is visible.
	 *
	 * @observable
	 * @default false
	 */
	declare public isVisible: boolean;

	/**
	 * Controls the primary line of text in the info.
	 *
	 * @observable
	 * @default ''
	 */
	declare public primaryText: string;

	/**
	 * Controls the secondary line of text in the info.
	 *
	 * @observable
	 * @default ''
	 */
	declare public secondaryText: string;

	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		const bind = this.bindTemplate;

		this.set( {
			isVisible: false,
			primaryText: '',
			secondaryText: ''
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-search__info',
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				],
				tabindex: -1
			},
			children: [
				{
					tag: 'span',
					children: [
						{
							text: [ bind.to( 'primaryText' ) ]
						}
					]
				},
				{
					tag: 'span',
					children: [
						{
							text: [ bind.to( 'secondaryText' ) ]
						}
					]
				}
			]
		} );
	}

	/**
	 * Focuses the view
	 */
	public focus(): void {
		this.element!.focus();
	}
}
