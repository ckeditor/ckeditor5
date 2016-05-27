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
 * Represents a single editor instance.
 *
 * @memberOf ckeditor5
 * @mixes utils.ObservaleMixin
 */
export default class StandardEditor extends Editor {
	/**
	 * Creates a new instance of the Editor class.
	 *
	 * @param {HTMLElement} [element] The DOM element that will be the source
	 * for the created editor.
	 * @param {Object} config The editor config.
	 */
	constructor( element, config ) {
		super( config );

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
	 * Sets the data in the editor's main root.
	 *
	 * @param {*} data The data to load.
	 */
	setData( data ) {
		if ( !this.data ) {
			/**
			 * Data controller has not been defined yet, so methds like {@link ckeditor5.editor.StandardEditor#setData} and
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
	 * Updates the {@link ckeditor5.Editor#element editor element}'s content with the data.
	 */
	updateEditorElement() {
		setDataInElement( this.element, this.getData() );
	}

	/**
	 * Loads the data from the {@link ckeditor5.Editor#element editor element} to the main root.
	 */
	loadDataFromEditorElement() {
		this.setData( getDataFromElement( this.element ) );
	}
}
