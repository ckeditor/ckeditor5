/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-balloon/ballooneditorui
 */

import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';

/**
 * The balloon editor UI class.
 *
 * @extends module:core/editor/editorui~EditorUI
 */
export default class BalloonEditorUI extends EditorUI {
	/**
	 * Creates an instance of the balloon editor UI class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:ui/editorui/editoruiview~EditorUIView} view The view of the UI.
	 */
	constructor( editor, view ) {
		super( editor );

		/**
		 * The main (top–most) view of the editor UI.
		 *
		 * @readonly
		 * @member {module:ui/editorui/editoruiview~EditorUIView} #view
		 */
		this.view = view;
	}

	/**
	 * @inheritDoc
	 */
	get element() {
		return this.view.editable.element;
	}

	/**
	 * Initializes the UI.
	 */
	init() {
		const editor = this.editor;
		const view = this.view;
		const balloonToolbar = editor.plugins.get( 'BalloonToolbar' );

		view.render();

		// Setup the editable.
		const editingRoot = editor.editing.view.document.getRoot();
		view.editable.bind( 'isReadOnly' ).to( editingRoot );

		// Bind to focusTracker instead of editor.editing.view because otherwise
		// focused editable styles disappear when view#toolbar is focused.
		view.editable.bind( 'isFocused' ).to( this.focusTracker );
		editor.editing.view.attachDomRoot( view.editable.element );
		view.editable.name = editingRoot.rootName;

		this._editableElements.set( view.editable.name, view.editable.element );

		this.focusTracker.add( view.editable.element );

		enableToolbarKeyboardFocus( {
			origin: editor.editing.view,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar: balloonToolbar.toolbarView,
			beforeFocus() {
				balloonToolbar.show();
			},
			afterBlur() {
				balloonToolbar.hide();
			}
		} );

		this.fire( 'ready' );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this.view.destroy();

		super.destroy();
	}
}
