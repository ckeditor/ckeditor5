/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '../../ui/view.js';
import Template from '../../ui/template.js';

import ButtonView from '../../ui/button/buttonview.js';
import LabeledInputView from '../../ui/labeledinput/labeledinputview.js';
import InputTextView from '../../ui/inputtext/inputtextview.js';

import submitHandler from '../../ui/bindings/submithandler.js';

/**
 * The link form view controller class.
 *
 * See {@link link.ui.LinkForm}.
 *
 * @memberOf link.ui
 * @extends ui.View
 */
export default class LinkFormView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * The url input view.
		 *
		 * @member {ui.input.labeled.LabeledInputView} link.ui.LinkFormView#urlInputView
		 */
		this.urlInputView = this._createUrlInput();

		/**
		 * The save button view.
		 *
		 * @member {ui.button.ButtonView} link.ui.LinkFormView#saveButtonView
		 */
		this.saveButtonView = this._createButton( 'Save' );
		this.saveButtonView.type = 'submit';

		/**
		 * The cancel button view.
		 *
		 * @member {ui.button.ButtonView} link.ui.LinkFormView#cancelButtonView
		 */
		this.cancelButtonView = this._createButton( 'Cancel', 'cancel' );

		/**
		 * The unlink button view.
		 *
		 * @member {ui.button.ButtonView} link.ui.LinkFormView#unlinkButtonView
		 */
		this.unlinkButtonView = this._createButton( 'Unlink', 'unlink' );

		// Register child views.
		this.addChild(
			this.urlInputView,
			this.saveButtonView,
			this.cancelButtonView,
			this.unlinkButtonView
		);

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
	 * @returns {ui.labeled.LabeledInputView} Labeled input view instance.
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
	 * @param {String} [event] Event name which ButtonView#execute event will be delegated to.
	 * @returns {ui.button.ButtonView} Button view instance.
	 */
	_createButton( label, event ) {
		const t = this.locale.t;
		const button = new ButtonView( this.locale );

		button.label = t( label );
		button.withText = true;

		if ( event ) {
			this.listenTo( button, 'execute', () => this.fire( event ) );
		}

		return button;
	}
}

/**
 * Fired when the form view is submitted (when one of the child triggered submit event).
 * E.g. click on {@link link.ui.LinkFormView#saveButtonView}.
 *
 * @event link.ui.LinkFormView#submit
 */
