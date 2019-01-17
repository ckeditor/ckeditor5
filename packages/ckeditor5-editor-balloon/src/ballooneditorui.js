/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-balloon/ballooneditorui
 */

import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';
import { attachPlaceholder, getPlaceholderElement } from '@ckeditor/ckeditor5-engine/src/view/placeholder';

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
		const editingView = editor.editing.view;

		view.render();

		editingView.attachDomRoot( view.editableElement );

		// Setup the editable.
		const editingRoot = editingView.document.getRoot();

		view.editable.name = editingRoot.rootName;

		editor.on( 'dataReady', () => {
			view.editable.enableDomRootActions();

			attachPlaceholder( editingView, getPlaceholderElement( editingRoot ), 'Type some text...' );
		} );

		view.editable.bind( 'isReadOnly' ).to( editingRoot );

		// Bind to focusTracker instead of editingView because otherwise
		// focused editable styles disappear when view#toolbar is focused.
		view.editable.bind( 'isFocused' ).to( this.focusTracker );

		this.focusTracker.add( view.editableElement );

		enableToolbarKeyboardFocus( {
			origin: editingView,
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
