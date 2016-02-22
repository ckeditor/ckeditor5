/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from './editor.js';
import Collection from './collection.js';
import Config from './config.js';

/**
 * This is the API entry point. The entire CKEditor code runs under this object.
 *
 * @namespace CKEDITOR
 */
const CKEDITOR = {
	/**
	 * A collection containing all editor instances created.
	 *
	 * @readonly
	 * @member {core.Collection} CKEDITOR.instances
	 */
	instances: new Collection(),

	/**
	 * Creates an editor instance for the provided DOM element.
	 *
	 * The creation of editor instances is an asynchronous operation, therefore a promise is returned by this
	 * method.
	 *
	 *		CKEDITOR.create( '#content' );
	 *
	 *		CKEDITOR.create( '#content' ).then( ( editor ) => {
	 *			// Manipulate "editor" here.
	 *		} );
	 *
	 * @method CKEDITOR.create
	 * @param {String|HTMLElement} element An element selector or a DOM element, which will be the source for the
	 * created instance.
	 * @returns {Promise} A promise, which will be fulfilled with the created editor.
	 */
	create( element, config ) {
		return new Promise( ( resolve, reject ) => {
			// If a query selector has been passed, transform it into a real element.
			if ( typeof element == 'string' ) {
				element = document.querySelector( element );

				if ( !element ) {
					return reject( new Error( 'Element not found' ) );
				}
			}

			const editor = new Editor( element, config );

			this.instances.add( editor );

			// Remove the editor from `instances` when destroyed.
			editor.once( 'destroy', () => {
				this.instances.remove( editor );
			} );

			resolve(
				// Initializes the editor, which returns a promise.
				editor.init()
					.then( () => {
						// After initialization, return the created editor.
						return editor;
					} )
			);
		} );
	},

	/**
	 * Holds global configuration defaults, which will be used by editor instances when such configurations are not
	 * available on them directly.
	 * @member {core.Config} CKEDITOR.config
	 */
	config: new Config()
};

export default CKEDITOR;
