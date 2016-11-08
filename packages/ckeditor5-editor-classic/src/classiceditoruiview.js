/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BoxedEditorUIView from '../ui/editorui/boxed/boxededitoruiview.js';
import InlineEditableUIView from '../ui/editableui/inline/inlineeditableuiview.js';
import StickyToolbarView from '../ui/toolbar/sticky/stickytoolbarview.js';

/**
 * Classic editor UI view. Uses inline editable and sticky toolbar, all
 * enclosed in a boxed UI view.
 *
 * @memberOf editor-classic
 * @extends ui.editorUI.boxed.BoxedEditorUIView
 */
export default class ClassicEditorUIView extends BoxedEditorUIView {
	/**
	 * Creates an instance of the classic editor UI.
	 *
	 * @param {core.editor.Editor} editor
	 */
	constructor( editor, locale ) {
		super( editor, locale );

		/**
		 * Toolbar view.
		 *
		 * @readonly
		 * @member {ui.toolbar.ToolbarView} editor-classic.ClassicEditorUI#toolbar
		 */
		this.toolbar = this._createToolbar();

		/**
		 * Editable UI view.
		 *
		 * @readonly
		 * @member {ui.editableUI.EditableUIView} editor-classic.ClassicEditorUI#editable
		 */
		this.editable = this._createEditableUIView( editor );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.toolbar.limiterElement = this.element;

		const toolbarConfig = this.editor.config.get( 'toolbar' );

		if ( toolbarConfig ) {
			for ( let name of toolbarConfig ) {
				this.toolbar.items.add( this.featureComponents.create( name ) );
			}
		}

		return super.init();
	}

	/**
	 * The editing host element, {@link editor-classic.ClassicEditorUI#editable}.
	 *
	 * @readonly
	 * @type {HTMLElement}
	 */
	get editableElement() {
		return this.editable.element;
	}

	/**
	 * Creates the sticky toolbar view of the editor.
	 *
	 * @protected
	 * @returns {ui.stickyToolbar.StickyToolbarView}
	 */
	_createToolbar() {
		const editor = this.editor;
		const toolbar = new StickyToolbarView( editor.locale );

		toolbar.bind( 'isActive' ).to( editor.focusTracker, 'isFocused' );
		this.top.add( toolbar );

		return toolbar;
	}

	/**
	 * Creates the main editable view of the editor and registers it
	 * in {@link core.editor.Editor#focusTracker}.
	 *
	 * @protected
	 * @returns {ui.editableUI.EditableUIView}
	 */
	_createEditableUIView() {
		const editor = this.editor;
		const editable = editor.editing.view.getRoot();
		const editableUIView = new InlineEditableUIView( editor.locale );

		editableUIView.bind( 'isReadOnly', 'isFocused' ).to( editable );
		editableUIView.name = editable.rootName;

		this.main.add( editableUIView );

		// @TODO: Do it automatically ckeditor5-core#23
		editor.focusTracker.add( editableUIView.element );

		return editableUIView;
	}
}
