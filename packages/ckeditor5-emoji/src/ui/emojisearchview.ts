/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojisearchview
 */

import { View, createLabeledInputText, SearchTextQueryView, type InputView } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';

export default class EmojiSearchView extends View {
	/**
	 * The find in text input view that stores the searched string.
	 *
	 * @internal
	 */
	public readonly _findInputView: SearchTextQueryView<InputView>;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		this._findInputView = this._createInputField( locale.t( 'Find an emoji (min. 2 characters)' ) );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-emoji-input', 'ck-search' ]
			},
			children: [
				this._findInputView
			]
		} );
	}

	public focus(): void {
		this._findInputView.focus();
	}

	public setSearchQuery( searchQuery: string ): void {
		this._findInputView.fieldView.element!.value = searchQuery;
		this._findInputView.fieldView.isEmpty = searchQuery.length ? false : true;
	}

	/**
	 * Creates a labeled input view.
	 *
	 * @param label The input label.
	 * @returns The labeled input view instance.
	 */
	private _createInputField( label: string ): SearchTextQueryView<InputView> {
		const labeledInput = new SearchTextQueryView( this.locale!, {
			label,
			creator: createLabeledInputText
		} );

		labeledInput.fieldView.on( 'input', () => {
			const value = labeledInput.fieldView.element!.value || null;

			this.fire<EmojiSearchViewInputEvent>( 'input', { value } );
		} );

		return labeledInput;
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
	value: string | null;
}
