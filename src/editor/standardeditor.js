/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from './editor.js';
import KeystrokeHandler from '../keystrokehandler.js';
import EditingController from '../engine/editingcontroller.js';

import CKEditorError from '../utils/ckeditorerror.js';
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

		/**
		 * Instance of the {@link engine.EditingController editing controller}.
		 *
		 * @readonly
		 * @member {engine.EditingController} ckeditor5.editor.StandardEditor#editing
		 */
		this.editing = new EditingController( this.document );

		/**
		 * Instance of the {@link ckeditor5.KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {engine.treecontroller.DataController} ckeditor5.editor.StandardEditor#keystrokes
		 */
		this.keystrokes = new KeystrokeHandler( this );
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
		if ( !this.data ) {
			/**
			 * Data controller has not been defined yet, so methods like {@link ckeditor5.editor.StandardEditor#setData} and
			 * {@link ckeditor5.editor.StandardEditor#getData} cannot be used.
			 *
			 * @error editor-no-datacontroller
			 */
			throw new CKEditorError( 'editor-no-datacontroller: Data controller has not been defined yet.' );
		}

		this.data.set( data );
	}

	/**
	 * Gets the data from the editor's main root.
	 */
	getData() {
		if ( !this.data ) {
			throw new CKEditorError( 'editor-no-datacontroller: Data controller has not been defined yet.' );
		}

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
	 * @abstract
	 * @static
	 * @method #create
	 * @param {HTMLElement} element See {@link ckeditor5.editor.StandardEditor}'s param.
	 * @param {Object} config See {@link ckeditor5.editor.StandardEditor}'s param.
	 * @returns {Promise} Promise resolved once editor is ready.
	 * @returns {ckeditor5.editor.StandardEditor} return.editor The editor instance.
	 */
}
