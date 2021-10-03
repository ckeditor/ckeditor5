/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	ButtonView,
	FocusCycler,
	LabeledFieldView,
	View,
	ViewCollection,
	createLabeledInputText,
	injectCssTransitionDisabler,
	submitHandler
} from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';
import { icons } from 'ckeditor5/src/core';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../theme/inlinetooltipform.css';

/**
 * The form view controller class.
 *
 * @extends module:ui/view~View
 */
export default class InlineTooltipFormView extends View {
	/**
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 */
	constructor( locale ) {
		super( locale );

		const t = locale.t;

		/**
		 * Tracks information about the DOM focus in the form.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * The value of the text input.
		 *
		 * @member {String} #textInputValue
		 * @observable
		 */
		this.set( 'textInputValue', '' );

		/**
		 * The value of the tooltip input.
		 *
		 * @member {String} #tooltipInputValue
		 * @observable
		 */
		this.set( 'tooltipInputValue', '' );

		/**
		 * The text input view.
		 *
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		 */
		this.textInputView = this._createTextInput();

		/**
		 * The tooltip input view.
		 *
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		 */
		this.tooltipInputView = this._createTooltipInput();

		/**
		 * The Save button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.saveButtonView = this._createButton( t( 'Save' ), icons.check, 'ck-button-save' );
		this.saveButtonView.type = 'submit';
		this.saveButtonView.bind( 'isEnabled' ).to( this, 'textInputValue', this, 'tooltipInputValue', (value1, value2) => !!value1 && !!value2 );

		/**
		 * The Cancel button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.cancelButtonView = this._createButton( t( 'Cancel' ), icons.cancel, 'ck-button-cancel', 'cancel' );

		/**
		 * A collection of views that can be focused in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._focusables = new ViewCollection();

		/**
		 * Helps cycling over {@link #_focusables} in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
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


		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-inlinetooltip-form',
					'ck-responsive-form'
				],

				tabindex: '-1'
			},

			children: [
				this.textInputView,
				this.tooltipInputView,
				this.saveButtonView,
				this.cancelButtonView
			]
		} );

		injectCssTransitionDisabler( this );

	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		submitHandler( {
			view: this
		} );

		const childViews = [
			this.textInputView,
			this.tooltipInputView,
			this.saveButtonView,
			this.cancelButtonView
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );

		const stopPropagation = data => data.stopPropagation();

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
		this.listenTo( this.textInputView.element, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
		this.listenTo( this.tooltipInputView.element, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
	}

	/**
	 * Focuses the fist {@link #_focusables} in the form.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	/**
	 * The native DOM `value` of the {@link #textInputView} element.
	 *
	 * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
	 * which works one way only and may not represent the actual state of the component in the DOM.
	 *
	 * @type {String}
	 */
	get text() {
		return this.textInputView.fieldView.element.value.trim();
	}

	set text( text ) {
		this.textInputView.fieldView.element.value = text.trim();
	}

	/**
	 * The native DOM `value` of the {@link #tooltipInputView} element.
	 *
	 * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
	 * which works one way only and may not represent the actual state of the component in the DOM.
	 *
	 * @type {String}
	 */
	get tooltip() {
		return this.tooltipInputView.fieldView.element.value.trim();
	}

	set tooltip( tooltip ) {
		this.tooltipInputView.fieldView.element.value = tooltip.trim();
	}

	/**
	 * Validates the form and returns `false` when some fields are invalid.
	 *
	 * @returns {Boolean}
	 */
	isValid() {
		this.resetFormStatus();

		return true;
	}

	/**
	 * Cleans up the supplementary error and information text of the {@link #textInputView} and {@link #tooltipInputView}
	 * bringing them back to the state when the form has been displayed for the first time.
	 *
	 * See {@link #isValid}.
	 */
	resetFormStatus() {
		this.textInputView.errorText = null;
		this.textInputView.infoText = this._textInputViewInfoDefault;
		this.tooltipInputView.errorText = null;
		this.tooltipInputView.infoText = this._tooltipInputViewInfoDefault;
	}

	/**
	 * Creates a labeled input view.
	 *
	 * @private
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView} Labeled input view instance.
	 */
	_createTextInput() {
		const t = this.locale.t;

		const textLabeledInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const textField = textLabeledInput.fieldView;
		
		textLabeledInput.label = t( 'Text shown in the view.' );

		textField.on( 'input', () => {
			// Display the tip text only when there is some value. Otherwise fall back to the default info text.
			this.textInputValue = textField.element.value.trim();
		} );


		return textLabeledInput;
	}

	/**
	 * Creates a labeled input view.
	 *
	 * @private
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView} Labeled input view instance.
	 */
	_createTooltipInput() {
		const t = this.locale.t;

		const tootlipLabeledInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const tooltipField = tootlipLabeledInput.fieldView;

		tootlipLabeledInput.label = t( 'Text shown in the tooltip.' )

		tooltipField.on( 'input', () => {
			// Display the tip text only when there is some value. Otherwise fall back to the default info text.
			this.tooltipInputValue = tooltipField.element.value.trim();
		} );

		return tootlipLabeledInput;
	}

	/**
	 * Creates a button view.
	 *
	 * @private
	 * @param {String} label The button label.
	 * @param {String} icon The button icon.
	 * @param {String} className The additional button CSS class name.
	 * @param {String} [eventName] An event name that the `ButtonView#execute` event will be delegated to.
	 * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
	 */
	_createButton( label, icon, className, eventName ) {
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

/**
 * Fired when the form view is submitted (when one of the children triggered the submit event),
 * e.g. click on {@link #saveButtonView}.
 *
 * @event submit
 */

/**
 * Fired when the form view is canceled, e.g. by a click on {@link #cancelButtonView}.
 *
 * @event cancel
 */
