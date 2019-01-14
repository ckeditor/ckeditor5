/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-classic/classiceditorui
 */

import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';
import normalizeToolbarConfig from '@ckeditor/ckeditor5-ui/src/toolbar/normalizetoolbarconfig';

/**
 * The classic editor UI class.
 *
 * @extends module:core/editor/editorui~EditorUI
 */
export default class ClassicEditorUI extends EditorUI {
	/**
	 * Creates an instance of the classic editor UI class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:ui/editorui/editoruiview~EditorUIView} view The view of the UI.
	 */
	constructor( editor, view ) {
		super( editor );

		/**
		 * The main (top–most) view of the editor UI.
		 *
		 * @private
		 * @member {module:ui/editorui/editoruiview~EditorUIView} #_view
		 */
		this._view = view;

		/**
		 * A normalized `config.toolbar` object.
		 *
		 * @private
		 * @member {Object}
		 */
		this._toolbarConfig = normalizeToolbarConfig( editor.config.get( 'toolbar' ) );
	}

	/**
	 * The main (top–most) view of the editor UI.
	 *
	 * @readonly
	 * @member {module:ui/editorui/editoruiview~EditorUIView} #view
	 */
	get view() {
		return this._view;
	}

	/**
	 * @inheritDoc
	 */
	get element() {
		return this.view.element;
	}

	/**
	 * @inheritDoc
	 */
	getEditableElement( rootName = 'main' ) {
		return this.view.editable.name === rootName ? this.view.editable : null;
	}

	/**
	 * Initializes the UI.
	 */
	init() {
		const editor = this.editor;
		const view = this.view;

		view.render();

		// Set–up the sticky panel with toolbar.
		view.stickyPanel.bind( 'isActive' ).to( this.focusTracker, 'isFocused' );
		view.stickyPanel.limiterElement = view.element;

		if ( this._toolbarConfig.viewportTopOffset ) {
			view.stickyPanel.viewportTopOffset = this._toolbarConfig.viewportTopOffset;
		}

		// Setup the editable.
		const editingRoot = editor.editing.view.document.getRoot();
		view.editable.bind( 'isReadOnly' ).to( editingRoot );
		view.editable.bind( 'isFocused' ).to( editor.editing.view.document );
		view.editable.name = editingRoot.rootName;

		this.focusTracker.add( view.editable.editableElement );

		view.toolbar.fillFromConfig( this._toolbarConfig.items, this.componentFactory );

		enableToolbarKeyboardFocus( {
			origin: editor.editing.view,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar: view.toolbar
		} );
	}
}
