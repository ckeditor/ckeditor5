/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-classic/classiceditorui
 */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';
import normalizeToolbarConfig from '@ckeditor/ckeditor5-ui/src/toolbar/normalizetoolbarconfig';

/**
 * The classic editor UI class.
 *
 * @implements module:core/editor/editorui~EditorUI
 */
export default class ClassicEditorUI {
	/**
	 * Creates an instance of the editor UI class.
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

		/**
		 * A normalized `config.toolbar` object.
		 *
		 * @type {Object}
		 * @private
		 */
		this._toolbarConfig = normalizeToolbarConfig( editor.config.get( 'toolbar' ) );

		// Set–up the view.
		view.set( 'width', editor.config.get( 'ui.width' ) );
		view.set( 'height', editor.config.get( 'ui.height' ) );

		// Set–up the toolbar.
		view.toolbar.bind( 'isActive' ).to( this.focusTracker, 'isFocused' );
		view.toolbar.limiterElement = view.element;

		if ( this._toolbarConfig && this._toolbarConfig.viewportTopOffset ) {
			view.toolbar.viewportTopOffset = this._toolbarConfig.viewportTopOffset;
		}

		// Setup the editable.
		const editingRoot = editor.editing.createRoot( 'div' );
		view.editable.bind( 'isReadOnly' ).to( editingRoot );
		view.editable.bind( 'isFocused' ).to( editor.editing.view );
		view.editable.name = editingRoot.rootName;
		this.focusTracker.add( view.editableElement );
	}

	/**
	 * Initializes the UI.
	 */
	init() {
		const editor = this.editor;

		this.view.init();

		if ( this._toolbarConfig ) {
			this.view.toolbar.fillFromConfig( this._toolbarConfig.items, this.componentFactory );
		}

		enableToolbarKeyboardFocus( {
			origin: editor.editing.view,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar: this.view.toolbar
		} );
	}

	/**
	 * Destroys the UI.
	 */
	destroy() {
		this.view.destroy();
	}
}
