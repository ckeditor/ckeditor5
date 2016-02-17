/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Creator from '/ckeditor5/core/creator.js';
import View from '/ckeditor5/core/ui/view.js';
import BoxlessEditorUI from '/tests/core/_utils/ui/boxlesseditorui/boxlesseditorui.js';
import InlineEditable from '/tests/core/_utils/ui/editable/inline/inlineeditable.js';
import InlineEditableView from '/tests/core/_utils/ui/editable/inline/inlineeditableview.js';

export default class InlineCreator extends Creator {
	constructor( editor ) {
		super( editor );

		editor.ui = this._createEditorUI();
	}

	create() {
		this._setupEditable();

		return super.create()
			.then( () => this.loadDataFromEditorElement() );
	}

	destroy() {
		this.updateEditorElement();

		return super.destroy();
	}

	_setupEditable() {
		this.editor.editable = this._createEditable();

		this.editor.ui.add( 'editable', this.editor.editable );
	}

	_createEditable() {
		const editable = new InlineEditable( this.editor );
		const editableView = new InlineEditableView( editable.viewModel, this.editor.element );

		editable.view = editableView;

		return editable;
	}

	_createEditorUI() {
		const editorUI = new BoxlessEditorUI( this.editor );

		editorUI.view = new View( editorUI.viewModel );

		return editorUI;
	}
}
