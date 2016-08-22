/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../ui/model.js';
import Controller from '../../ui/controller.js';

import InputText from './inputtext.js';
import InputTextView from './inputtextview.js';

import InputLabel from './inputlabel.js';
import InputLabelView from './inputlabelview.js';

/**
 * The labeled input controller class.
 *
 * @memberOf ui.input.labeled
 * @extends ui.Controller
 */
export default class LabeledInput extends Controller {
	/**
	 * Creates an instance of {@link ui.input.labeled.LabeledInput} class.
	 *
	 * @param {ui.input.labeled.LabeledInputModel} model Model of this input.
	 * @param {ui.View} view View of this input.
	 */
	constructor( model, view ) {
		super( model, view );

		const contentCollection = this.addCollection( 'content' );

		/**
		 * TODO
		 *
		 * @member {} todo
		 */
		this.input = this._createInput();

		/**
		 * TODO
		 *
		 * @member {} todo
		 */
		this.label = this._createLabel();

		contentCollection.add( this.input );
		contentCollection.add( this.label, 0 );
	}

	get value() {
		return this.input.value;
	}

	_createInput() {
		const model = new Model();

		model.bind( 'value', 'label' ).to( this.model );

		return new InputText( model, new InputTextView( this.locale ) );
	}

	_createLabel() {
		const model = new Model();

		model.bind( 'for' ).to( this.input.view.model, 'uid' );
		model.bind( 'text' ).to( this.model, 'label' );

		return new InputLabel( model, new InputLabelView( this.locale ) );
	}
}
