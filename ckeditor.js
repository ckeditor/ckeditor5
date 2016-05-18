/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from './ckeditor5/editor.js';
import Collection from './ckeditor5/utils/collection.js';
import CKEditorError from './ckeditor5/utils/ckeditorerror.js';
import isArrayLike from './ckeditor5/utils/lib/lodash/isArrayLike.js';
import clone from './ckeditor5/utils/lib/lodash/clone.js';
import uid from './ckeditor5/utils/uid.js';

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
	 * @member {utils.Collection} CKEDITOR.instances
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
	 * @param {String|HTMLElement|HTMLCollection|NodeList|Array.<HTMLElement>|Object.<String, HTMLElement>} elements
	 * One or more elements on which the editor will be initialized. Different creators can handle these
	 * elements differently, but usually a creator loads the data from the element and either makes
	 * it editable or hides it and inserts the editor UI next to it.
	 * @returns {Promise} A promise, which will be fulfilled with the created editor.
	 */
	create( elements, config ) {
		return new Promise( ( resolve ) => {
			const editor = new Editor( normalizeElements( elements ), config );

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
	}
};

export default CKEDITOR;

function normalizeElements( elements ) {
	let elementsObject;

	// If a query selector has been passed, transform it into a real element.
	if ( typeof elements == 'string' ) {
		elementsObject = toElementsObject( document.querySelectorAll( elements ) );
	}
	// Arrays and array-like objects.
	else if ( isArrayLike( elements ) ) {
		elementsObject = toElementsObject( elements );
	}
	// Single HTML element.
	else if ( elements instanceof HTMLElement ) {
		elementsObject = toElementsObject( [ elements ] );
	}
	// Object.
	else {
		elementsObject = clone( elements );
	}

	if ( !Object.keys( elementsObject ).length ) {
		throw new CKEditorError( 'ckeditor5-create-no-elements: No elements have been passed to CKEDITOR.create()' );
	}

	return elementsObject;
}

function toElementsObject( elements ) {
	return Array.from( elements ).reduce( ( ret, el ) => {
		ret[ getEditorElementName( el ) ] = el;

		return ret;
	}, {} );
}

function getEditorElementName( element ) {
	if ( element.id ) {
		return element.id;
	}

	if ( element.dataset.editable ) {
		return element.dataset.editable;
	}

	return 'editable' + uid();
}
