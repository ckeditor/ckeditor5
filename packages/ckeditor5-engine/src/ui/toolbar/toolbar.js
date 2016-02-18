/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../controller.js';
import ControllerCollection from '../controllercollection.js';

/**
 * The basic toolbar controller class.
 *
 * @class core.ui.toolbar.Toolbar
 * @extends core.ui.Controller
 */

export default class Toolbar extends Controller {
	/**
	 * Creates a new toolbar instance.
	 *
	 * @method constructor
	 */
	constructor( model, view ) {
		super( model, view );

		this.collections.add( new ControllerCollection( 'buttons' ) );
	}
}
