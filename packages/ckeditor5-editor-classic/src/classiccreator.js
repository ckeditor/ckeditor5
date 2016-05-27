/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import StandardCreator from '../creator/standardcreator.js';

import { createEditableUI, createEditorUI } from '../ui/creator-utils.js';

import BoxedEditorUI from '../ui/editorui/boxed/boxededitorui.js';
import BoxedEditorUIView from '../ui/editorui/boxed/boxededitoruiview.js';

import EditableUI from '../ui/editableui/editableui.js';
import InlineEditableUIView from '../ui/editableui/inline/inlineeditableuiview.js';

import Model from '../ui/model.js';
import StickyToolbar from '../ui/bindings/stickytoolbar.js';
import StickyToolbarView from '../ui/stickytoolbar/stickytoolbarview.js';

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
		super( editor );

		editor.document.createRoot();
		editor.editing.createRoot( 'div' );

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
		const editorElement = editor.firstElement;

		// UI.
		this._replaceElement( editorElement, editor.ui.view.element );
		this._createToolbar();

		const editableUI = createEditableUI( editor, EditableUI, InlineEditableUIView );

		editor.ui.add( 'main', editableUI );

		// Init.
		return super.create()
			.then( () => editor.ui.init() )
			.then( () => editor.editing.view.attachDomRoot( editableUI.view.element ) )
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
