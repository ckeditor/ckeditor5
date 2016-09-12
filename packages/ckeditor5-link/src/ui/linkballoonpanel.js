/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../ui/model.js';
import Button from '../../ui/button/button.js';
import ButtonView from '../../ui/button/buttonview.js';
import BalloonPanel from '../../ui/balloonpanel/balloonpanel.js';
import LabeledInput from '../../ui/labeledinput/labeledinput.js';
import LabeledInputView from '../../ui/labeledinput/labeledinputview.js';
import LinkForm from './linkform.js';
import LinkFormView from './linkformview.js';
import InputText from '../../ui/inputtext/inputtext.js';
import InputTextView from '../../ui/inputtext/inputtextview.js';

/**
 * The link balloon panel controller class.
 *
 *		const model = new Model( {
 *			maxWidth: 300,
 *			url: 'http://ckeditor.com'
 *		} );
 *
 *		// An instance of LinkBalloonPanel.
 *		new LinkBalloonPanel( model, new LinkBalloonPanelView() );
 *
 * See {@link link.ui.LinkBalloonPanelView}.
 *
 * @memberOf link.ui
 * @extends ui.balloonPanel.BalloonPanel
 */
export default class LinkBalloonPanel extends BalloonPanel {
	/**
	 * Creates an instance of {@link link.ui.LinkBalloonPanel} class.
	 *
	 * @param {link.ui.LinkBalloonPanelModel} model Model of this link balloon panel.
	 * @param {ui.View} view View of this link balloon panel.
	 */
	constructor( model, view ) {
		super( model, view );

		this.add( 'content', this._createForm() );
	}

	/**
	 * Initializes {@link link.ui.LinkForm} component with input and buttons.
	 *
	 * @private
	 * @returns {link.ui.LinkForm} Form component.
	 */
	_createForm() {
		const formModel = new Model();

		formModel.on( 'execute', () => this.model.fire( 'executeLink' ) );

		/**
		 * An instance of {@link link.ui.LinkForm} component.
		 *
		 * @member {link.ui.LinkForm} link.ui.LinkBalloonPanel#form
		 */
		this.form = new LinkForm( formModel, new LinkFormView( this.locale ) );

		/**
		 * The button component for submitting form.
		 *
		 * @member {ui.button.Button} link.ui.LinkBalloonPanel#saveButton
		 */
		this.saveButton = this._createSaveButton();

		/**
		 * The button component for canceling form.
		 *
		 * @member {ui.button.Button} link.ui.LinkBalloonPanel#cancelButton
		 */
		this.cancelButton = this._createCancelButton();

		/**
		 * The button component for unlinking.
		 *
		 * @member {ui.button.Button} link.ui.LinkBalloonPanel#unlinkButton
		 */
		this.unlinkButton = this._createUnlinkButton();

		// Add Input to the form content.
		this.form.add( 'content', this._createLabeledInput() );

		// Add `Save` and `Cancel` buttons to the form actions.
		this.form.add( 'actions', this.saveButton );
		this.form.add( 'actions', this.cancelButton );
		this.form.add( 'actions', this.unlinkButton );

		return this.form;
	}

	/**
	 * Initializes the {@link ui.input.LabeledInput LabeledInput} which displays
	 * and allows manipulation of the `href` attribute in edited link.
	 *
	 * @private
	 * @returns {ui.input.LabeledInput} Labeled input component.
	 */
	_createLabeledInput() {
		const t = this.view.t;
		const model = new Model( {
			label: t( 'Link URL' )
		} );

		model.bind( 'value' ).to( this.model, 'url' );

		/**
		 * The input component to display and manipulate the `href` attribute.
		 *
		 * @member {ui.input.LabeledInput} link.ui.LinkBalloonPanel#urlInput
		 */
		return ( this.urlInput = new LabeledInput( model, new LabeledInputView( this.locale ),
			InputText, InputTextView, new Model() ) );
	}

	/**
	 * Initializes the {@link ui.button.Button} for submitting the form.
	 *
	 * @private
	 * @returns {ui.button.Button} Save button component.
	 */
	_createSaveButton() {
		const t = this.view.t;
		const saveModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Save' ),
			withText: true,
			type: 'submit'
		} );

		const button = new Button( saveModel, new ButtonView( this.locale ) );

		button.view.element.classList.add( 'ck-button-action' );

		return button;
	}

	/**
	 * Initializes the {@link ui.button.Button Button} for canceling the form.
	 *
	 * @private
	 * @returns {ui.button.Button} Cancel button component.
	 */
	_createCancelButton() {
		const t = this.view.t;
		const cancelModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Cancel' ),
			withText: true
		} );

		cancelModel.on( 'execute', () => this.view.hide() );

		return new Button( cancelModel, new ButtonView( this.locale ) );
	}

	/**
	 * Initializes the {@link ui.button.Button Button} for the `unlink` command.
	 *
	 * @private
	 * @returns {ui.button.Button} Unlink button component.
	 */
	_createUnlinkButton() {
		const t = this.view.t;
		const unlinkModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Unlink' ),
			icon: 'unlink'
		} );

		unlinkModel.on( 'execute', () => this.model.fire( 'executeUnlink' ) );

		const button = new Button( unlinkModel, new ButtonView( this.locale ) );

		return button;
	}
}

/**
 * The link balloon panel component {@link ui.Model} interface.
 *
 * @extends ui.balloonPanel.BalloonPanelModel
 * @interface link.ui.LinkBalloonPanelModel
 */

/**
 * URL of the link displayed in the {@link link.ui.LinkBalloonPanel#urlInput}.
 *
 * @observable
 * @member {String} link.ui.LinkBalloonPanelModel#url
 */

/**
 * Fired when {@link link.ui.LinkBalloonPanel#saveButton} has been executed by the user.
 *
 * @event link.ui.LinkBalloonPanelModel#execute
 */
