/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from './editor.js';
import KeystrokeHandler from '../keystrokehandler.js';
import EditingController from '../engine/editingcontroller.js';

import getDataFromElement from '../utils/dom/getdatafromelement.js';
import setDataInElement from '../utils/dom/setdatainelement.js';

/**
 * Class representing a typical browser-based editor. It handles a single source element and
 * uses {@link engine.EditingController}.
 *
 * @memberOf ckeditor5.editor
 */
export default class StandardEditor extends Editor {
	/**
	 * Creates a new instance of the standard editor.
	 *
	 * @param {HTMLElement} element The DOM element that will be the source
	 * for the created editor.
	 * @param {Object} config The editor config.
	 */
	constructor( element, config ) {
		super( config );

		/**
		 * The element on which the editor has been initialized.
		 *
		 * @readonly
		 * @member {HTMLElement} ckeditor5.editor.StandardEditor#element
		 */
		this.element = element;

		// Documented in Editor.
		this.editing = new EditingController( this.document );

		/**
		 * Instance of the {@link ckeditor5.KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {engine.treecontroller.DataController} ckeditor5.editor.StandardEditor#keystrokes
		 */
		this.keystrokes = new KeystrokeHandler( this );

		/**
		 * Editor UI instance.
		 *
		 * This property is set by more specialized editor constructors. However, it's required
		 * for features to work (their UI-related part will try to interact with editor UI),
		 * so every editor class which is meant to work with default features should set this property.
		 *
		 * @readonly
		 * @member {ui.editorUI.EditorUI} ckeditor5.editor.StandardEditor#ui
		 */
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		return Promise.resolve()
			.then( () => this.editing.destroy() )
			.then( super.destroy() );
	}

	/**
	 * Sets the data in the editor's main root.
	 *
	 * @param {*} data The data to load.
	 */
	setData( data ) {
		this.data.set( data );
	}

	/**
	 * Gets the data from the editor's main root.
	 */
	getData() {
		return this.data.get();
	}

	/**
	 * Updates the {@link ckeditor5.editor.StandardEditor#element editor element}'s content with the data.
	 */
	updateEditorElement() {
		setDataInElement( this.element, this.getData() );
	}

	/**
	 * Loads the data from the {@link ckeditor5.editor.StandardEditor#element editor element} to the main root.
	 */
	loadDataFromEditorElement() {
		this.setData( getDataFromElement( this.element ) );
	}

	/**
	 * Creates a standard editor instance.
	 *
	 * @param {HTMLElement} element See {@link ckeditor5.editor.StandardEditor}'s param.
	 * @param {Object} config See {@link ckeditor5.editor.StandardEditor}'s param.
	 * @returns {Promise} Promise resolved once editor is ready.
	 * @returns {ckeditor5.editor.StandardEditor} return.editor The editor instance.
	 */
	static create( element, config ) {
		return new Promise( ( resolve ) => {
			const editor = new this( element, config );

			resolve(
				editor.initPlugins()
					.then( () => editor )
			);
		} );
	}
}
