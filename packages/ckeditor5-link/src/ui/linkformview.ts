/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/ui/linkformview
 */

import {
	ButtonView,
	ListView,
	ListItemView,
	FocusCycler,
	LabeledFieldView,
	FormHeaderView,
	FormRowView,
	View,
	ViewCollection,
	createLabeledInputText,
	submitHandler,
	type InputTextView,
	type FocusableView
} from 'ckeditor5/src/ui.js';
import {
	FocusTracker,
	KeystrokeHandler,
	type Locale
} from 'ckeditor5/src/utils.js';
import { IconPreviousArrow } from 'ckeditor5/src/icons.js';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';

import '../../theme/linkform.css';

/**
 * The link form view.
 */
export default class LinkFormView extends View {
	/**
	 * Tracks information about DOM focus in the form.
	 */
	public readonly focusTracker = new FocusTracker();

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes = new KeystrokeHandler();

	/**
	 * The Back button view displayed in the header.
	 */
	public backButtonView: ButtonView;

	/**
	 * The Save button view.
	 */
	public saveButtonView: ButtonView;

	/**
	 * The "Displayed text" input view.
	 */
	public displayedTextInputView: LabeledFieldView<InputTextView>;

	/**
	 * The URL input view.
	 */
	public urlInputView: LabeledFieldView<InputTextView>;

	/**
	 * A collection of child views.
	 */
	public readonly children: ViewCollection;

	/**
	 * A collection of child views in the providers list.
	 */
	public readonly providersListChildren: ViewCollection<ButtonView>;

	/**
	 * An array of form validators used by {@link #isValid}.
	 */
	private readonly _validators: Array<LinkFormValidatorCallback>;

	/**
	 * A collection of views that can be focused in the form.
	 */
	private readonly _focusables = new ViewCollection<FocusableView>();

	/**
	 * Helps cycling over {@link #_focusables} in the form.
	 */
	private readonly _focusCycler: FocusCycler;

	/**
	 * Creates an instance of the {@link module:link/ui/linkformview~LinkFormView} class.
	 *
	 * Also see {@link #render}.
	 *
	 * @param locale The localization services instance.
	 * @param validators  Form validators used by {@link #isValid}.
	 */
	constructor(
		locale: Locale,
		validators: Array<LinkFormValidatorCallback>
	) {
		super( locale );

		this._validators = validators;

		// Create buttons.
		this.backButtonView = this._createBackButton();
		this.saveButtonView = this._createSaveButton();

		// Create input fields.
		this.displayedTextInputView = this._createDisplayedTextInput();
		this.urlInputView = this._createUrlInput();

		this.providersListChildren = this.createCollection();
		this.children = this.createCollection( [
			this._createHeaderView()
		] );

		this._createFormChildren();

		// Add providers list view to the children when the first item is added to the list.
		// This is to avoid adding the list view when the form is empty.
		this.listenTo( this.providersListChildren, 'add', () => {
			this.stopListening( this.providersListChildren, 'add' );
			this.children.add( this._createProvidersListView() );
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
					'ck-link-form',
					'ck-responsive-form'
				],

				// https://github.com/ckeditor/ckeditor5-link/issues/90
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
			this.urlInputView,
			this.saveButtonView,
			...this.providersListChildren,
			this.backButtonView,
			this.displayedTextInputView
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element! );
		} );

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
	 * Focuses the fist {@link #_focusables} in the form.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
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
	 * Creates a save button view that inserts the link.
	 */
	private _createSaveButton(): ButtonView {
		const t = this.locale!.t;
		const saveButton = new ButtonView( this.locale );

		saveButton.set( {
			label: t( 'Insert' ),
			tooltip: false,
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
			label: t( 'Link' )
		} );

		header.children.add( this.backButtonView, 0 );

		return header;
	}

	/**
	 * Creates a view for the providers list.
	 */
	private _createProvidersListView(): ListView {
		const providersListView = new ListView( this.locale );

		providersListView.extendTemplate( {
			attributes: {
				class: [
					'ck-link-form__providers-list'
				]
			}
		} );

		providersListView.items.bindTo( this.providersListChildren ).using( def => {
			const listItemView = new ListItemView( this.locale );

			listItemView.children.add( def );

			return listItemView;
		} );

		return providersListView;
	}

	/**
	 * Creates a labeled input view for the "Displayed text" field.
	 */
	private _createDisplayedTextInput(): LabeledFieldView<InputTextView> {
		const t = this.locale!.t;
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = t( 'Displayed text' );
		labeledInput.class = 'ck-labeled-field-view_full-width';

		return labeledInput;
	}

	/**
	 * Creates a labeled input view for the URL field.
	 *
	 * @returns Labeled field view instance.
	 */
	private _createUrlInput(): LabeledFieldView<InputTextView> {
		const t = this.locale!.t;
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.fieldView.inputMode = 'url';
		labeledInput.label = t( 'Link URL' );
		labeledInput.class = 'ck-labeled-field-view_full-width';

		return labeledInput;
	}

	/**
	 * Populates the {@link #children} collection of the form.
	 */
	private _createFormChildren(): void {
		this.children.add( new FormRowView( this.locale!, {
			children: [
				this.displayedTextInputView
			],
			class: [
				'ck-form__row_large-top-padding'
			]
		} ) );

		this.children.add( new FormRowView( this.locale!, {
			children: [
				this.urlInputView,
				this.saveButtonView
			],
			class: [
				'ck-form__row_with-submit',
				'ck-form__row_large-top-padding',
				'ck-form__row_large-bottom-padding'
			]
		} ) );
	}

	/**
	 * The native DOM `value` of the {@link #urlInputView} element.
	 *
	 * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
	 * which works one way only and may not represent the actual state of the component in the DOM.
	 */
	public get url(): string | null {
		const { element } = this.urlInputView.fieldView;

		if ( !element ) {
			return null;
		}

		return element.value.trim();
	}
}

/**
 * Callback used by {@link ~LinkFormView} to check if passed form value is valid.
 *
 * 	* If `undefined` is returned, it is assumed that the form value is correct and there is no error.
 * 	* If string is returned, it is assumed that the form value is incorrect and the returned string is displayed in the error label
 */
export type LinkFormValidatorCallback = ( form: LinkFormView ) => string | undefined;

/**
 * Fired when the form view is submitted (when one of the children triggered the submit event),
 * for example with a click on {@link ~LinkFormView#saveButtonView}.
 *
 * @eventName ~LinkFormView#submit
 */
export type SubmitEvent = {
	name: 'submit';
	args: [];
};

/**
 * Fired when the form view is canceled, for example with a click on {@link ~LinkFormView#backButtonView}.
 *
 * @eventName ~LinkFormView#cancel
 */
export type CancelEvent = {
	name: 'cancel';
	args: [];
};
