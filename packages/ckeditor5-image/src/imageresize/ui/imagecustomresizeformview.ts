/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageresize/ui/imagecustomresizeformview
 */

import {
	ButtonView,
	FocusCycler,
	FormHeaderView,
	FormRowView,
	LabeledFieldView,
	View,
	ViewCollection,
	createLabeledInputNumber,
	submitHandler,
	type FocusableView,
	type InputNumberView
} from 'ckeditor5/src/ui.js';

import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import { IconPreviousArrow } from 'ckeditor5/src/icons.js';

import '../../../theme/imagecustomresizeform.css';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';

/**
 * The ImageCustomResizeFormView class.
 */
export default class ImageCustomResizeFormView extends View {
	/**
	 * Tracks information about the DOM focus in the form.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Resize unit shortcut.
	 */
	public readonly unit: string;

	/**
	 * The Back button view displayed in the header.
	 */
	public backButtonView: ButtonView;

	/**
	 * A button used to submit the form.
	 */
	public saveButtonView: ButtonView;

	/**
	 * An input with a label.
	 */
	public labeledInput: LabeledFieldView<InputNumberView>;

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
	 * An array of form validators used by {@link #isValid}.
	 */
	private readonly _validators: Array<ImageCustomResizeFormValidatorCallback>;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, unit: string, validators: Array<ImageCustomResizeFormValidatorCallback> ) {
		super( locale );

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.unit = unit;

		// Create buttons.
		this.backButtonView = this._createBackButton();
		this.saveButtonView = this._createSaveButton();

		// Create input fields.
		this.labeledInput = this._createLabeledInputView();

		this.children = this.createCollection( [ this._createHeaderView() ] );
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
		this._validators = validators;

		// Close the panel on esc key press when the **form has focus**.
		this.keystrokes.set( 'Esc', ( data, cancel ) => {
			this.fire<ImageCustomResizeFormViewCancelEvent>( 'cancel' );
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
					'ck-image-custom-resize-form',
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
	 * Creates a save button view that resize the image.
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
			label: t( 'Image Resize' )
		} );

		header.children.add( this.backButtonView, 0 );

		return header;
	}

	/**
	 * Creates an input with a label.
	 *
	 * @returns Labeled field view instance.
	 */
	private _createLabeledInputView(): LabeledFieldView<InputNumberView> {
		const t = this.locale!.t;
		const labeledInput = new LabeledFieldView<InputNumberView>( this.locale, createLabeledInputNumber );

		labeledInput.label = t( 'Resize image (in %0)', this.unit );
		labeledInput.class = 'ck-labeled-field-view_full-width';
		labeledInput.fieldView.set( {
			step: 0.1
		} );

		return labeledInput;
	}

	/**
	 * Validates the form and returns `false` when some fields are invalid.
	 */
	public isValid(): boolean {
		this.resetFormStatus();

		for ( const validator of this._validators ) {
			const errorText = validator( this );

			// One error per field is enough.
			if ( errorText ) {
				// Apply updated error.
				this.labeledInput.errorText = errorText;

				return false;
			}
		}

		return true;
	}

	/**
	 * Cleans up the supplementary error and information text of the {@link #labeledInput}
	 * bringing them back to the state when the form has been displayed for the first time.
	 *
	 * See {@link #isValid}.
	 */
	public resetFormStatus(): void {
		this.labeledInput.errorText = null;
	}

	/**
	 * The native DOM `value` of the input element of {@link #labeledInput}.
	 */
	public get rawSize(): string | null {
		const { element } = this.labeledInput.fieldView;

		if ( !element ) {
			return null;
		}

		return element.value;
	}

	/**
	 * Get numeric value of size. Returns `null` if value of size input element in {@link #labeledInput}.is not a number.
	 */
	public get parsedSize(): number | null {
		const { rawSize } = this;

		if ( rawSize === null ) {
			return null;
		}

		const parsed = Number.parseFloat( rawSize );

		if ( Number.isNaN( parsed ) ) {
			return null;
		}

		return parsed;
	}

	/**
	 * Returns serialized image input size with unit.
	 * Returns `null` if value of size input element in {@link #labeledInput}.is not a number.
	 */
	public get sizeWithUnits(): string | null {
		const { parsedSize, unit } = this;

		if ( parsedSize === null ) {
			return null;
		}

		return `${ parsedSize }${ unit }`;
	}
}

/**
 * Callback used by {@link ~ImageCustomResizeFormView} to check if passed form value is valid.
 *
 * 	* If `undefined` is returned, it is assumed that the form value is correct and there is no error.
 * 	* If string is returned, it is assumed that the form value is incorrect and the returned string is displayed in the error label
 */
export type ImageCustomResizeFormValidatorCallback = ( form: ImageCustomResizeFormView ) => string | undefined;

/**
 * Fired when the form view is submitted.
 *
 * @eventName ~ImageCustomResizeFormView#submit
 */
export type ImageCustomResizeFormViewSubmitEvent = {
	name: 'submit';
	args: [];
};

/**
 * Fired when the form view is canceled.
 *
 * @eventName ~ImageCustomResizeFormView#cancel
 */
export type ImageCustomResizeFormViewCancelEvent = {
	name: 'cancel';
	args: [];
};
