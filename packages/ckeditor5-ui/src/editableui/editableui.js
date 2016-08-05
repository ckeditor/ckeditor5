/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

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
	 * @param {engine.view.RootEditableElement} editable The editable element (in the engine).
	 * Also the {@link ui.editableUI.EditableUIModel} for editable UI instance.
	 * @param {ui.View} [view] An instance of EditableUIView.
	 * @param {core.editor.Editor} [editor] The editor instance.
	 */
	constructor( editable, view, editor ) {
		super( editable, view );

		/**
		 * The editor instance.
		 *
		 * @readonly
		 * @member {core.editor.Editor} ui.editableUI.EditableUI#editor
		 */
		this.editor = editor;

		view.model.bind( 'isReadOnly', 'isFocused' ).to( editable );
		view.model.set( 'name', editable.rootName );
	}
}

/**
 * The editable UI {@link ui.Model} interface.
 *
 * @interface ui.editableUI.EditableUIModel
 */

/**
 * Controls whether the editable is writable or not.
 *
 * @observable
 * @member {Boolean} ui.editableUI.EditableUIModel#isReadOnly
 */

/**
 * Controls whether the editable is focused, i.e. the user is typing in it.
 *
 * @observable
 * @member {Boolean} ui.editableUI.EditableUIModel#isFocused
 */

/**
 * The name of the editable UI.
 *
 * @observable
 * @member {String} ui.editableUI.EditableUIModel#name
 */
