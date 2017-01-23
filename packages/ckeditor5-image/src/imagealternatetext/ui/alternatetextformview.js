/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagealternatetext/ui/imagealternatetextformview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Template from '@ckeditor/ckeditor5-ui/src/template';
import LabeledInputView from '@ckeditor/ckeditor5-ui/src/labeledinput/labeledinputview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';

/**
 * AlternateTextFormView class.
 *
 * @extends module:ui/view~View
 */
export default class AlternateTextFormView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const t = this.locale.t;

		/**
		 * Text area with label.
		 *
		 * @member {module:ui/labeledinput/labeledinputview~LabeledInputView} #labeledTextarea
		 */
		this.lebeledInput = this._createLabeledInputView();

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

		// Register child views.
		this.addChildren( [ this.saveButtonView ] );

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
					'ck-alternate-text-form',
				]
			},

			children: [
				this.lebeledInput,
				{
					tag: 'div',

					attributes: {
						class: [
							'ck-alternate-text-form__actions'
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
		labeledInput.label = t( 'Alternate image text' );

		return labeledInput;
	}
}
