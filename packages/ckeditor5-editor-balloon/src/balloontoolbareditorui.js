/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-balloon-toolbar/balloontoolbareditorui
 */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';

/**
 * The balloon toolbar editor UI class.
 *
 * @implements module:core/editor/editorui~EditorUI
 */
export default class BalloonToolbarEditorUI {
	/**
	 * Creates an instance of the balloon toolbar editor UI class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:ui/editorui/editoruiview~EditorUIView} view View of the ui.
	 */
	constructor( editor, view ) {
		/**
		 * @inheritDoc
		 */
		this.editor = editor;

		/**
		 * @inheritDoc
		 */
		this.view = view;

		/**
		 * @inheritDoc
		 */
		this.componentFactory = new ComponentFactory( editor );

		/**
		 * @inheritDoc
		 */
		this.focusTracker = new FocusTracker();

		// Setup the editable.
		const editingRoot = editor.editing.createRoot( view.editableElement );
		view.editable.bind( 'isReadOnly' ).to( editingRoot );

		// Bind to focusTracker instead of editor.editing.view because otherwise
		// focused editable styles disappear when view#toolbar is focused.
		view.editable.bind( 'isFocused' ).to( this.focusTracker );
		view.editable.name = editingRoot.rootName;

		this.focusTracker.add( view.editableElement );
	}

	/**
	 * Initializes the UI.
	 */
	init() {
		const editor = this.editor;
		const contextualToolbar = editor.plugins.get( 'ui/contextualtoolbar' );

		this.view.init();

		enableToolbarKeyboardFocus( {
			origin: editor.editing.view,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar: contextualToolbar.toolbarView
		} );
	}

	/**
	 * Destroys the UI.
	 */
	destroy() {
		this.view.destroy();
	}
}
