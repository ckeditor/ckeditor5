/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../controller.js';

/**
 * The basic button controller class.
 *
 * @memberOf core.ui.button
 * @extends core.ui.Controller
 */

export default class Button extends Controller {
	constructor( model, view ) {
		super( model, view );

		view.on( 'click', () => model.fire( 'execute' ) );
	}
}

/**
 * The basic button model interface.
 *
 * @memberOf core.ui.button
 * @interface ButtonModel
 */

/**
 * The label of the button.
 *
 * @member {String} core.ui.button.ButtonModel#label
 */

/**
 * Whether the button is "on" (e.g. some feature which this button represents is currently enabled).
 *
 * @member {Boolean} core.ui.button.ButtonModel#isOn
 */

/**
 * Whether the button is enabled (can be clicked).
 *
 * @member {Boolean} core.ui.button.ButtonModel#isEnabled
 */

/**
 * Fired when the button action should be executed.
 *
 * @event core.ui.button.ButtonModel#execute
 */
