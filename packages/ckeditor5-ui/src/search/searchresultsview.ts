/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/search/searchresultsview
 */

import View from '../view.js';
import type ViewCollection from '../viewcollection.js';
import { FocusTracker, type Locale } from '@ckeditor/ckeditor5-utils';
import { default as FocusCycler, type FocusableView } from '../focuscycler.js';

/**
 * A sub-component of {@link module:ui/search/text/searchtextview~SearchTextView}. It hosts the filtered and the information views.
 */
export default class SearchResultsView extends View implements FocusableView {
	/**
	 * Tracks information about the DOM focus in the view.
	 *
	 * @readonly
	 */
	public focusTracker: FocusTracker;

	/**
	 * The collection of the child views inside of the list item {@link #element}.
	 *
	 * @readonly
	 */
	public children: ViewCollection<FocusableView>;

	/**
	 * Provides the focus management (keyboard navigation) in the view.
	 *
	 * @readonly
	 */
	protected _focusCycler: FocusCycler;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.children = this.createCollection();
		this.focusTracker = new FocusTracker();

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

		this._focusCycler = new FocusCycler( {
			focusables: this.children,
			focusTracker: this.focusTracker
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		for ( const child of this.children ) {
			this.focusTracker.add( child.element! );
		}
	}

	/**
	 * Focuses the view.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the first child view.
	 */
	public focusFirst(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last child view.
	 */
	public focusLast(): void {
		this._focusCycler.focusLast();
	}
}
