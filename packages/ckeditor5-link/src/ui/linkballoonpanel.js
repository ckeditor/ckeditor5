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
import Form from '../../ui/form/form.js';
import FormView from '../../ui/form/formview.js';
import Box from '../../ui/box/box.js';
import BoxView from '../../ui/box/boxview.js';

/**
 * The link balloon panel controller class.
 *
 * 		const model = new Model( {
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
	 * @param {ui.balloonPanel.BalloonPanelModel} model Model of this balloon panel.
	 * @param {ui.View} view View of this balloon panel.
	 */
	constructor( model, view ) {
		super( model, view );

		this.add( 'content', this._createForm() );
	}

	/**
	 * Initialize {@link ui.form.Form Form} component with input and buttons.
	 *
	 * @private
	 * @returns {ui.form.Form} Form component.
	 */
	_createForm() {
		const formModel = new Model();

		formModel.delegate( 'execute' ).to( this.model );

		/**
		 * Instance of {@link ui.form.Form Form} component.
		 *
		 * @member {ui.form.Form} link.ui.LinkBalloonPanel#form
		 */
		this.form = new Form( formModel, new FormView( this.locale ) );

		// Add Input and buttons as a form content.
		this.form.add( 'content', this._createLabeledInput() );
		this.form.add( 'content', this._createButtons() );

		return this.form;
	}

	/**
	 * Initialize {@link ui.input.LabeledInput LabeledInput} for providing `href` value.
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
		 * Input component for providing `href` value.
		 *
		 * @member {ui.input.LabeledInput} link.ui.LinkBalloonPanel#urlInput
		 */
		this.urlInput = new LabeledInput( model, new LabeledInputView( this.locale ) );

		return this.urlInput;
	}

	/**
	 * Create {@link ui.box.Box Box} instance with `Cancel` and `Save` buttons.
	 *
	 * @private
	 * @returns {ui.box.Box} Box component.
	 */
	_createButtons() {
		const wrapper = new Box( new Model( {
			alignContent: 'right'
		} ), new BoxView( this.locale ) );
		wrapper.view.element.classList.add( 'ck-link-balloon-panel_actions' );

		const additionalActions = new Box( new Model(), new BoxView( this.locale ) );

		/**
		 * Button component for submitting form.
		 *
		 * @member {ui.button.Button} link.ui.LinkBalloonPanel#saveButton
		 */
		this.saveButton = this._createSaveButton();

		/**
		 * Button component for canceling form.
		 *
		 * @member {ui.button.Button} link.ui.LinkBalloonPanel#cancelButton
		 */
		this.cancelButton = this._createCancelButton();

		/**
		 * Button component for unlinking.
		 *
		 * @member {ui.button.Button} link.ui.LinkBalloonPanel#unlinkButton
		 */
		this.unlinkButton = this._createUnlinkButton();

		// Add `Save`, `Cancel` and `Unlink` buttons as a wrapper content.
		wrapper.add( 'content', this.saveButton );
		wrapper.add( 'content', this.cancelButton );

		// Append Unlink button into additional action box.
		additionalActions.add( 'content', this.unlinkButton );

		wrapper.add( 'content', additionalActions );

		return wrapper;
	}

	/**
	 * Initialize {@link ui.button.Button Button} for submitting form.
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
	 * Initialize {@link ui.button.Button Button} for canceling form.
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
	 * Initialize {@link ui.button.Button Button} for unlinking command.
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
			withText: true
		} );

		unlinkModel.on( 'execute', () => this.model.fire( 'execute-unlink' ) );

		const button = new Button( unlinkModel, new ButtonView( this.locale ) );

		button.view.element.classList.add( 'ck-button-action' );

		return button;
	}
}
