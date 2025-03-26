/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojisearchview
 */

import { escapeRegExp } from 'es-toolkit/compat';
import { createLabeledInputText, SearchTextView, View, type SearchTextViewSearchEvent, type SearchInfoView } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';
import type EmojiGridView from './emojigridview.js';

/**
 * A view responsible for providing an input element that allows filtering emoji by the provided query.
 */
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
	 * @inheritDoc
	 */
	constructor( locale: Locale, { gridView, resultsView }: { gridView: EmojiGridView; resultsView: SearchInfoView } ) {
		super( locale );

		this.gridView = gridView;

		const t = locale.t;

		this.inputView = new SearchTextView( this.locale!, {
			queryView: {
				label: t( 'Find an emoji (min. 2 characters)' ),
				creator: createLabeledInputText
			},
			filteredView: this.gridView,
			infoView: {
				instance: resultsView
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-search'
				],

				tabindex: '-1'
			},
			children: [
				this.inputView.queryView
			]
		} );

		// Pass through the `search` event to handle it by a parent view.
		this.inputView.delegate( 'search' ).to( this );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.inputView.destroy();
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
		if ( !value ) {
			this.inputView.queryView.fieldView.reset();
		} else {
			this.inputView.queryView.fieldView.value = value;
		}
	}

	/**
	 * Returns an input provided by a user in the search text field.
	 */
	public getInputValue(): string {
		return this.inputView.queryView.fieldView.element!.value;
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this.inputView.focus();
	}
}
