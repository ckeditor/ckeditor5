/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../controller.js';

/**
 * @memberOf ui.editableUI
 * @extends ui.Controller
 */
export default class EditableUI extends Controller {
	/**
	 * Creates a new instance of the Editable class.
	 *
	 * @param {ckeditor5.Editor} editor The editor instance.
	 * @param {engine.view.RootEditableElement} editable The editable element.
	 * @param {ui.View} [view] EditableUI View instance.
	 */
	constructor( editor, editable, view ) {
		super( editable, view );

		/**
		 * The editor instance.
		 *
		 * @readonly
		 * @member {ckeditor5.Editor} ui.editableUI.EditableUI#editor
		 */
		this.editor = editor;

		view.model.bind( 'isReadOnly', 'isFocused' ).to( editable );
		view.model.set( 'name', editable.rootName );
	}
}
