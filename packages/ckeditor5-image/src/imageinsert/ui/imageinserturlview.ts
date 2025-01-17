/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageinsert/ui/imageinserturlview
 */

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	submitHandler,
	type InputTextView
} from 'ckeditor5/src/ui.js';
import { KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';

/**
 * The insert an image via URL view.
 *
 * See {@link module:image/imageinsert/imageinsertviaurlui~ImageInsertViaUrlUI}.
 */
export default class ImageInsertUrlView extends View {
	/**
	 * The URL input field view.
	 */
	public urlInputView: LabeledFieldView<InputTextView>;

	/**
	 * The value of the URL input.
	 *
	 * @observable
	 */
	declare public imageURLInputValue: string;

	/**
	 * Observable property used to alter labels while some image is selected and when it is not.
	 *
	 * @observable
	 */
	declare public isImageSelected: boolean;

	/**
	 * Observable property indicating whether the form interactive elements should be enabled.
	 *
	 * @observable
	 */
	declare public isEnabled: boolean;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Creates a view for the dropdown panel of {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.set( 'imageURLInputValue', '' );
		this.set( 'isImageSelected', false );
		this.set( 'isEnabled', true );

		this.keystrokes = new KeystrokeHandler();

		this.urlInputView = this._createUrlInputView();

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-image-insert-url'
				],
				tabindex: '-1'
			},

			children: [
				this.urlInputView,
				{
					tag: 'div',
					attributes: {
						class: [
							'ck',
							'ck-image-insert-url__action-row'
						]
					}
				}
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		submitHandler( {
			view: this
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.keystrokes.destroy();
	}

	/**
	 * Creates the {@link #urlInputView}.
	 */
	private _createUrlInputView() {
		const locale = this.locale!;
		const t = locale.t;
		const urlInputView = new LabeledFieldView( locale, createLabeledInputText );

		urlInputView.bind( 'label' ).to( this, 'isImageSelected',
			value => value ? t( 'Update image URL' ) : t( 'Insert image via URL' )
		);

		urlInputView.bind( 'isEnabled' ).to( this );

		urlInputView.fieldView.inputMode = 'url';
		urlInputView.fieldView.placeholder = 'https://example.com/image.png';

		urlInputView.fieldView.bind( 'value' ).to( this, 'imageURLInputValue', ( value: string ) => value || '' );
		urlInputView.fieldView.on( 'input', () => {
			this.imageURLInputValue = urlInputView.fieldView.element!.value.trim();
		} );

		return urlInputView;
	}

	/**
	 * Focuses the view.
	 */
	public focus(): void {
		this.urlInputView.focus();
	}
}
