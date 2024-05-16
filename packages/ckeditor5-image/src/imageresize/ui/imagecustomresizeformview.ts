/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/ui/imagecustomresizeformview
 */

import {
	ButtonView,
	FocusCycler,
	LabeledFieldView,
	View,
	ViewCollection,
	createLabeledInputNumber,
	submitHandler,
	type FocusableView,
	type InputNumberView
} from 'ckeditor5/src/ui.js';

import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import { icons } from 'ckeditor5/src/core.js';

import '../../../theme/imagecustomresizeform.css';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';

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
	 * An input with a label.
	 */
	public labeledInput: LabeledFieldView<InputNumberView>;

	/**
	 * A button used to submit the form.
	 */
	public saveButtonView: ButtonView;

	/**
	 * A button used to cancel the form.
	 */
	public cancelButtonView: ButtonView;

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
		const t = this.locale!.t;

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.unit = unit;

		this.labeledInput = this._createLabeledInputView();

		this.saveButtonView = this._createButton( t( 'Save' ), icons.check, 'ck-button-save' );
		this.saveButtonView.type = 'submit';

		this.cancelButtonView = this._createButton( t( 'Cancel' ), icons.cancel, 'ck-button-cancel', 'cancel' );

		this._focusables = new ViewCollection();
		this._validators = validators;

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
					'ck-image-custom-resize-form',
					'ck-responsive-form'
				],

				// https://github.com/ckeditor/ckeditor5-image/issues/40
				tabindex: '-1'
			},

			children: [
				this.labeledInput,
				this.saveButtonView,
				this.cancelButtonView
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.keystrokes.listenTo( this.element! );

		submitHandler( { view: this } );

		[ this.labeledInput, this.saveButtonView, this.cancelButtonView ]
			.forEach( v => {
				// Register the view as focusable.
				this._focusables.add( v );

				// Register the view in the focus tracker.
				this.focusTracker.add( v.element! );
			} );
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
	 * Creates the button view.
	 *
	 * @param label The button label
	 * @param icon The button's icon.
	 * @param className The additional button CSS class name.
	 * @param eventName The event name that the ButtonView#execute event will be delegated to.
	 * @returns The button view instance.
	 */
	private _createButton( label: string, icon: string, className: string, eventName?: string ): ButtonView {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );

		if ( eventName ) {
			button.delegate( 'execute' ).to( this, eventName );
		}

		return button;
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
