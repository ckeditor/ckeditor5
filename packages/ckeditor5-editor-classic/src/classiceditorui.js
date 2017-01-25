/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-classic/classiceditorui
 */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

/**
 * The classic editor UI class.
 */
export default class ClassicEditorUI {
	/**
	 * Creates an instance of the editor UI class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:ui/editorui/editoruiview~EditorUIView} view View of the ui.
	 */
	constructor( editor, view ) {
		/**
		 * Editor that the UI belongs to.
		 *
		 * @readonly
		 * @member {module:core/editor/editor~Editor}
		 */
		this.editor = editor;

		/**
		 * View of the ui.
		 *
		 * @readonly
		 * @member {module:ui/editorui/editoruiview~EditorUIView}
		 */
		this.view = view;

		/**
		 * Instance of the {@link module:ui/componentfactory~ComponentFactory}.
		 *
		 * @readonly
		 * @member {module:ui/componentfactory~ComponentFactory}
		 */
		this.componentFactory = new ComponentFactory( editor );

		/**
		 * Keeps information about editor focus.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		// Set–up the view.
		view.set( 'width', editor.config.get( 'ui.width' ) );
		view.set( 'height', editor.config.get( 'ui.height' ) );

		// Set–up the toolbar.
		view.toolbar.bind( 'isActive' ).to( this.focusTracker, 'isFocused' );
		view.toolbar.limiterElement = view.element;

		// Setup the editable.
		const editingRoot = editor.editing.createRoot( 'div' );
		view.editable.bind( 'isReadOnly' ).to( editingRoot );
		view.editable.bind( 'isFocused' ).to( editor.editing.view );
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
				const toolbarConfig = editor.config.get( 'toolbar' );
				const promises = [];

				if ( toolbarConfig ) {
					for ( let name of toolbarConfig ) {
						promises.push( this.view.toolbar.items.add( this.componentFactory.create( name ) ) );
					}
				}

				return Promise.all( promises );
			} )
			.then( () => {
				const toolbarFocusTracker = this.view.toolbar.focusTracker;

				// Because toolbar items can get focus, the overall state of
				// the toolbar must also be tracked.
				this.focusTracker.add( this.view.toolbar.element );

				// Focus the toolbar on the keystroke, if not already focused.
				editor.keystrokes.set( 'Alt+F10', ( data, cancel ) => {
					if ( this.focusTracker.isFocused && !toolbarFocusTracker.isFocused ) {
						this.view.toolbar.focus();
						cancel();
					}
				} );

				// Blur the toolbar and bring the focus back to editable on the keystroke.
				this.view.toolbar.keystrokes.set( 'Esc', ( data, cancel ) => {
					if ( toolbarFocusTracker.isFocused ) {
						editor.editing.view.focus();
						cancel();
					}
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
