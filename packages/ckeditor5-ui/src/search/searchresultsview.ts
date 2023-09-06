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

/**
 * A sub-component of {@link module:ui/search/searchview~SearchView}. It hosts the filtered and the information views.
 */
export default class SearchResultsView extends View {
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
				]
			},
			children: this.children
		} );
	}
}
