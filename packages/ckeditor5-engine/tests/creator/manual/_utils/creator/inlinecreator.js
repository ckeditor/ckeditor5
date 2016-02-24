/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Creator from '/ckeditor5/core/creator.js';
import EditorUIView from '/ckeditor5/core/editorui/editoruiview.js';
import BoxlessEditorUI from '/tests/core/_utils/ui/boxlesseditorui/boxlesseditorui.js';
import InlineEditable from '/tests/core/_utils/ui/editable/inline/inlineeditable.js';
import InlineEditableView from '/tests/core/_utils/ui/editable/inline/inlineeditableview.js';
import Model from '/ckeditor5/core/ui/model.js';
import FloatingToolbar from '/tests/core/_utils/ui/floatingtoolbar/floatingtoolbar.js';
import FloatingToolbarView from '/tests/core/_utils/ui/floatingtoolbar/floatingtoolbarview.js';
import { imitateFeatures, imitateDestroyFeatures } from '../imitatefeatures.js';

export default class InlineCreator extends Creator {
	constructor( editor ) {
		super( editor );

		editor.ui = this._createEditorUI();
	}

	create() {
		imitateFeatures( this.editor );

		this._setupEditable();
		this._setupToolbar();

		return super.create()
			.then( () => this.loadDataFromEditorElement() );
	}

	destroy() {
		imitateDestroyFeatures();

		this.updateEditorElement();

		return super.destroy();
	}

	_setupEditable() {
		this.editor.editable = this._createEditable();

		this.editor.ui.add( 'editable', this.editor.editable );
	}

	_setupToolbar() {
		const toolbar1Model = new Model();
		const toolbar2Model = new Model();

		const toolbar1 = new FloatingToolbar( this.editor, toolbar1Model, new FloatingToolbarView( toolbar1Model ) );
		const toolbar2 = new FloatingToolbar( this.editor, toolbar2Model, new FloatingToolbarView( toolbar2Model ) );

		toolbar1.addButtons( this.editor.config.toolbar );
		toolbar2.addButtons( this.editor.config.toolbar.reverse() );

		this.editor.ui.add( 'body', toolbar1 );
		this.editor.ui.add( 'body', toolbar2 );
	}

	_createEditable() {
		const editable = new InlineEditable( this.editor );
		const editableView = new InlineEditableView( editable.viewModel, this.editor.element );

		editable.view = editableView;

		return editable;
	}

	_createEditorUI() {
		const editorUI = new BoxlessEditorUI( this.editor );

		editorUI.view = new EditorUIView( editorUI.viewModel );

		return editorUI;
	}
}
