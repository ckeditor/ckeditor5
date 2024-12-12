/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { View, createLabeledInputText, LabeledFieldView, type InputView } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';

export default class EmojiSearchView extends View {
	/**
	 * The find in text input view that stores the searched string.
	 *
	 * @internal
	 */
	public readonly _findInputView: LabeledFieldView<InputView>;

	constructor( locale: Locale ) {
		super( locale );

		this._findInputView = this._createInputField( locale.t( 'Find an emoji (min. 2 characters)' ) );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-emoji-input' ]
			},
			children: [
				this._findInputView
			]
		} );
	}

	public focus(): void {
		this._findInputView.focus();
	}

	/**
	 * Creates a labeled input view.
	 *
	 * @param label The input label.
	 * @returns The labeled input view instance.
	 */
	private _createInputField( label: string ): LabeledFieldView<InputView> {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.fieldView.on( 'input', () => {
			const value = labeledInput.fieldView.element!.value || null;

			this.fire<EmojiSearchViewInputEvent>( 'input', { value } );
		} );

		labeledInput.label = label;

		return labeledInput;
	}

	public setSearchQuery( searchQuery: string ): void {
		this._findInputView.fieldView.element!.value = searchQuery;
		this._findInputView.fieldView.isEmpty = searchQuery.length ? false : true;
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
