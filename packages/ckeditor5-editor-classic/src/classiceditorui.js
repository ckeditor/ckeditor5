/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ComponentFactory from '../ui/componentfactory.js';
import FocusTracker from '../utils/focustracker.js';

/**
 * The classic editor UI class.
 *
 * @memberOf editor-classic
 */
export default class ClassicEditorUI {
	/**
	 * Creates an instance of the editor UI class.
	 *
	 * @param {core.editor.Editor} editor The editor instance.
	 * @param {ui.editorUI.EditorUIView} view View of the ui.
	 */
	constructor( editor, view ) {
		/**
		 * Editor that the UI belongs to.
		 *
		 * @readonly
		 * @member {core.editor.Editor} editor-classic.ClassicEditorUI#editor
		 */
		this.editor = editor;

		/**
		 * View of the ui.
		 *
		 * @readonly
		 * @member {ui.editorUI.EditorUIView} editor-classic.ClassicEditorUI#view
		 */
		this.view = view;

		/**
		 * Instance of the {@link ui.ComponentFactory}.
		 *
		 * @readonly
		 * @member {ui.ComponentFactory} editor-classic.ClassicEditorUI#componentFactory
		 */
		this.componentFactory = new ComponentFactory( editor );

		/**
		 * Keeps information about editor focus.
		 *
		 * @readonly
		 * @member {utils.FocusTracker} editor-classic.ClassicEditorUI#focusTracker
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
		view.editable.bind( 'isReadOnly', 'isFocused' ).to( editingRoot );
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
