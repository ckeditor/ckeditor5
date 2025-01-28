/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/ui/mediaformview
 */

import {
	type InputTextView,
	LabeledFieldView,
	View,
	createLabeledInputText,
	submitHandler
} from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/mediaform.css';

/**
 * The media form view controller class.
 *
 * See {@link module:media-embed/ui/mediaformview~MediaFormView}.
 */
export default class MediaFormView extends View {
	/**
	 * Tracks information about the DOM focus in the form.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * The value of the URL input.
	 */
	declare public mediaURLInputValue: string;

	/**
	 * The URL input view.
	 */
	public urlInputView: LabeledFieldView<InputTextView>;

	/**
	 * An array of form validators used by {@link #isValid}.
	 */
	private readonly _validators: Array<( v: MediaFormView ) => string | undefined>;

	/**
	 * The default info text for the {@link #urlInputView}.
	 */
	private _urlInputViewInfoDefault?: string;

	/**
	 * The info text with an additional tip for the {@link #urlInputView},
	 * displayed when the input has some value.
	 */
	private _urlInputViewInfoTip?: string;

	/**
	 * @param validators Form validators used by {@link #isValid}.
	 * @param locale The localization services instance.
	 */
	constructor( validators: Array<( v: MediaFormView ) => string | undefined>, locale: Locale ) {
		super( locale );

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.set( 'mediaURLInputValue', '' );
		this.urlInputView = this._createUrlInput();

		this._validators = validators;

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-media-form',
					'ck-responsive-form'
				],

				tabindex: '-1'
			},

			children: [
				this.urlInputView
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

		// Register the view in the focus tracker.
		this.focusTracker.add( this.urlInputView.element! );

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
	 * Focuses the {@link #urlInputView}.
	 */
	public focus(): void {
		this.urlInputView.focus();
	}

	/**
	 * The native DOM `value` of the {@link #urlInputView} element.
	 *
	 * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
	 * which works one way only and may not represent the actual state of the component in the DOM.
	 */
	public get url(): string {
		return this.urlInputView.fieldView.element!.value.trim();
	}

	public set url( url: string ) {
		this.urlInputView.fieldView.value = url.trim();
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
				this.urlInputView.errorText = errorText;

				return false;
			}
		}

		return true;
	}

	/**
	 * Cleans up the supplementary error and information text of the {@link #urlInputView}
	 * bringing them back to the state when the form has been displayed for the first time.
	 *
	 * See {@link #isValid}.
	 */
	public resetFormStatus(): void {
		this.urlInputView.errorText = null;
		this.urlInputView.infoText = this._urlInputViewInfoDefault!;
	}

	/**
	 * Creates a labeled input view.
	 *
	 * @returns Labeled input view instance.
	 */
	private _createUrlInput(): LabeledFieldView<InputTextView> {
		const t = this.locale!.t;

		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const inputField = labeledInput.fieldView;

		this._urlInputViewInfoDefault = t( 'Paste the media URL in the input.' );
		this._urlInputViewInfoTip = t( 'Tip: Paste the URL into the content to embed faster.' );

		labeledInput.label = t( 'Media URL' );
		labeledInput.infoText = this._urlInputViewInfoDefault;

		inputField.inputMode = 'url';
		inputField.on( 'input', () => {
			// Display the tip text only when there is some value. Otherwise fall back to the default info text.
			labeledInput.infoText = inputField.element!.value ? this._urlInputViewInfoTip! : this._urlInputViewInfoDefault!;
			this.mediaURLInputValue = inputField.element!.value.trim();
		} );

		return labeledInput;
	}
}
