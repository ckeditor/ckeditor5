/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Creates and if needed (if not yet done) binds the editable UI to the {@link ckeditor5.Editable editable instance}.
 *
 * @param {ckeditor5.Editor} editor The editor instance.
 * @param {ckeditor5.Editable} editable The editable instance with which the editable UI will be bound.
 * @param {Function} EditableUI Editable UI controller constructor.
 * @param {Function} EditableUIView Editable UI view constructor.
 * @returns {ui.editableui.EditableUI} Instance of the editable UI.
 */
export function createEditableUI( editor, EditableUI, EditableUIView, rootName = 'main' ) {
	const editable = editor.editing.view.getRoot( rootName );
	const editableUI = new EditableUI( editor, editable );
	const editableUIView = new EditableUIView( editableUI.viewModel, editor.locale );

	editableUI.view = editableUIView;

	return editableUI;
}

/**
 * Creates editor UI instance.
 *
 * @param {ckeditor5.Editor} editor The editor instance.
 * @param {Function} Editor UI controller constructor.
 * @param {Function} Editor UI view constructor.
 */
export function createEditorUI( editor, EditorUI, EditorUIView ) {
	const editorUI = new EditorUI( editor );
	const editorUIView = new EditorUIView( editorUI.viewModel, editor.locale );

	editorUI.view = editorUIView;

	return editorUI;
}
