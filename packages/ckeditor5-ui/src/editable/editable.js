/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../controller.js';
import Model from '../model.js';
import utils from '../../utils/utils.js';
import ObservableMixin from '../../utils/observablemixin.js';

/**
 * @memberOf ui.editable
 * @extends ui.Controller
 * @mixes utils.ObservaleMixin
 */
export default class Editable extends Controller {
	/**
	 * Creates a new instance of the Editable class.
	 *
	 * @param editor
	 */
	constructor( editor, editableModel ) {
		super();

		this.editor = editor;
		this._editableModel = editableModel;
	}

	/**
	 * The model for the editable view.
	 *
	 * @readonly
	 * @type {ui.Model}
	 */
	get viewModel() {
		if ( this._viewModel ) {
			return this._viewModel;
		}

		this._viewModel = new Model();

		this._viewModel.bind( 'isEditable', 'isFocused' ).to( this._editableModel );

		return this._viewModel;
	}

	/**
	 * Temporary implementation (waiting for integration with the data model).
	 *
	 * @param {String} data HTML to be loaded.
	 */
	setData( data ) {
		this.view.editableElement.innerHTML = data;
	}

	/**
	 * Temporary implementation (waiting for integration with the data model).
	 *
	 * @returns {String} HTML string.
	 */
	getData() {
		return this.view.editableElement.innerHTML;
	}
}

utils.mix( Editable, ObservableMixin );

/**
 * The editable model interface.
 *
 * @memberOf ui.editable
 * @interface EditableModel
 */

/**
 * Whether the editable has focus.
 *
 * @readonly
 * @member {Boolean} ui.editable.EditableModel#isFocused
 */

/**
 * Whether the editable is not in read-only mode.
 *
 * @readonly
 * @member {Boolean} ui.editable.EditableModel#isEditable
 */
