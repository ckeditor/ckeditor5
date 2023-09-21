/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/search/searchresultsview
 */

import View from '../view';
import type ViewCollection from '../viewcollection';
import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { FocusableView } from '../focuscycler';

/**
 * A sub-component of {@link module:ui/search/text/searchtextview~SearchTextView}. It hosts the filtered and the information views.
 */
export default class SearchResultsView extends View implements FocusableView {
	/**
	 * The collection of the child views inside of the list item {@link #element}.
	 *
	 * @readonly
	 */
	public children: ViewCollection;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.children = this.createCollection();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-search__results'
				],
				tabindex: -1
			},
			children: this.children
		} );
	}

	/**
	 * Focuses the first child view.
	 */
	public focus(): void {
		const firstFocusableChild = this.children.find( ( child: any ) => typeof child.focus === 'function' );

		if ( firstFocusableChild ) {
			( firstFocusableChild as FocusableView ).focus();
		}
	}
}
