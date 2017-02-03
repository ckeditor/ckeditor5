/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-inline/inlineeditorui
 */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import {
	expandToolbarConfig,
	enableToolbarKeyboardFocus
} from '@ckeditor/ckeditor5-ui/src/toolbar/utils';

/**
 * The inline editor UI class.
 *
 * @implements module:core/editor/editorui~EditorUI
 */
export default class InlineEditorUI {
	/**
	 * Creates an instance of the editor UI class.
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

		// Set–up the toolbar.
		view.toolbar.bind( 'isActive' ).to( this.focusTracker, 'isFocused' );
		view.toolbar.targetElement = view.editableElement;

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
	 *
	 * @returns {Promise} A Promise resolved when the initialization process is finished.
	 */
	init() {
		const editor = this.editor;

		return this.view.init()
			.then( () => {
				return expandToolbarConfig(
					editor.config.get( 'toolbar' ),
					this.view.toolbar.items,
					this.componentFactory
				);
			} )
			.then( () => {
				enableToolbarKeyboardFocus( {
					origin: editor.editing.view,
					originFocusTracker: this.focusTracker,
					originKeystrokeHandler: editor.keystrokes,
					toolbar: this.view.toolbar
				} );
			} );
	}

	/**
	 * Destroys the UI.
	 *
	 * @returns {Promise} A Promise resolved when the destruction process is finished.
	 */
	destroy() {
		return this.view.destroy();
	}
}
