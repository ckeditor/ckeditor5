/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojisearchview
 */

import { escapeRegExp } from 'lodash-es';
import { createLabeledInputText, SearchTextView, View, type SearchTextViewSearchEvent, type SearchInfoView } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';
import type EmojiGridView from './emojigridview.js';

export default class EmojiSearchView extends View {
	/**
	 * The find in text input view that stores the searched string.
	 */
	public readonly inputView: SearchTextView;

	/**
	 * An instance of the `EmojiGridView`.
	 */
	public readonly gridView: EmojiGridView;

	/**
	 * An instance of the `EmojiGridView`.
	 */
	public readonly resultsView: SearchInfoView;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, { gridView, resultsView }: { gridView: EmojiGridView; resultsView: SearchInfoView } ) {
		super( locale );

		this.gridView = gridView;
		this.resultsView = resultsView;

		const t = locale.t;

		this.inputView = new SearchTextView( this.locale!, {
			queryView: {
				label: t( 'Find an emoji (min. 2 characters)' ),
				creator: createLabeledInputText
			},
			filteredView: this.gridView,
			infoView: {
				instance: this.resultsView
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-emoji-input', 'ck-search' ]
			},
			children: [
				this.inputView
			]
		} );

		// Pass through the `search` event to handle it by a controller (parent).
		this.inputView.delegate( 'search' ).to( this );
	}

	/**
	 * Searches the {@link #gridView} for the given query.
	 *
	 * @param query The search query string.
	 */
	public search( query: string ): void {
		const regExp = query ? new RegExp( escapeRegExp( query ), 'ig' ) : null;
		const filteringResults = this.gridView.filter( regExp );

		this.inputView.fire<SearchTextViewSearchEvent>( 'search', { query, ...filteringResults } );
	}

	/**
	 * Allows defining the default value in the search text field.
	 *
	 * @param value The new value.
	 */
	public setInputValue( value: string ): void {
		this.inputView.queryView.fieldView.value = value;
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this.inputView.focus();
	}
}
