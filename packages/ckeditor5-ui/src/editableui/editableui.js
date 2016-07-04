/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Controller from '../controller.js';

/**
 * The editable UI controller class. It glues the engine editable
 * {@link engine.view.RootEditableElement} with the UI.
 *
 *		// An instance of EditableUI.
 *		new EditableUI( editor, editable, new EditableUIView() );
 *
 * See {@link ui.editableUI.EditableUIView}.
 *
 * @memberOf ui.editableUI
 * @extends ui.Controller
 */
export default class EditableUI extends Controller {
	/**
	 * Creates an instance of {@link ui.editableUI.EditableUI} class.
	 *
	 * @param {ckeditor5.Editor} editor The editor instance.
	 * @param {engine.view.RootEditableElement} editable The editable element (in the engine).
	 * @param {ui.View} [view] An instance of EditableUIView.
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
