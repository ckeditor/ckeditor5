/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedresize/ui/mediaembedcustomresizeformview
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
} from '@ckeditor/ckeditor5-ui';

import { FocusTracker, KeystrokeHandler, type Locale } from '@ckeditor/ckeditor5-utils';
import { IconPreviousArrow } from '@ckeditor/ckeditor5-icons';

/**
 * The MediaEmbedCustomResizeFormView class.
 *
 * @internal
 */
export class MediaEmbedCustomResizeFormView extends View {
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
	private readonly _validators: Array<MediaEmbedCustomResizeFormValidatorCallback>;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, unit: string, validators: Array<MediaEmbedCustomResizeFormValidatorCallback> ) {
		super( locale );

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.unit = unit;

		this.backButtonView = this._createBackButton();
		this.saveButtonView = this._createSaveButton();
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

		this.keystrokes.set( 'Esc', ( data, cancel ) => {
			this.fire<MediaEmbedCustomResizeFormViewCancelEvent>( 'cancel' );
			cancel();
		} );

		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				focusPrevious: 'shift + tab',
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-form',
					'ck-media-embed-custom-resize-form',
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
			this._focusables.add( v );
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

	private _createHeaderView(): FormHeaderView {
		const t = this.locale!.t;

		const header = new FormHeaderView( this.locale, {
			label: t( 'Media Resize' )
		} );

		header.children.add( this.backButtonView, 0 );

		return header;
	}

	private _createLabeledInputView(): LabeledFieldView<InputNumberView> {
		const t = this.locale!.t;
		const labeledInput = new LabeledFieldView<InputNumberView>( this.locale, createLabeledInputNumber );

		labeledInput.label = t( 'Resize media (in %0)', this.unit );
		labeledInput.class = 'ck-labeled-field-view_full-width';
		labeledInput.fieldView.set( {
			min: 0.1,
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

			if ( errorText ) {
				this.labeledInput.errorText = errorText;

				return false;
			}
		}

		return true;
	}

	/**
	 * Cleans up error and information text of {@link #labeledInput}.
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
	 * Get numeric value of size. Returns `null` if value is not a number.
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
	 * Returns serialized media embed input size with unit.
	 * Returns `null` if value is not a number.
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
 * Callback used by {@link ~MediaEmbedCustomResizeFormView} to check if passed form value is valid.
 *
 * @internal
 */
export type MediaEmbedCustomResizeFormValidatorCallback = ( form: MediaEmbedCustomResizeFormView ) => string | undefined;

/**
 * Fired when the form view is submitted.
 *
 * @eventName ~MediaEmbedCustomResizeFormView#submit
 */
export type MediaEmbedCustomResizeFormViewSubmitEvent = {
	name: 'submit';
	args: [];
};

/**
 * Fired when the form view is canceled.
 *
 * @eventName ~MediaEmbedCustomResizeFormView#cancel
 */
export type MediaEmbedCustomResizeFormViewCancelEvent = {
	name: 'cancel';
	args: [];
};
