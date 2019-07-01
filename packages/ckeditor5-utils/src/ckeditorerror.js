/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/ckeditorerror
 */

/**
 * URL to the documentation with error codes.
 */
export const DOCUMENTATION_URL =
	'https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/error-codes.html';

/**
 * The CKEditor error class.
 *
 * All errors will be shortened during the minification process in order to reduce the code size.
 * Therefore, all error messages should be documented in the same way as those in {@link module:utils/log}.
 *
 * Read more in the {@link module:utils/log} module.
 *
 * @extends Error
 */
export default class CKEditorError extends Error {
	/**
	 * Creates an instance of the CKEditorError class.
	 *
	 * Read more about error logging in the {@link module:utils/log} module.
	 *
	 * @param {String} message The error message in an `error-name: Error message.` format.
	 * During the minification process the "Error message" part will be removed to limit the code size
	 * and a link to this error documentation will be added to the `message`.
	 * @param {Object|null} context A context of the error by which the {@link module:watchdog/watchdog~Watchdog watchdog}
	 * is able to determine which editor crashed. It should be an editor instance or a property connected to it. It can be also
	 * a `null` value if the editor should not be restarted in case of the error (e.g. during the editor initialization).
	 * The error context should be checked using the `areConnectedThroughProperties( editor, context )` utility
	 * to check if the object works as the context.
	 * @param {Object} [data] Additional data describing the error. A stringified version of this object
	 * will be appended to the error message, so the data are quickly visible in the console. The original
	 * data object will also be later available under the {@link #data} property.
	 */
	constructor( message, context, data ) {
		message = attachLinkToDocumentation( message );

		if ( data ) {
			message += ' ' + JSON.stringify( data );
		}

		super( message );

		/**
		 * @type {String}
		 */
		this.name = 'CKEditorError';

		/**
		 * A context of the error by which the Watchdog is able to determine which editor crashed.
		 *
		 * @type {Object|null}
		 */
		this.context = context;

		/**
		 * The additional error data passed to the constructor. Undefined if none was passed.
		 *
		 * @type {Object|undefined}
		 */
		this.data = data;
	}

	/**
	 * Checks if the error is of the `CKEditorError` type.
	 */
	is( type ) {
		return type === 'CKEditorError';
	}
}

/**
 * Attaches link to the documentation at the end of the error message.
 *
 * @param {String} message Message to be logged.
 * @returns {String}
 */
export function attachLinkToDocumentation( message ) {
	const matchedErrorName = message.match( /^([^:]+):/ );

	if ( !matchedErrorName ) {
		return message;
	}

	return message + ` Read more: ${ DOCUMENTATION_URL }#error-${ matchedErrorName[ 1 ] }\n`;
}
