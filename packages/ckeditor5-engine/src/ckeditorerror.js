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
		 * Logs an error to the console.
		 *
		 * Read more about error logging in the {@link core.log} module.
		 *
		 * @constructor
		 * @param {String} message The error message in an `error-name: Error message.` format.
		 * During the minification process the "Error message" part will be removed to limit the code size
		 * and a link to this error documentation will be logged to the console.
		 * @param {Object} [data] Additional data describing the error.
		 */
		constructor( message, data ) {
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
