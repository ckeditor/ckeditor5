/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../controller.js';
import Model from '../model.js';

/**
 * @memberOf ui.editableUI
 * @extends ui.Controller
 */
export default class EditableUI extends Controller {
	/**
	 * Creates a new instance of the Editable class.
	 *
	 * @param {ckeditor5.Editor} editor The editor instance.
	 * @param {utils.Observable} editableModel The model for the editable.
	 */
	constructor( editor, editableModel ) {
		super();

		/**
		 * The editor instance.
		 *
		 * @readonly
		 * @member {ckeditor5.Editor} ui.editableUI.EditableUI#editor
		 */
		this.editor = editor;

		/**
		 * The model for the view.
		 *
		 * @readonly
		 * @member {ui.Model} ui.editableUI.EditableUI#viewModel
		 */
		this.viewModel = new Model();
		this.viewModel.bind( 'isEditable', 'isFocused' ).to( editableModel );
	}
}
