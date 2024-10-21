/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
	SwitchButtonView,
	FormHeaderView,
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
	type Collection,
	type Locale
} from 'ckeditor5/src/utils.js';
import { icons } from 'ckeditor5/src/core.js';

import type LinkCommand from '../linkcommand.js';
import type ManualDecorator from '../utils/manualdecorator.js';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/linkform.css';

/**
 * The link form view controller class.
 *
 * See {@link module:link/ui/linkformview~LinkFormView}.
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
	public backButton: ButtonView;

	/**
	 * The Settings button view displayed in the header.
	 */
	public settingsButton: ButtonView;

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
	 * A collection of {@link module:ui/button/switchbuttonview~SwitchButtonView},
	 * which corresponds to {@link module:link/linkcommand~LinkCommand#manualDecorators manual decorators}
	 * configured in the editor.
	 */
	private readonly _manualDecoratorSwitches: ViewCollection<SwitchButtonView>;

	/**
	 * A collection of child views.
	 */
	public readonly children: ViewCollection;

	/**
	 * A collection of child views in the form.
	 */
	public readonly formChildren: ViewCollection;

	/**
	 * A collection of child views in the footer.
	 */
	public readonly listChildren: ViewCollection<ButtonView>;

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
	 * @param linkCommand Reference to {@link module:link/linkcommand~LinkCommand}.
	 * @param validators  Form validators used by {@link #isValid}.
	 */
	constructor(
		locale: Locale,
		linkCommand: LinkCommand,
		validators: Array<LinkFormValidatorCallback>
	) {
		super( locale );

		this._validators = validators;

		// Create buttons
		this.backButton = this._createBackButton();
		this.settingsButton = this._createSettingsButton();
		this.saveButtonView = this._createSaveButton();

		// Create input fields
		this.displayedTextInputView = this._createDisplayedTextInput();
		this.urlInputView = this._createUrlInput();

		this._manualDecoratorSwitches = this._createManualDecoratorSwitches( linkCommand );
		this.formChildren = this._createFormChildren( linkCommand.manualDecorators );
		this.listChildren = this.createCollection();
		this.children = this.createCollection( [
			this._createHeaderView(),
			this._createFormView()
		] );

		// Add list view to the children when the first item is added to the list.
		// This is to avoid adding the list view when the form is empty.
		this.listenTo( this.listChildren, 'add', () => {
			this.stopListening( this.listChildren, 'add' );
			this.children.add( this._createListView() );
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
				class: [ 'ck', 'ck-link__panel' ],

				// https://github.com/ckeditor/ckeditor5-link/issues/90
				tabindex: '-1'
			},

			children: this.children
		} );
	}

	/**
	 * Obtains the state of the {@link module:ui/button/switchbuttonview~SwitchButtonView switch buttons} representing
	 * {@link module:link/linkcommand~LinkCommand#manualDecorators manual link decorators}
	 * in the {@link module:link/ui/linkformview~LinkFormView}.
	 *
	 * @returns Key-value pairs, where the key is the name of the decorator and the value is its state.
	 */
	public getDecoratorSwitchesState(): Record<string, boolean> {
		return Array
			.from( this._manualDecoratorSwitches as Iterable<SwitchButtonView & { name: string }> )
			.reduce( ( accumulator, switchButton ) => {
				accumulator[ switchButton.name ] = switchButton.isOn;
				return accumulator;
			}, {} as Record<string, boolean> );
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
			...this._manualDecoratorSwitches, // TODO: Move to a separate panel
			this.saveButtonView,
			...this.listChildren,
			this.backButton,
			this.settingsButton,
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
			label: t( 'Cancel' ),
			icon: icons.previousArrow,
			tooltip: true
		} );

		backButton.delegate( 'execute' ).to( this, 'cancel' );

		return backButton;
	}

	/**
	 * Creates a settings button view that opens the advanced settings panel.
	 */
	private _createSettingsButton(): ButtonView {
		const t = this.locale!.t;
		const settingsButton = new ButtonView( this.locale );

		settingsButton.set( {
			label: t( 'Advanced' ),
			icon: icons.settings,
			tooltip: true
		} );

		return settingsButton;
	}

	/**
	 * Creates a save button view that inserts the link.
	 */
	private _createSaveButton(): ButtonView {
		const t = this.locale!.t;
		const saveButton = new ButtonView( this.locale );

		saveButton.set( {
			label: t( 'Insert' ),
			tooltip: true,
			withText: true,
			type: 'submit',
			class: 'ck-button-insert ck-button-action ck-button-bold'
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

		header.children.add( this.backButton, 0 );
		header.children.add( this.settingsButton );

		return header;
	}

	/**
	 * Creates a form view for the link form.
	 */
	private _createFormView(): View {
		const form = new View( this.locale );

		form.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-link__form',
					'ck-responsive-form'
				]
			},

			children: this.formChildren
		} );

		return form;
	}

	/**
	 * Creates a view for the list at the bottom.
	 */
	private _createListView(): ListView {
		const listView = new ListView( this.locale );

		listView.extendTemplate( {
			attributes: {
				class: [
					'ck-link__list'
				]
			}
		} );

		listView.items.bindTo( this.listChildren ).using( def => {
			const listItemView = new ListItemView( this.locale );

			listItemView.children.add( def );

			return listItemView;
		} );

		return listView;
	}

	/**
	 * Creates a labeled input view for the "Displayed text" field.
	 */
	private _createDisplayedTextInput(): LabeledFieldView<InputTextView> {
		const t = this.locale!.t;
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = t( 'Displayed text' );

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

		return labeledInput;
	}

	/**
	 * Populates {@link module:ui/viewcollection~ViewCollection} of {@link module:ui/button/switchbuttonview~SwitchButtonView}
	 * made based on {@link module:link/linkcommand~LinkCommand#manualDecorators}.
	 *
	 * @param linkCommand A reference to the link command.
	 * @returns ViewCollection of switch buttons.
	 */
	private _createManualDecoratorSwitches( linkCommand: LinkCommand ): ViewCollection<SwitchButtonView> {
		const switches = this.createCollection<SwitchButtonView>();

		for ( const manualDecorator of linkCommand.manualDecorators ) {
			const switchButton: SwitchButtonView & { name?: string } = new SwitchButtonView( this.locale );

			switchButton.set( {
				name: manualDecorator.id,
				label: manualDecorator.label,
				withText: true
			} );

			switchButton.bind( 'isOn' ).toMany( [ manualDecorator, linkCommand ], 'value', ( decoratorValue, commandValue ) => {
				return commandValue === undefined && decoratorValue === undefined ? !!manualDecorator.defaultValue : !!decoratorValue;
			} );

			switchButton.on( 'execute', () => {
				manualDecorator.set( 'value', !switchButton.isOn );
			} );

			switches.add( switchButton );
		}

		return switches;
	}

	/**
	 * Populates the {@link #children} collection of the form.
	 *
	 * If {@link module:link/linkcommand~LinkCommand#manualDecorators manual decorators} are configured in the editor, it creates an
	 * additional `View` wrapping all {@link #_manualDecoratorSwitches} switch buttons corresponding
	 * to these decorators.
	 *
	 * @param manualDecorators A reference to
	 * the collection of manual decorators stored in the link command.
	 * @returns The children of link form view.
	 */
	private _createFormChildren( manualDecorators: Collection<ManualDecorator> ): ViewCollection {
		const children = this.createCollection();

		// TODO: Remove decorators to a separate panel
		if ( manualDecorators.length ) {
			const additionalButtonsView = new View();

			additionalButtonsView.setTemplate( {
				tag: 'ul',
				children: this._manualDecoratorSwitches.map( switchButton => ( {
					tag: 'li',
					children: [ switchButton ],
					attributes: {
						class: [
							'ck',
							'ck-list__item'
						]
					}
				} ) ),
				attributes: {
					class: [
						'ck',
						'ck-reset',
						'ck-list'
					]
				}
			} );
			children.add( additionalButtonsView );
		}

		children.add( this.displayedTextInputView );

		const linkInputAndSubmit = new View();

		linkInputAndSubmit.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-link-and-submit', 'ck-labeled-field-view' ]
			},
			children: [
				this.urlInputView,
				this.saveButtonView
			]
		} );

		children.add( linkInputAndSubmit );

		return children;
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
 * Fired when the form view is canceled, for example with a click on {@link ~LinkFormView#cancelButtonView}.
 *
 * @eventName ~LinkFormView#cancel
 */
export type CancelEvent = {
	name: 'cancel';
	args: [];
};
