/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../ui/controller.js';
import Model from '../ui/model.js';
import utils from '../utils.js';
import ObservableMixin from '../observablemixin.js';

/**
 * Creates a new instance of the Editable class.
 *
 * @class core.editable.Editable
 * @extends core.ui.Controller
 * @mixins core.ObservableMixin
 * @param editor
 */
export default class Editable extends Controller {
	constructor( editor ) {
		super();

		this.editor = editor;

		/**
		 * Whether the editable is in read-write or read-only mode.
		 *
		 * @member core.editable.Editable#isEditable
		 * @type {Boolean}
		 */
		this.set( 'isEditable', true );

		/**
		 * Whether the editable is focused.
		 *
		 * @member core.editable.Editable#isFocused
		 * @readonly
		 * @type {Boolean}
		 */
		this.set( 'isFocused', false );
	}

	/**
	 * The model for the editable view.
	 *
	 * @readonly
	 * @type {core.ui.Model}
	 * @member core.editable.Editable#_viewModel
	 */
	get viewModel() {
		if ( this._viewModel ) {
			return this._viewModel;
		}

		const viewModel = new Model( {
			isFocused: this.isFocused
		} );
		this._viewModel = viewModel;

		viewModel.bind( 'isEditable' ).to( this );
		this.bind( 'isFocused' ).to( viewModel );

		return viewModel;
	}

	/**
	 * Temporary implementation (waiting for integration with the data model).
	 *
	 * @method core.editable.Editable#setData
	 * @param {String} data HTML to be loaded.
	 */
	setData( data ) {
		this.view.editableElement.innerHTML = data;
	}

	/**
	 * Temporary implementation (waiting for integration with the data model).
	 *
	 * @method core.editable.Editable#getData
	 * @returns {String} HTML string.
	 */
	getData() {
		return this.view.editableElement.innerHTML;
	}
}

utils.mix( Editable, ObservableMixin );
