/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-balloon/ballooneditorui
 */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';

/**
 * The balloon editor UI class.
 *
 * @implements module:core/editor/editorui~EditorUI
 */
export default class BalloonEditorUI {
	/**
	 * Creates an instance of the balloon editor UI class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:ui/editorui/editoruiview~EditorUIView} view The view of the UI.
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
	}

	/**
	 * Initializes the UI.
	 */
	init() {
		const editor = this.editor;
		const view = this.view;
		const contextualToolbar = editor.plugins.get( 'ContextualToolbar' );

		view.render();

		// Setup the editable.
		const editingRoot = editor.editing.createRoot( view.editableElement );
		view.editable.bind( 'isReadOnly' ).to( editingRoot );

		// Bind to focusTracker instead of editor.editing.view because otherwise
		// focused editable styles disappear when view#toolbar is focused.
		view.editable.bind( 'isFocused' ).to( this.focusTracker );
		view.editable.name = editingRoot.rootName;

		this.focusTracker.add( view.editableElement );

		enableToolbarKeyboardFocus( {
			origin: editor.editing.view,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar: contextualToolbar.toolbarView,
			beforeFocus() {
				contextualToolbar.show();
			},
			afterBlur() {
				contextualToolbar.hide();
			}
		} );
	}

	/**
	 * Destroys the UI.
	 */
	destroy() {
		this.view.destroy();
	}
}
