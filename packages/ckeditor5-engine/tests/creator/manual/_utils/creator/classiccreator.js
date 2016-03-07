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
import Model from '/ckeditor5/core/ui/model.js';
import Toolbar from '/ckeditor5/core/ui/bindings/toolbar.js';
import ToolbarView from '/ckeditor5/ui/toolbar/toolbarview.js';
import { imitateFeatures, imitateDestroyFeatures } from '../imitatefeatures.js';

export default class ClassicCreator extends Creator {
	constructor( editor ) {
		super( editor );

		editor.ui = this._createEditorUI();
	}

	create() {
		imitateFeatures( this.editor );

		this._replaceElement();
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
		const editable = this._createEditable();

		this.editor.editable = editable;
		this.editor.ui.add( 'main', editable );
	}

	_setupToolbar() {
		const toolbarModel = new Model();
		const toolbar = new Toolbar( toolbarModel, new ToolbarView( toolbarModel, this.editor.locale ), this.editor );

		toolbar.addButtons( this.editor.config.toolbar );

		this.editor.ui.add( 'top', toolbar );
	}

	_createEditable() {
		const editable = new FramedEditable( this.editor );
		const editableView = new FramedEditableView( editable.viewModel, this.editor.locale );

		editable.view = editableView;

		return editable;
	}

	_createEditorUI() {
		const editorUI = new BoxedEditorUI( this.editor );
		const editorUIView = new BoxedEditorUIView( editorUI.viewModel, this.editor.locale );

		editorUI.view = editorUIView;

		return editorUI;
	}
}
