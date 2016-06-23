/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../controller.js';

/**
 * Icon manager class.
 *
 * @memberOf ui.iconManager
 * @extends ui.Controller
 */
export default class IconManager extends Controller {
	/**
	 * Creates a new instance of the IconManager class.
	 *
	 * @param {utils.Observable} model
	 * @param {ui.View} [view] View instance.
	 */
	constructor( model, view ) {
		super( model, view );

		view.model.bind( 'sprite' ).to( model );
	}
}
