/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imagetextalternative/ui/textalternativeformview
 */

import {
	ButtonView,
	FocusCycler,
	FormRowView,
	FormHeaderView,
	LabeledFieldView,
	View,
	ViewCollection,
	createLabeledInputText,
	submitHandler,
	type InputView,
	type FocusableView
} from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import { IconPreviousArrow } from 'ckeditor5/src/icons.js';

import '../../../theme/textalternativeform.css';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';

/**
 * The TextAlternativeFormView class.
 */
export default class TextAlternativeFormView extends View {
	/**
	 * Tracks information about the DOM focus in the form.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * An input with a label.
	 */
	public labeledInput: LabeledFieldView<InputView>;

	/**
	 * The Back button view displayed in the header.
	 */
	public backButtonView: ButtonView;

	/**
	 * A button used to submit the form.
	 */
	public saveButtonView: ButtonView;

	/**
	 * A collection of child views.
	 */
	public readonly children: ViewCollection;

	/**
	 * A collection of views which can be focused in the form.
	 */
	protected readonly _focusables: ViewCollection<FocusableView>;

	/**
	 * Helps cycling over {@link #_focusables} in the form.
	 */
	protected readonly _focusCycler: FocusCycler;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		// Create buttons.
		this.backButtonView = this._createBackButton();
		this.saveButtonView = this._createSaveButton();

		// Create input fields.
		this.labeledInput = this._createLabeledInputView();

		this.children = this.createCollection( [
			this._createHeaderView()
		] );
		this.children.add( new FormRowView( locale, {
			children: [
				this.labeledInput,
				this.saveButtonView
			],
			class: [
				'ck-form__row_with-submit',
				'ck-form__row_large-top-padding'
			]
		} ) );

		this._focusables = new ViewCollection();

		// Close the panel on esc key press when the **form has focus**.
		this.keystrokes.set( 'Esc', ( data, cancel ) => {
			this.fire<TextAlternativeFormViewCancelEvent>( 'cancel' );
			cancel();
		} );

		this._focusCycler = new FocusCycler( {
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

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-form',
					'ck-text-alternative-form',
					'ck-responsive-form'
				],

				// https://github.com/ckeditor/ckeditor5-image/issues/40
				tabindex: '-1'
			},

			children: this.children
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

		const childViews = [
			this.backButtonView,
			this.labeledInput,
			this.saveButtonView
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element! );
		} );

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
	 * Creates a back button view that cancels the form.
	 */
	private _createBackButton(): ButtonView {
		const t = this.locale!.t;
		const backButton = new ButtonView( this.locale );

		backButton.set( {
			class: 'ck-button-back',
			label: t( 'Back' ),
			icon: IconPreviousArrow,
			tooltip: true
		} );

		backButton.delegate( 'execute' ).to( this, 'cancel' );

		return backButton;
	}

	/**
	 * Creates a save button view that text alternative the image.
	 */
	private _createSaveButton(): ButtonView {
		const t = this.locale!.t;
		const saveButton = new ButtonView( this.locale );

		saveButton.set( {
			label: t( 'Save' ),
			withText: true,
			type: 'submit',
			class: 'ck-button-action ck-button-bold'
		} );

		return saveButton;
	}

	/**
	 * Creates a header view for the form.
	 */
	private _createHeaderView(): FormHeaderView {
		const t = this.locale!.t;

		const header = new FormHeaderView( this.locale, {
			label: t( 'Text Alternative' )
		} );

		header.children.add( this.backButtonView, 0 );

		return header;
	}

	/**
	 * Creates an input with a label.
	 *
	 * @returns Labeled field view instance.
	 */
	private _createLabeledInputView(): LabeledFieldView<InputView> {
		const t = this.locale!.t;
		const labeledInput = new LabeledFieldView<InputView>( this.locale, createLabeledInputText );

		labeledInput.label = t( 'Text alternative' );
		labeledInput.class = 'ck-labeled-field-view_full-width';

		return labeledInput;
	}
}

/**
 * Fired when the form view is submitted.
 *
 * @eventName ~TextAlternativeFormView#submit
 */
export type TextAlternativeFormViewSubmitEvent = {
	name: 'submit';
	args: [];
};

/**
 * Fired when the form view is canceled.
 *
 * @eventName ~TextAlternativeFormView#cancel
 */
export type TextAlternativeFormViewCancelEvent = {
	name: 'cancel';
	args: [];
};
