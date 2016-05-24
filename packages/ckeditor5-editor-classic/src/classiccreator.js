/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import StandardCreator from '../creator/standardcreator.js';

import HtmlDataProcessor from '../engine/dataprocessor/htmldataprocessor.js';
import Editable from '../editable.js';

import { createEditableUI, createEditorUI } from '../ui/creator-utils.js';

import BoxedEditorUI from '../ui/editorui/boxed/boxededitorui.js';
import BoxedEditorUIView from '../ui/editorui/boxed/boxededitoruiview.js';

import EditableUI from '../ui/editableui/editableui.js';
import InlineEditableUIView from '../ui/editableui/inline/inlineeditableuiview.js';

import Model from '../ui/model.js';
import StickyToolbar from '../ui/bindings/stickytoolbar.js';
import StickyToolbarView from '../ui/stickytoolbar/stickytoolbarview.js';

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
}
