/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/ui/linkformview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import LabeledInputView from '@ckeditor/ckeditor5-ui/src/labeledinput/labeledinputview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';

import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';

/**
 * The link form view controller class.
 *
 * See {@link module:link/ui/linkformview~LinkFormView}.
 *
 * @extends module:ui/view~View
 */
export default class LinkFormView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const t = locale.t;

		/**
		 * The url input view.
		 *
		 * @member {module:ui/labeledinput/labeledinputview~LabeledInputView}
		 */
		this.urlInputView = this._createUrlInput();

		/**
		 * The save button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.saveButtonView = this._createButton( 'Save' );
		this.saveButtonView.type = 'submit';

		/**
		 * The cancel button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.cancelButtonView = this._createButton( t( 'Cancel' ), 'cancel' );

		/**
		 * The unlink button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.unlinkButtonView = this._createButton( t( 'Unlink' ), 'unlink' );

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
					'ck-link-form',
				]
			},

			children: [
				this.urlInputView,
				{
					tag: 'div',

					attributes: {
						class: [
							'ck-link-form__actions'
						]
					},

					children: [
						this.saveButtonView,
						this.cancelButtonView,
						this.unlinkButtonView
					]
				}
			]
		} );

		submitHandler( {
			view: this
		} );
	}

	/**
	 * Create labeled input view.
	 *
	 * @private
	 * @returns {module:ui/labeledinput/labeledinputview~LabeledInputView} Labeled input view instance.
	 */
	_createUrlInput() {
		const t = this.locale.t;

		const labeledInput = new LabeledInputView( this.locale, InputTextView );

		labeledInput.label = t( 'Link URL' );

		return labeledInput;
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
		const button = new ButtonView( this.locale );

		button.label = label;
		button.withText = true;

		if ( eventName ) {
			button.delegate( 'execute' ).to( this, eventName );
		}

		return button;
	}
}

/**
 * Fired when the form view is submitted (when one of the child triggered submit event).
 * E.g. click on {@link #saveButtonView}.
 *
 * @event submit
 */

/**
 * Fired when the form view is canceled, e.g. click on {@link #cancelButtonView}.
 *
 * @event cancel
 */

/**
 * Fired when the {@link #unlinkButtonView} is clicked.
 *
 * @event unlink
 */
