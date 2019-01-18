/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-decoupled/decouplededitorui
 */

import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';
import normalizeToolbarConfig from '@ckeditor/ckeditor5-ui/src/toolbar/normalizetoolbarconfig';
import { attachPlaceholder, getPlaceholderElement } from '@ckeditor/ckeditor5-engine/src/view/placeholder';

/**
 * The decoupled editor UI class.
 *
 * @extends module:core/editor/editorui~EditorUI
 */
export default class DecoupledEditorUI extends EditorUI {
	/**
	 * Creates an instance of the decoupled editor UI class.
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
		 * @type {Object}
		 * @private
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
	 * Initializes the UI.
	 */
	init() {
		const editor = this.editor;
		const view = this.view;
		const editingView = editor.editing.view;

		view.render();

		editor.editing.view.attachDomRoot( view.editable.editableElement );

		const editingRoot = editor.editing.view.document.getRoot();

		view.editable.name = editingRoot.rootName;

		editor.on( 'dataReady', () => {
			view.editable.enableDomRootActions();

			attachPlaceholder( editingView, getPlaceholderElement( editingRoot ), 'Type some text...' );
		} );

		// Set up the editable.
		view.editable.bind( 'isFocused' ).to( editor.editing.view.document );

		this._editableElements.push( view.editable );

		this.focusTracker.add( view.editable.editableElement );
		this.view.toolbar.fillFromConfig( this._toolbarConfig.items, this.componentFactory );

		enableToolbarKeyboardFocus( {
			origin: editor.editing.view,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar: this.view.toolbar
		} );

		this.ready();
	}
}
