/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import StandardCreator from '/ckeditor5/creator/standardcreator.js';

import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';
import Editable from '/ckeditor5/editable.js';

import { createEditableUI, createEditorUI } from '/ckeditor5/ui/creator-utils.js';

import BoxedEditorUI from '/ckeditor5/ui/editorui/boxed/boxededitorui.js';
import BoxedEditorUIView from '/ckeditor5/ui/editorui/boxed/boxededitoruiview.js';

import EditableUI from '/ckeditor5/ui/editableui/editableui.js';
import InlineEditableUIView from '/ckeditor5/ui/editableui/inline/inlineeditableuiview.js';

import Model from '/ckeditor5/ui/model.js';
import StickyToolbar from '/ckeditor5/ui/bindings/stickytoolbar.js';
import StickyToolbarView from '/ckeditor5/ui/stickytoolbar/stickytoolbarview.js';

import { imitateFeatures, imitateDestroyFeatures } from './utils/imitatefeatures.js';

/**
 * Classic editor creator using inline editable and sticky toolbar, all
 * enclosed in a boxed UI.
 *
 * @memberOf creator-classic
 * @extends ckeditor5.creator.StandardCreator
 */
export default class ClassicCreator extends StandardCreator {
	/**
	 * Creates an instance of the classic creator.
	 *
	 * @param {ckeditor5.Editor} The editor instance.
	 */
	constructor( editor ) {
		super( editor, new HtmlDataProcessor() );

		const editableName = editor.firstElementName;
		editor.editables.add( new Editable( editor, editableName ) );
		editor.document.createRoot( editableName );

		// UI.
		createEditorUI( editor, BoxedEditorUI, BoxedEditorUIView );

		// Data controller mock.
		this._mockDataController();
	}

	/**
	 * Creates editor UI and loads startup data into the editor.
	 *
	 * @returns {Promise}
	 */
	create() {
		const editor = this.editor;
		const editable = editor.editables.get( 0 );

		// Features mock.
		imitateFeatures( editor );

		// UI.
		this._replaceElement( editor.firstElement, editor.ui.view.element );
		this._createToolbar();
		editor.ui.add( 'main', createEditableUI( editor, editable, EditableUI, InlineEditableUIView ) );

		// Init.
		return super.create()
			.then( () => editor.ui.init() )
			// We'll be able to do that much earlier once the loading will be done to the document model,
			// rather than straight to the editable.
			.then( () => this.loadDataFromEditorElement() );
	}

	/**
	 * Updates the original editor element with data and destroys
	 * the UI.
	 *
	 * @returns {Promise}
	 */
	destroy() {
		imitateDestroyFeatures();

		this.updateEditorElement();

		super.destroy();

		return this.editor.ui.destroy();
	}

	/**
	 * Creates editor sticky toolbar and fills it with children using the configuration.
	 *
	 * @protected
	 */
	_createToolbar() {
		const editor = this.editor;

		// Note: StickyToolbar and StickyToolbarView share the same model. It may change in the future.
		const toolbarModel = new Model();
		const toolbarView = new StickyToolbarView( toolbarModel, editor.locale );
		const toolbar = new StickyToolbar( toolbarModel, toolbarView, editor );

		toolbar.addButtons( editor.config.toolbar );

		this.editor.ui.add( 'top', toolbar );
	}

	/**
	 * TEMP: Mocks basic data IO for the purposes of the creator.
	 * TODO: To be replaced with actual engine bindings.
	 *
	 * @protected
	 */
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
