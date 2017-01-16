/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-classic/classiceditorui
 */

import ComponentFactory from 'ckeditor5-ui/src/componentfactory';
import FocusTracker from 'ckeditor5-utils/src/focustracker';
import KeystrokeHandler from 'ckeditor5-utils/src/keystrokehandler';

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

		/**
		 * Instance of the {@link module:core/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:core/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		// Set–up the view.
		view.set( 'width', editor.config.get( 'ui.width' ) );
		view.set( 'height', editor.config.get( 'ui.height' ) );

		// Set–up the toolbar.
		view.toolbar.bind( 'isActive' ).to( this.focusTracker, 'isFocused' );
		view.toolbar.limiterElement = view.element;

		// Setup the editable.
		const editingRoot = editor.editing.createRoot( 'div' );
		view.editable.bind( 'isReadOnly', 'isFocused' ).to( editingRoot );
		view.editable.name = editingRoot.rootName;
		this.focusTracker.add( view.editableElement );
		this.focusTracker.add( this.view.toolbar.element );
	}

	/**
	 * Initializes the UI.
	 *
	 * @returns {Promise} A Promise resolved when the initialization process is finished.
	 */
	init() {
		const editor = this.editor;
		const toolbarFocusTracker = this.view.toolbar.focusTracker;

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
				// Listen on the keystrokes from the main UI.
				this.keystrokes.listenTo( this.view.element );

				// Listen on the keystrokes from the floating panels, toolbars and the such.
				this.keystrokes.listenTo( this.view._bodyCollectionContainer );

				// Focus the toolbar on the keystroke, if not already focused.
				this.keystrokes.set( 'alt + f10', ( data, cancel ) => {
					if ( this.focusTracker.isFocused && !toolbarFocusTracker.isFocused ) {
						this.view.toolbar.focus();
						cancel();
					}
				} );

				// Blur the toolbar and bring the focus back to editable on the keystroke.
				this.keystrokes.set( 'esc', ( data, cancel ) => {
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
