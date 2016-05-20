/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import BoxedEditorUI from '../ui/editorui/boxed/boxededitorui.js';

import EditableUI from '../ui/editableui/editableui.js';
import InlineEditableUIView from '../ui/editableui/inline/inlineeditableuiview.js';

import Model from '../ui/model.js';
import Toolbar from '../ui/bindings/toolbar.js';
import StickyToolbarView from '../ui/stickytoolbar/stickytoolbarview.js';

/**
 * Classic editor UI. Uses inline editable and sticky toolbar, all
 * enclosed in a boxed UI.
 *
 * @memberOf editor-classic
 * @extends ui.editorUI.boxed.BoxedEditorUI
 */
export default class ClassicEditorUI extends BoxedEditorUI {
	/**
	 * Creates an instance of the classic editor UI.
	 *
	 * @param {ckeditor5.editor.Editor} editor
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Toolbar controller.
		 *
		 * @readonly
		 * @member {ui.toolbar.Toolbar} editor-classic.ClassicEditorUI#toolbar
		 */
		this.toolbar = this._createToolbar();

		/**
		 * Editable UI controller.
		 *
		 * @readonly
		 * @member {ui.editableUI.EditableUI} editor-classic.ClassicEditorUI#editable
		 */
		this.editable = this._createEditableUI();
	}

	/**
	 * The editing host.
	 *
	 * @readonly
	 * @type {HTMLElement}
	 */
	get editableElement() {
		return this.editable.view.element;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const toolbar = this.editor.config.get( 'toolbar' );

		if ( toolbar ) {
			this.toolbar.addButtons( toolbar );
		}

		return super.init();
	}

	/**
	 * Creates editor sticky toolbar.
	 *
	 * @protected
	 * @returns {ui.toolbar.Toolbar}
	 */
	_createToolbar() {
		const editor = this.editor;

		const toolbarModel = new Model();
		const toolbarView = new StickyToolbarView( toolbarModel, editor.locale );
		const toolbar = new Toolbar( toolbarModel, toolbarView, editor );

		toolbarModel.bind( 'isActive' ).to( editor.editing.view.getRoot(), 'isFocused' );

		this.add( 'top', toolbar );

		return toolbar;
	}

	/**
	 * Creates editor main editable.
	 *
	 * @protected
	 * @returns {ui.editableUI.EditableUI}
	 */
	_createEditableUI() {
		const editor = this.editor;

		const editable = editor.editing.view.getRoot();
		const editableUI = new EditableUI( editor, editable );
		const editableUIView = new InlineEditableUIView( editableUI.viewModel, editor.locale );

		editableUI.view = editableUIView;

		this.add( 'main', editableUI );

		return editableUI;
	}
}
