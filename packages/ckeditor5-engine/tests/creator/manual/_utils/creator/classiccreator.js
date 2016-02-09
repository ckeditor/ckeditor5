/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Creator from '/ckeditor5/core/creator.js';
import BoxedEditorUI from '/tests/core/_utils/ui/boxededitorui/boxededitorui.js';
import BoxedEditorUIView from '/tests/core/_utils/ui/boxededitorui/boxededitoruiview.js';
import FramedEditable from '/tests/core/_utils/ui/editable/framed/framededitable.js';
import FramedEditableView from '/tests/core/_utils/ui/editable/framed/framededitableview.js';

export default class ClassicCreator extends Creator {
	constructor( editor ) {
		super( editor );

		editor.ui = this._createEditorUI();
	}

	create() {
		this._replaceElement();
		this._setupEditable();

		return super.create()
			.then( () => this.loadDataFromEditorElement() );
	}

	destroy() {
		this.updateEditorElement();

		return super.destroy();
	}

	_setupEditable() {
		const editable = this._createEditable();

		this.editor.editable = editable;
		this.editor.ui.collections.get( 'main' ).add( editable );
	}

	_createEditable() {
		const editable = new FramedEditable( this.editor );
		const editableView = new FramedEditableView( editable.viewModel );

		editable.view = editableView;

		return editable;
	}

	_createEditorUI() {
		const editorUI = new BoxedEditorUI( this.editor );
		const editorUIView = new BoxedEditorUIView( editorUI.viewModel );

		editorUI.view = editorUIView;

		return editorUI;
	}
}
