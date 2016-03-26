/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Creator from '/ckeditor5/creator/creator.js';

import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';
import Editable from '/ckeditor5/editable.js';

import { createEditableUI, createEditorUI } from '/ckeditor5/ui/creator-utils.js';

import EditorUIView from '/ckeditor5/ui/editorui/editoruiview.js';
import BoxlessEditorUI from '/tests/ckeditor5/_utils/ui/boxlesseditorui/boxlesseditorui.js';
import EditableUI from '/ckeditor5/ui/editableui/editableui.js';
import InlineEditableUIView from '/tests/ckeditor5/_utils/ui/editableui/inline/inlineeditableuiview.js';
import Model from '/ckeditor5/ui/model.js';
import FloatingToolbar from '/tests/ckeditor5/_utils/ui/floatingtoolbar/floatingtoolbar.js';
import FloatingToolbarView from '/tests/ckeditor5/_utils/ui/floatingtoolbar/floatingtoolbarview.js';
import { imitateFeatures, imitateDestroyFeatures } from '../imitatefeatures.js';

export default class InlineCreator extends Creator {
	constructor( editor ) {
		super( editor, new HtmlDataProcessor() );

		this._createEditable();

		createEditorUI( editor, BoxlessEditorUI, EditorUIView );

		// Data controller mock.
		this._mockDataController();
	}

	create() {
		const editor = this.editor;
		const editable = editor.editables.get( 0 );

		// Features mock.
		imitateFeatures( editor );

		// UI.
		this._createToolbars();
		editor.ui.add( 'editable', createEditableUI( editor, editable, EditableUI, InlineEditableUIView ) );

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

	_createEditable() {
		const editor = this.editor;
		const editorElement = editor.firstElement;
		const editableName = editor.firstElementName;
		const editable = new Editable( editor, editableName );

		editor.editables.add( editable );
		editable.bindTo( editorElement );
		editor.document.createRoot( editableName, '$root' );
	}

	_createToolbars() {
		const editableName = this.editor.firstElementName;
		const locale = this.editor.locale;

		const toolbar1Model = new Model( null, { editableName } );
		const toolbar2Model = new Model( null, { editableName } );

		const toolbar1 = new FloatingToolbar( toolbar1Model, new FloatingToolbarView( toolbar1Model, locale ), this.editor );
		const toolbar2 = new FloatingToolbar( toolbar2Model, new FloatingToolbarView( toolbar2Model, locale ), this.editor );

		toolbar1.addButtons( this.editor.config.toolbar );
		toolbar2.addButtons( this.editor.config.toolbar.reverse() );

		this.editor.ui.add( 'body', toolbar1 );
		this.editor.ui.add( 'body', toolbar2 );
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
