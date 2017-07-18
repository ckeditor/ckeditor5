/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagetextalternative/ui/textalternativeformview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Template from '@ckeditor/ckeditor5-ui/src/template';
import LabeledInputView from '@ckeditor/ckeditor5-ui/src/labeledinput/labeledinputview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

/**
 * TextAlternativeFormView class.
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
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * Text area with label.
		 *
		 * @member {module:ui/labeledinput/labeledinputview~LabeledInputView} #labeledTextarea
		 */
		this.labeledInput = this._createLabeledInputView();

		/**
		 * Button used to submit the form.
		 *
		 * @member {module:ui/button/buttonview~ButtonView} #saveButtonView
		 */
		this.saveButtonView = this._createButton( t( 'Save' ) );
		this.saveButtonView.type = 'submit';

		/**
		 * Button used to cancel the form.
		 *
		 * @member {module:ui/button/buttonview~ButtonView} #cancelButtonView
		 */
		this.cancelButtonView = this._createButton( t( 'Cancel' ), 'cancel' );

		Template.extend( this.saveButtonView.template, {
			attributes: {
				class: [
					'ck-button-action'
				]
			}
		} );

		this.template = new Template( {
			tag: 'form',

			attributes: {
				class: [
					'cke-text-alternative-form',
				]
			},

			children: [
				this.labeledInput,
				{
					tag: 'div',

					attributes: {
						class: [
							'cke-text-alternative-form__actions'
						]
					},

					children: [
						this.saveButtonView,
						this.cancelButtonView
					]
				}
			]
		} );

		submitHandler( {
			view: this
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		super.init();

		this.keystrokes.listenTo( this.element );
	}

	/**
	 * Creates button view.
	 *
	 * @private
	 * @param {String} label Button label
	 * @param {String} [eventName] Event name which ButtonView#execute event will be delegated to.
	 * @returns {module:ui/button/buttonview~ButtonView} Button view instance.
	 */
	_createButton( label, eventName ) {
		const button = new ButtonView( this.locale );

		button.label = label;
		button.withText = true;

		if ( eventName ) {
			button.delegate( 'execute' ).to( this, eventName );
		}

		return button;
	}

	/**
	 * Creates input with label.
	 *
	 * @private
	 * @return {module:ui/labeledinput/labeledinputview~LabeledInputView}
	 */
	_createLabeledInputView() {
		const t = this.locale.t;
		const labeledInput = new LabeledInputView( this.locale, InputTextView );
		labeledInput.label = t( 'Text alternative' );

		return labeledInput;
	}
}
