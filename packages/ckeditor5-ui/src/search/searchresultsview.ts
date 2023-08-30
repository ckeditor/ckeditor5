/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import View from '../view';
import type ViewCollection from '../viewcollection';

/**
 * TODO
 */
export default class SearchResultsView extends View {
	/**
	 * The collection of the child views inside of the list item {@link #element}.
	 *
	 * @readonly
	 */
	public children: ViewCollection;

	/**
	 * TODO
	 *
	 * @param locale
	 * @param filteredView
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
