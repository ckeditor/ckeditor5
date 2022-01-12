/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetextalternative/ui/textalternativeformview
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

import '../../../theme/textalternativeform.css';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';

/**
 * The TextAlternativeFormView class.
 *
 * @extends module:ui/view~View
 */
export default class TextAlternativeFormView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const t = this.locale.t;

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
		 * An input with a label.
		 *
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView} #labeledInput
		 */
		this.labeledInput = this._createLabeledInputView();

		/**
		 * A button used to submit the form.
		 *
		 * @member {module:ui/button/buttonview~ButtonView} #saveButtonView
		 */
		this.saveButtonView = this._createButton( t( 'Save' ), icons.check, 'ck-button-save' );
		this.saveButtonView.type = 'submit';

		/**
		 * A button used to cancel the form.
		 *
		 * @member {module:ui/button/buttonview~ButtonView} #cancelButtonView
		 */
		this.cancelButtonView = this._createButton( t( 'Cancel' ), icons.cancel, 'ck-button-cancel', 'cancel' );

		/**
		 * A collection of views which can be focused in the form.
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
					'ck-text-alternative-form',
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

		injectCssTransitionDisabler( this );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.keystrokes.listenTo( this.element );

		submitHandler( { view: this } );

		[ this.labeledInput, this.saveButtonView, this.cancelButtonView ]
			.forEach( v => {
				// Register the view as focusable.
				this._focusables.add( v );

				// Register the view in the focus tracker.
				this.focusTracker.add( v.element );
			} );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Creates the button view.
	 *
	 * @private
	 * @param {String} label The button label
	 * @param {String} icon The button's icon.
	 * @param {String} className The additional button CSS class name.
	 * @param {String} [eventName] The event name that the ButtonView#execute event will be delegated to.
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

	/**
	 * Creates an input with a label.
	 *
	 * @private
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView} Labeled field view instance.
	 */
	_createLabeledInputView() {
		const t = this.locale.t;
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = t( 'Text alternative' );

		return labeledInput;
	}
}
