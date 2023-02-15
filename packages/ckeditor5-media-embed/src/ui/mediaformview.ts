/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/ui/mediaformview
 */

import {
	type InputTextView,
	ButtonView,
	FocusCycler,
	LabeledFieldView,
	View,
	ViewCollection,
	createLabeledInputText,
	submitHandler
} from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils';
import { icons } from 'ckeditor5/src/core';

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
	 * The Save button view.
	 */
	public saveButtonView: ButtonView;

	/**
	 * The Cancel button view.
	 */
	public cancelButtonView: ButtonView;

	/**
	 * A collection of views that can be focused in the form.
	 */
	private readonly _focusables: ViewCollection;

	/**
	 * Helps cycling over {@link #_focusables} in the form.
	 */
	private readonly _focusCycler: FocusCycler;

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

		const t = locale.t;

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.set( 'mediaURLInputValue', '' );
		this.urlInputView = this._createUrlInput();

		this.saveButtonView = this._createButton( t( 'Save' ), icons.check, 'ck-button-save' );
		this.saveButtonView.type = 'submit';
		this.saveButtonView.bind( 'isEnabled' ).to( this, 'mediaURLInputValue', value => !!value );

		this.cancelButtonView = this._createButton( t( 'Cancel' ), icons.cancel, 'ck-button-cancel', 'cancel' );

		this._focusables = new ViewCollection();

		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the <kbd>Tab</kbd> key.
				focusNext: 'tab'
			}
		} );

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
				this.urlInputView,
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

		submitHandler( {
			view: this
		} );

		const childViews = [
			this.urlInputView,
			this.saveButtonView,
			this.cancelButtonView
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element! );
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

		// Intercept the `selectstart` event, which is blocked by default because of the default behavior
		// of the DropdownView#panelView.
		// TODO: blocking `selectstart` in the #panelView should be configurable per–drop–down instance.
		this.listenTo( this.urlInputView.element!, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
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
	 * Focuses the fist {@link #_focusables} in the form.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
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
		this.urlInputView.fieldView.element!.value = url.trim();
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

		inputField.on( 'input', () => {
			// Display the tip text only when there is some value. Otherwise fall back to the default info text.
			labeledInput.infoText = inputField.element!.value ? this._urlInputViewInfoTip! : this._urlInputViewInfoDefault!;
			this.mediaURLInputValue = inputField.element!.value.trim();
		} );

		return labeledInput;
	}

	/**
	 * Creates a button view.
	 *
	 * @param label The button label.
	 * @param icon The button icon.
	 * @param className The additional button CSS class name.
	 * @param eventName An event name that the `ButtonView#execute` event will be delegated to.
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
}
