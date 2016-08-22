/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import uid from '../../utils/uid.js';
import Controller from '../../ui/controller.js';

/**
 * The text input controller class.
 *
 * @memberOf ui.input
 * @extends ui.Controller
 */
export default class InputText extends Controller {
	/**
	 * Creates an instance of {@link ui.input.InputText} class.
	 *
	 * @param {ui.input.InputTextModel} model Model of this input.
	 * @param {ui.View} view View of this input.
	 */
	constructor( model, view ) {
		super( model, view );

		view.model.bind( 'value' ).to( model );
		view.model.set( 'uid', `ck-input-${ uid() }` );
	}
}
