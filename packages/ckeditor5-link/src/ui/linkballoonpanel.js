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

		const t = this.view.t;

		view.model.bind( 'arrow', 'maxWidth', 'maxHeight' ).to( model );
		view.model.set( 'top', 0 );
		view.model.set( 'left', 0 );
		view.model.set( 'isVisible', false );

		const buttonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Save' ),
			withText: true
		} );

		this.saveButton = new Button( buttonModel, new ButtonView( this.locale ) );
		this.saveButton.view.element.classList.add( 'ck-button-action' );

		this.addCollection( 'buttons' ).add( this.saveButton );
	}
}
