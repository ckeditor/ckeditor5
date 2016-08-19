/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Controller from '../../ui/controller.js';

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

		view.model.bind( 'arrow', 'maxWidth', 'maxHeight' ).to( model );

		view.model.set( 'top', 0 );
		view.model.set( 'left', 0 );

		view.model.set( 'isVisible', false );
	}
}
