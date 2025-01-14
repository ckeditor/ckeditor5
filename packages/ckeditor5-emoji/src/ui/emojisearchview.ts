/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojisearchview
 */

import { escapeRegExp } from 'lodash-es';
import {
	SearchTextView,
	View,
	createLabeledInputText,
	type InputView,
	type SearchTextViewSearchEvent,
	type SearchTextQueryView
} from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';

export default class EmojiSearchView extends View {
	/**
	 * The find in text input view that stores the searched string.
	 *
	 * @internal
	 */
	public readonly _findInputView: SearchTextView;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, gridView: View, resultsView: View ) {
		super( locale );

		this._gridView = gridView;
		this._resultsView = resultsView;

		const t = locale.t;

		this._findInputView = new SearchTextView( this.locale!, {
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
				this._findInputView
			]
		} );

		this._findInputView.on<SearchTextViewSearchEvent>( 'search', ( evt, data ) => {
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
		this._gridView.on( 'change:selectedSkinTone', () => {
			this.search( this.getInputValue() );
		} );
	}

	/**
	 * Searches the {@link #filteredView} for the given query.
	 *
	 * @internal
	 * @param query The search query string.
	 */
	public search( query: string ): void {
		const regExp = query ? new RegExp( escapeRegExp( query ), 'ig' ) : null;
		const filteringResults = this._gridView.filter( regExp );

		this._findInputView.fire<SearchTextViewSearchEvent>( 'search', { query, ...filteringResults } );
	}

	/**
	 * Allows defining the default value in the search text field.
	 *
	 * @param value The new value.
	 */
	public setInputValue( value: string ): void {
		this._findInputView.queryView.fieldView.value = value;
	}

	public getInputValue(): string {
		return this._findInputView.queryView.fieldView.element?.value || '';
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this._findInputView.focus();
	}
}

/**
 * Fired when the search field is updated.
 *
 * @eventName ~EmojiSearchView#input
 * @param data Additional information about the event.
 */
export type EmojiSearchViewInputEvent = {
	name: 'input';
	args: [ data: EmojiSearchViewInputEventData ];
};

export interface EmojiSearchViewInputEventData {

	/**
	 * Content of the updated search field.
	 */
	query: string;
}
