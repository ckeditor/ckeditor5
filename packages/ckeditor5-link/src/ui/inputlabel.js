/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Controller from '../../ui/controller.js';

/**
 * The input label controller class.
 *
 * @memberOf ui.input
 * @extends ui.Controller
 */
export default class InputLabel extends Controller {
	/**
	 * Creates an instance of {@link ui.input.InputLabel} class.
	 *
	 * @param {ui.input.InputLabelModel} model Model of this label.
	 * @param {ui.View} view View of this label.
	 */
	constructor( model, view ) {
		super( model, view );

		view.model.bind( 'for', 'text' ).to( model );
	}
}
