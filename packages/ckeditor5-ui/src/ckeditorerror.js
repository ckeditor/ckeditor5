/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * The CKEditor error class.
 *
 * All errors will be shortened during the minification process in order to reduce the code size.
 * Therefore, all error messages should be documented in the same way as those in {@link CKEDITOR.core.log}.
 *
 * Read more in the {@link core.log} module.
 *
 * @class CKEditorError
 * @extends Error
 */

CKEDITOR.define( function() {
	class CKEditorError extends Error {
		/**
		 * Creates an instance of the CKEditorError class.
		 *
		 * Read more about error logging in the {@link core.log} module.
		 *
		 * @constructor
		 * @param {String} message The error message in an `error-name: Error message.` format.
		 * During the minification process the "Error message" part will be removed to limit the code size
		 * and a link to this error documentation will be added to the `message`.
		 * @param {Object} [data] Additional data describing the error. A stringified version of this object
		 * will be appended to the error {@link #message}, so the data are quickly visible in the console. The original
		 * data object will also be later available under the {@link #data} property.
		 */
		constructor( message, data ) {
			if ( data ) {
				message += ' ' + JSON.stringify( data );
			}

			super( message );

			this.name = 'CKEditorError';

			/**
			 * The additional error data passed to the constructor.
			 *
			 * @property {Object} data
			 */
			this.data = data;
		}
	}

	return CKEditorError;
} );
