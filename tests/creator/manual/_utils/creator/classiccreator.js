/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Creator from '/ckeditor5/creator/creator.js';

import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';
import Editable from '/ckeditor5/editable.js';

import { createEditableUI, createEditorUI } from '/ckeditor5/ui/bindings/creator-utils.js';

import BoxedEditorUI from '/tests/ckeditor5/_utils/ui/boxededitorui/boxededitorui.js';
import BoxedEditorUIView from '/tests/ckeditor5/_utils/ui/boxededitorui/boxededitoruiview.js';
import FramedEditableUI from '/tests/ckeditor5/_utils/ui/editable/framed/framededitable.js';
import FramedEditableUIView from '/tests/ckeditor5/_utils/ui/editable/framed/framededitableview.js';
import Model from '/ckeditor5/ui/model.js';
import Toolbar from '/ckeditor5/ui/bindings/toolbar.js';
import ToolbarView from '/ckeditor5/ui/toolbar/toolbarview.js';

import { imitateFeatures, imitateDestroyFeatures } from '../imitatefeatures.js';

export default class ClassicCreator extends Creator {
	constructor( editor ) {
		super( editor, new HtmlDataProcessor() );

		const editableName = editor.firstElementName;
		editor.editables.add( new Editable( editor, editableName ) );
		editor.document.createRoot( editableName, '$root' );

		// UI.
		createEditorUI( editor, BoxedEditorUI, BoxedEditorUIView );

		// Data controller mock.
		this._mockDataController();
	}

	create() {
		const editor = this.editor;
		const editable = editor.editables.get( 0 );

		// Features mock.
		imitateFeatures( editor );

		// UI.
		this._replaceElement( editor.firstElement, editor.ui.view.element );
		this._createToolbar();
		editor.ui.add( 'main', createEditableUI( editor, editable, FramedEditableUI, FramedEditableUIView ) );

		// Init.
		return super.create()
			.then( () => editor.ui.init() )
			// We'll be able to do that much earlier once the loading will be done to the document model,
			// rather than straight to the editable.
			.then( () => this.loadDataFromEditorElement() );
	}

	destroy() {
		imitateDestroyFeatures();

		this.updateEditorElement();

		super.destroy();

		return this.editor.ui.destroy();
	}

	_createToolbar() {
		const editor = this.editor;
		const toolbarModel = new Model();
		const toolbar = new Toolbar( toolbarModel, new ToolbarView( toolbarModel, editor.locale ), editor );

		toolbar.addButtons( editor.config.toolbar );

		this.editor.ui.add( 'top', toolbar );
	}

	_mockDataController() {
		const editor = this.editor;

		editor.data.get = ( rootName ) => {
			return editor.editables.get( rootName ).domElement.innerHTML + `<p>getData( '${ rootName }' )</p>`;
		};

		this.editor.data.set = ( rootName, data ) => {
			editor.editables.get( rootName ).domElement.innerHTML = data + `<p>setData( '${ rootName }' )</p>`;
		};
	}
}
