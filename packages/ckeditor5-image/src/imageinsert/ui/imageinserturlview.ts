/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/ui/imageinserturlview
 */

import { icons } from 'ckeditor5/src/core.js';
import {
	ButtonView,
	View,
	ViewCollection,
	FocusCycler,
	LabeledFieldView,
	createLabeledInputText,
	type InputTextView,
	type FocusableView
} from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';

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
	 * The "insert/update" button view.
	 */
	public insertButtonView: ButtonView;

	/**
	 * The "cancel" button view.
	 */
	public cancelButtonView: ButtonView;

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
	 * Tracks information about DOM focus in the form.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Helps cycling over {@link #_focusables} in the form.
	 */
	public readonly focusCycler: FocusCycler;

	/**
	 * A collection of views that can be focused in the form.
	 */
	private readonly _focusables: ViewCollection<FocusableView>;

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

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this._focusables = new ViewCollection();

		this.focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		this.urlInputView = this._createUrlInputView();
		this.insertButtonView = this._createInsertButton();
		this.cancelButtonView = this._createCancelButton();

		this._focusables.addMany( [
			this.urlInputView,
			this.insertButtonView,
			this.cancelButtonView
		] );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-image-insert-url'
				]
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
					},

					children: [
						this.insertButtonView,
						this.cancelButtonView
					]
				}
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		for ( const view of this._focusables ) {
			this.focusTracker.add( view.element! );
		}

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.focusTracker.destroy();
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

		urlInputView.fieldView.placeholder = 'https://example.com/image.png';

		urlInputView.fieldView.bind( 'value' ).to( this, 'imageURLInputValue', ( value: string ) => value || '' );
		urlInputView.fieldView.on( 'input', () => {
			this.imageURLInputValue = urlInputView.fieldView.element!.value.trim();
		} );

		return urlInputView;
	}

	/**
	 * Creates the {@link #insertButtonView}.
	 */
	private _createInsertButton(): ButtonView {
		const locale = this.locale!;
		const t = locale.t;
		const insertButtonView = new ButtonView( locale );

		insertButtonView.set( {
			icon: icons.check,
			class: 'ck-button-save',
			type: 'submit',
			withText: true
		} );

		insertButtonView.bind( 'label' ).to( this, 'isImageSelected', value => value ? t( 'Update' ) : t( 'Insert' ) );
		insertButtonView.bind( 'isEnabled' ).to( this, 'imageURLInputValue', this, 'isEnabled',
			( ...values ) => values.every( value => value )
		);

		insertButtonView.delegate( 'execute' ).to( this, 'submit' );

		return insertButtonView;
	}

	/**
	 * Creates the {@link #cancelButtonView}.
	 */
	private _createCancelButton(): ButtonView {
		const locale = this.locale!;
		const t = locale.t;
		const cancelButtonView = new ButtonView( locale );

		cancelButtonView.set( {
			label: t( 'Cancel' ),
			icon: icons.cancel,
			class: 'ck-button-cancel',
			withText: true
		} );

		cancelButtonView.bind( 'isEnabled' ).to( this );

		cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

		return cancelButtonView;
	}

	/**
	 * Focuses the view.
	 */
	public focus( direction: 1 | -1 ): void {
		if ( direction === -1 ) {
			this.focusCycler.focusLast();
		} else {
			this.focusCycler.focusFirst();
		}
	}
}

/**
 * Fired when the form view is submitted.
 *
 * @eventName ~ImageInsertUrlView#submit
 */
export type ImageInsertUrlViewSubmitEvent = {
	name: 'submit';
	args: [];
};

/**
 * Fired when the form view is canceled.
 *
 * @eventName ~ImageInsertUrlView#cancel
 */
export type ImageInsertUrlViewCancelEvent = {
	name: 'cancel';
	args: [];
};
