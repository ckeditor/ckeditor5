/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/ui/imageinserturlview
 */

import { icons } from 'ckeditor5/src/core';
import {
	ButtonView,
	View,
	ViewCollection,
	FocusCycler,
	LabeledFieldView,
	createLabeledInputText,
	type InputTextView
} from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils';

/**
 * The insert an image via URL view controller class.
 *
 * See {@link module:image/imageinsert/ui/imageinsertformview~ImageInsertFormView}.
 */
export default class ImageInsertUrlView extends View {
	/**
	 * TODO
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
	 * TODO
	 *
	 * @observable
	 */
	declare public isImageSelected: boolean;

	/**
	 * TODO
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
	private readonly _focusables: ViewCollection;

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

		const childViews = [
			this.urlInputView,
			this.insertButtonView,
			this.cancelButtonView
		];

		childViews.forEach( view => {
			// Register the view as focusable.
			this._focusables.add( view );

			// Register the view in the focus tracker.
			this.focusTracker.add( view.element! );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element! );

		const stopPropagation = ( data: KeyboardEvent ) => data.stopPropagation();

		// Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
		// keystroke handler would take over the key management in the URL input. We need to prevent
		// this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
		this.keystrokes.set( 'arrowright', stopPropagation );
		this.keystrokes.set( 'arrowleft', stopPropagation );
		this.keystrokes.set( 'arrowup', stopPropagation );
		this.keystrokes.set( 'arrowdown', stopPropagation );
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
 * TODO
 *
 * @eventName ~ImageInsertUrlView#submit
 */
export type ImageInsertUrlViewSubmitEvent = {
	name: 'submit';
	args: [];
};

/**
 * TODO
 *
 * @eventName ~ImageInsertUrlView#cancel
 */
export type ImageInsertUrlViewCancelEvent = {
	name: 'cancel';
	args: [];
};
