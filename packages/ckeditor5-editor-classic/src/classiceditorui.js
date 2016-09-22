/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BoxedEditorUI from '../ui/editorui/boxed/boxededitorui.js';

import EditableUI from '../ui/editableui/editableui.js';
import InlineEditableUIView from '../ui/editableui/inline/inlineeditableuiview.js';

import Model from '../ui/model.js';
import StickyToolbar from '../ui/bindings/stickytoolbar.js';
import StickyToolbarView from '../ui/toolbar/sticky/stickytoolbarview.js';

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
	 * @param {core.editor.Editor} editor
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
	 * @inheritDoc
	 */
	init() {
		this.toolbar.model.set( 'limiterElement', this.editor.ui.view.element );

		return super.init();
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
	 * Creates the sticky toolbar of the editor.
	 *
	 * @protected
	 * @returns {ui.toolbar.Toolbar}
	 */
	_createToolbar() {
		const editor = this.editor;
		const model = new Model( {
			config: this.editor.config.get( 'toolbar' )
		} );

		model.bind( 'isActive' ).to( editor.focusManager, 'isFocused' );

		const toolbar = new StickyToolbar( model, new StickyToolbarView( editor.locale ), editor );
		this.add( 'top', toolbar );

		return toolbar;
	}

	/**
	 * Creates the main editable of the editor and registers it in {@link core.editor.Editor#focusManager}.
	 *
	 * @protected
	 * @returns {ui.editableUI.EditableUI}
	 */
	_createEditableUI() {
		const editor = this.editor;

		const editable = editor.editing.view.getRoot();
		const editableUI = new EditableUI( editable, new InlineEditableUIView( editor.locale ), editor );

		this.add( 'main', editableUI );

		// @TODO: Do it automatically ckeditor5-core#23
		editor.focusManager.add( editableUI.view.element );

		return editableUI;
	}
}
