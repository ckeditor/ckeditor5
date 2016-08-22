/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Controller from '../../ui/controller.js';

/**
 * The balloon panel controller class.
 *
 * @memberOf ui.balloonPanel
 * @extends ui.Controller
 */
export default class BalloonPanel extends Controller {
	/**
	 * Creates an instance of {@link ui.balloonPanel.BalloonPanel} class.
	 *
	 * @param {ui.balloonPanel.BalloonPanelModel} model Model of this balloon panel.
	 * @param {ui.View} view View of this balloon panel.
	 */
	constructor( model, view ) {
		super( model, view );

		view.model.set( 'top', 0 );
		view.model.set( 'left', 0 );
		view.model.set( 'isVisible', false );
		view.model.bind( 'arrow', 'maxWidth', 'maxHeight' ).to( model );

		this.addCollection( 'content' );
	}
}
