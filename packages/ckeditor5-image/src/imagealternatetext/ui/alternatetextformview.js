/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/ui/imagealternativetextformview
 */

import View from 'ckeditor5-ui/src/view';
import ButtonView from 'ckeditor5-ui/src/button/buttonview';
import Template from 'ckeditor5-ui/src/template';
import LabeledInputView from 'ckeditor5-ui/src/labeledinput/labeledinputview';
import TextAreaView from './textareaview';
import submitHandler from 'ckeditor5-ui/src/bindings/submithandler';

export default class AlternateTextFormView extends View{
	constructor( locale ) {
		super( locale );

		this.alternateTextInput = this._createAlternateTextInput();

		this.saveButtonView = this._createButton( 'Ok' );
		this.saveButtonView.type = 'submit';

		this.cancelButtonView = this._createButton( 'Cancel', 'cancel' );

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
				this.alternateTextInput,
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
	 * Creates button View.
	 *
	 * @private
	 * @param {String} label Button label
	 * @param {String} [eventName] Event name which ButtonView#execute event will be delegated to.
	 * @returns {module:ui/button/buttonview~ButtonView} Button view instance.
	 */
	_createButton( label, eventName ) {
		const t = this.locale.t;
		const button = new ButtonView( this.locale );

		button.label = t( label );
		button.withText = true;

		if ( eventName ) {
			button.delegate( 'execute' ).to( this, eventName );
		}

		return button;
	}

	_createAlternateTextInput() {
		const t = this.locale.t;

		const labeledInput = new LabeledInputView( this.locale, TextAreaView );

		labeledInput.label = t( 'Alternate image text' );

		return labeledInput;
	}
}
