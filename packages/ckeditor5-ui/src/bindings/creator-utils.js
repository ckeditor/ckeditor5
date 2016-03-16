/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

export function createEditableUI( editor, editable, EditableUI, EditableUIView ) {
	const domElement = editable.domElement;
	const editableUI = new EditableUI( editor, editable );
	// TODO InlineEditable must be defined in this package so we can define that domElement is its 3rd arg.
	const editableUIView = new EditableUIView( editableUI.viewModel, editor.locale, domElement );

	editableUI.view = editableUIView;

	// If editable.domElement is set then the editable.bindTo() must've been already called.
	if ( !domElement ) {
		editable.listenTo( editableUI, 'ready', () => editable.bindTo( editableUIView.editableElement ) );
	}

	return editableUI;
}

export function createEditorUI( editor, EditorUI, EditorUIView ) {
	const editorUI = new EditorUI( editor );
	const editorUIView = new EditorUIView( editorUI.viewModel, editor.locale );

	editorUI.view = editorUIView;

	return editorUI;
}
