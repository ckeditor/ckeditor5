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
import { attachPlaceholder, getPlaceholderElement } from '@ckeditor/ckeditor5-engine/src/view/placeholder';

/**
 * The classic editor UI class.
 *
 * @extends module:core/editor/editorui~EditorUI
 */
export default class ClassicEditorUI extends EditorUI {
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

		view.editable.bind( 'isFocused' ).to( this.focusTracker );
		view.render();

		// Set–up the sticky panel with toolbar.
		view.stickyPanel.bind( 'isActive' ).to( this.focusTracker, 'isFocused' );
		view.stickyPanel.limiterElement = view.element;

		if ( this._toolbarConfig.viewportTopOffset ) {
			view.stickyPanel.viewportTopOffset = this._toolbarConfig.viewportTopOffset;
		}

		// Setup the editable.
		const editingRoot = editingView.document.getRoot();
		view.editable.name = editingRoot.rootName;

		editor.on( 'dataReady', () => {
			view.editable.enableDomRootActions();

			attachPlaceholder( editingView, getPlaceholderElement( editingRoot ), 'Type some text...' );
		} );

		this.focusTracker.add( this.view.editableElement );

		this.view.toolbar.fillFromConfig( this._toolbarConfig.items, this.componentFactory );

		enableToolbarKeyboardFocus( {
			origin: editingView,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar: this.view.toolbar
		} );
	}

	destroy() {
		this.view.editable.disableDomRootActions();

		super.destroy();
	}
}
