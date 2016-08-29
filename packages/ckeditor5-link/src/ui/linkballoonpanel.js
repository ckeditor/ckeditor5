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
 * @memberOf link.ui
 * @extends ui.Controller
 */
export default class LinkBalloonPanel extends BalloonPanel {
	/**
	 * Creates an instance of {@link ui.dropdown.Dropdown} class.
	 *
	 * @param {ui.balloonPanel.BalloonPanelModel} model Model of this balloon panel.
	 * @param {ui.View} view View of this balloon panel.
	 */
	constructor( model, view ) {
		super( model, view );

		this.add( 'content', this._createForm() );
	}

	_createForm() {
		const formModel = new Model();

		formModel.delegate( 'execute' ).to( this.model );

		/**
		 * TODO
		 *
		 * @member {} todo
		 */
		this.form = new Form( formModel, new FormView( this.locale ) );
		this.form.add( 'content', this._createLabeledInput() );
		this.form.add( 'content', this._createButtons() );

		return this.form;
	}

	_createLabeledInput() {
		const t = this.view.t;
		const model = new Model( {
			label: t( 'Link URL' )
		} );

		model.bind( 'value' ).to( this.model, 'url' );

		/**
		 * TODO
		 *
		 * @member {} todo
		 */
		this.urlInput = new LabeledInput( model, new LabeledInputView( this.locale ) );

		return this.urlInput;
	}

	_createButtons() {
		const box = new Box( new Model( {
			alignRight: true
		} ), new BoxView( this.locale ) );

		/**
		 * TODO
		 *
		 * @member {} todo
		 */
		this.saveButton = this._createSaveButton();

		/**
		 * TODO
		 *
		 * @member {} todo
		 */
		this.cancelButton = this._createCancelButton();

		box.add( 'content', this.cancelButton );
		box.add( 'content', this.saveButton );

		return box;
	}

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
}
