/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
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
		editor.editing.view.attachDomRoot( view.editableElement );
		view.editable.name = editingRoot.rootName;

		this.focusTracker.add( view.editableElement );

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
	}
}
