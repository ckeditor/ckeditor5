/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../ui/model.js';
import Controller from '../../ui/controller.js';

import Button from '../../ui/button/button.js';
import LabeledInput from '../../ui/labeledinput/labeledinput.js';
import InputText from '../../ui/inputtext/inputtext.js';

/**
 * The link form class.
 *
 *		new LinkForm( new Model(), new LinkFormView() );
 *
 * See {@link link.ui.LinkFormView}.
 *
 * @memberOf link.ui
 * @extends ui.Controller
 */
export default class LinkForm extends Controller {
	/**
	 * Creates an instance of {@link link.ui.LinkForm} class.
	 *
	 * @param {link.ui.LinkFormModel} model Model of this link form.
	 * @param {ui.View} view View of this link form.
	 */
	constructor( model, view ) {
		super( model, view );

		const t = this.view.t;
		const urlInputModel = new Model( {
			label: t( 'Link URL' )
		} );

		// Bind LabeledInputModel#value to LinkFormModel#url.
		urlInputModel.bind( 'value' ).to( model, 'url' );

		/**
		 * The URL input inside {@link link.ui.LinkForm}.
		 *
		 * @member {ui.input.labeled.LabeledInput} link.ui.LinkForm#urlInput
		 */
		this.urlInput = new LabeledInput( urlInputModel, view.urlInputView, InputText, new Model() );

		/**
		 * The save button inside {@link link.ui.LinkForm}.
		 *
		 * @member {ui.button.Button} link.ui.LinkForm#saveButton
		 */
		this.saveButton = new Button( new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Save' ),
			withText: true,
			type: 'submit'
		} ), view.saveButtonView );

		/**
		 * The cancel button inside {@link link.ui.LinkForm}.
		 *
		 * @member {ui.button.Button} link.ui.LinkForm#cancelButton
		 */
		this.cancelButton = new Button( new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Cancel' ),
			withText: true
		} ), view.cancelButtonView );

		/**
		 * The unlink button inside {@link link.ui.LinkForm}.
		 *
		 * @member {ui.button.Button} link.ui.LinkForm#unlinkButton
		 */
		this.unlinkButton = new Button( new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Unlink' ),
			icon: 'unlink'
		} ), view.unlinkButtonView );

		view.delegate( 'submit' ).to( model );

		// TODO: Delegate event with changed name.
		this.listenTo( this.cancelButton.model, 'execute', () => {
			this.model.fire( 'cancel' );
		} );

		this.listenTo( this.unlinkButton.model, 'execute', () => {
			this.model.fire( 'unlink' );
		} );

		// TODO: add() should accept multiple items.
		this.add( this.urlInput );
		this.add( this.saveButton );
		this.add( this.cancelButton );
		this.add( this.unlinkButton );
	}
}

/**
 * The link form component {@link ui.Model model} interface.
 *
 * @interface link.ui.LinkFormModel
 */

/**
 * The url value as in {@link link.ui.LinkForm#urlInput}.
 *
 * @observable
 * @member {String} link.ui.LinkFormModel#url
 */

/**
 * Fired when the view is submitted by the user, i.e. when
 * the {@link link.ui.LinkForm#saveButton} has been executed.
 *
 * @event link.ui.LinkFormModel#submit
 */

/**
 * Fired when the {@link link.ui.LinkForm#cancelButton} has been executed.
 *
 * @event link.ui.LinkFormModel#cancel
 */

/**
 * Fired when the {@link link.ui.LinkForm#unlinkButton} has been executed.
 *
 * @event link.ui.LinkFormModel#unlink
 */
