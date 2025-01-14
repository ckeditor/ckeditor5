/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojisearchview
 */

import { escapeRegExp } from 'lodash-es';
import { createLabeledInputText, SearchTextView, type SearchTextViewSearchEvent, View, } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';

export default class EmojiSearchView extends View {
	/**
	 * The find in text input view that stores the searched string.
	 */
	public readonly findInputView: SearchTextView;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, gridView: View, resultsView: View ) {
		super( locale );

		this._gridView = gridView;
		this._resultsView = resultsView;

		const t = locale.t;

		this.findInputView = new SearchTextView( this.locale!, {
			queryView: {
				label: t( 'Find an emoji (min. 2 characters)' ),
				creator: createLabeledInputText
			},
			filteredView: this._gridView,
			infoView: {
				instance: this._resultsView
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-emoji-input', 'ck-search' ]
			},
			children: [
				this.findInputView
			]
		} );

		this.findInputView.on<SearchTextViewSearchEvent>( 'search', ( evt, data ) => {
			if ( !data.resultsCount ) {
				this._resultsView.set( {
					primaryText: t( 'No emojis were found matching "%0".', data.query ),
					secondaryText: t( 'Please try a different phrase or check the spelling.' ),
					isVisible: true
				} );
			} else {
				this._resultsView.set( {
					isVisible: false
				} );
			}

			this.fire( 'input', { query: data.query } );
		} );

		// Refresh the grid when a skin tone is being changed.
		this._gridView.on( 'change:skinTone', () => {
			this.search( this.getInputValue() );
		} );
	}

	/**
	 * Searches the {@link #filteredView} for the given query.
	 *
	 * @param query The search query string.
	 */
	public search( query: string ): void {
		const regExp = query ? new RegExp( escapeRegExp( query ), 'ig' ) : null;
		const filteringResults = this._gridView.filter( regExp );

		this.findInputView.fire<SearchTextViewSearchEvent>( 'search', { query, ...filteringResults } );
	}

	/**
	 * Allows defining the default value in the search text field.
	 *
	 * @param value The new value.
	 */
	public setInputValue( value: string ): void {
		this.findInputView.queryView.fieldView.value = value;
	}

	/**
	 * Returns the provided query from the input element if exists. Otherwise, returns an empty string.
	 */
	public getInputValue(): string {
		return this.findInputView.queryView.fieldView.element?.value || '';
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this.findInputView.focus();
	}
}
