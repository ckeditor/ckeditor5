/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../ui/model.js';
import Controller from '../../ui/controller.js';
import Button from '../../ui/button/button.js';
import ButtonView from '../../ui/button/buttonview.js';

/**
 * The link balloon panel controller class.
 *
 * TODO: extends BalloonPanel
 *
 * @memberOf link.ui
 * @extends ui.Controller
 */
export default class LinkBalloonPanel extends Controller {
	/**
	 * Creates an instance of {@link ui.dropdown.Dropdown} class.
	 *
	 * @param {ui.balloonPanel.BalloonPanelModel} model Model of this balloon panel.
	 * @param {ui.View} view View of this balloon panel.
	 */
	constructor( model, view ) {
		super( model, view );

		view.model.bind( 'arrow', 'maxWidth', 'maxHeight', 'url' ).to( model );
		view.model.set( 'top', 0 );
		view.model.set( 'left', 0 );
		view.model.set( 'isVisible', false );

		const buttonsCollection = this.addCollection( 'buttons' );

		this.saveButton = this._createSaveButton();
		this.cancelButton = this._createCancelButton();

		buttonsCollection.add( this.cancelButton );
		buttonsCollection.add( this.saveButton );
	}

	_createSaveButton() {
		const t = this.view.t;
		const saveButtonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Save' ),
			withText: true
		} );

		saveButtonModel.on( 'execute', () => {
			// TODO input and label as separate components.
			this.model.url = this.view.element.querySelector( 'input' ).value;
			this.view.hide();
		} );

		const button = new Button( saveButtonModel, new ButtonView( this.locale ) );
		button.view.element.classList.add( 'ck-button-action' );

		return button;
	}

	_createCancelButton() {
		const t = this.view.t;
		const cancelButtonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Cancel' ),
			withText: true
		} );

		cancelButtonModel.on( 'execute', () => this.view.hide() );

		return new Button( cancelButtonModel, new ButtonView( this.locale ) );
	}
}
