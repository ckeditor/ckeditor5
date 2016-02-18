/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../controller.js';

/**
 * The basic button controller class.
 *
 * @class core.ui.button.Button
 * @extends core.ui.Controller
 */

export default class Button extends Controller {
	/**
	 * Creates a new button instance.
	 *
	 * @method constructor
	 */
	constructor( model, view ) {
		super( model, view );

		view.on( 'clicked', () => model.fire( 'executed' ) );
	}
}
