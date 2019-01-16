/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-inline/inlineeditorui
 */

import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';
import normalizeToolbarConfig from '@ckeditor/ckeditor5-ui/src/toolbar/normalizetoolbarconfig';
import { attachPlaceholder, getPlaceholderElement } from '@ckeditor/ckeditor5-engine/src/view/placeholder';

/**
 * The inline editor UI class.
 *
 * @extends module:core/editor/editorui~EditorUI
 */
export default class InlineEditorUI extends EditorUI {
	/**
	 * @inheritDoc
	 */
	constructor( editor, view ) {
		super( editor, view );

		/**
		 * A normalized `config.toolbar` object.
		 *
		 * @type {Object}
		 * @private
		 */
		this._toolbarConfig = normalizeToolbarConfig( editor.config.get( 'toolbar' ) );
	}

	/**
	 * Initializes the UI.
	 */
	init() {
		const editor = this.editor;
		const view = this.view;
		const editingView = editor.editing.view;

		// Bind to focusTracker instead of editor.editing.view because otherwise
		// focused editable styles disappear when view#toolbar is focused.
		view.editable.bind( 'isFocused' ).to( this.focusTracker );

		view.render();

		editingView.attachDomRoot( view.editableElement );

		const editingRoot = editingView.document.getRoot();

		view.editable.name = editingRoot.rootName;

		editor.on( 'dataReady', () => {
			view.editable.enableDomRootActions();

			attachPlaceholder( editingView, getPlaceholderElement( editingRoot ), 'Type some text...' );
		} );

		// Set–up the view#panel.
		view.panel.bind( 'isVisible' ).to( this.focusTracker, 'isFocused' );

		if ( this._toolbarConfig.viewportTopOffset ) {
			view.viewportTopOffset = this._toolbarConfig.viewportTopOffset;
		}

		// https://github.com/ckeditor/ckeditor5-editor-inline/issues/4
		view.listenTo( editor.ui, 'update', () => {
			// Don't pin if the panel is not already visible. It prevents the panel
			// showing up when there's no focus in the UI.
			if ( view.panel.isVisible ) {
				view.panel.pin( {
					target: view.editableElement,
					positions: view.panelPositions
				} );
			}
		} );

		this.focusTracker.add( view.editableElement );

		view.toolbar.fillFromConfig( this._toolbarConfig.items, this.componentFactory );

		enableToolbarKeyboardFocus( {
			origin: editingView,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar: view.toolbar
		} );
	}

	destroy() {
		this.view.editable.disableDomRootActions();
		this.editor.editing.view.detachDomRoots();

		super.destroy();
	}
}
