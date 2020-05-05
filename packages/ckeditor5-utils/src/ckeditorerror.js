/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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
 * You should throw `CKEditorError` when:
 *
 * * An unexpected situation occurred and the editor (most probably) will not work properly. Such exception will be handled
 * by the {@link module:watchdog/watchdog~Watchdog watchdog} (if it is integrated),
 * * If the editor is incorrectly integrated or the editor API is used in the wrong way. This way you will give
 * feedback to the developer as soon as possible. Keep in mind that for common integration issues which should not
 * stop editor initialization (like missing upload adapter, wrong name of a toolbar component) we use `console.warn()` with
 * {@link module:utils/ckeditorerror~attachLinkToDocumentation `attachLinkToDocumentation()`}
 * to improve developers experience and let them see the working editor as soon as possible.
 *
 *		/**
 *		 * Error thrown when a plugin cannot be loaded due to JavaScript errors, lack of plugins with a given name, etc.
 *		 *
 *		 * @error plugin-load
 *		 * @param pluginName The name of the plugin that could not be loaded.
 *		 * @param moduleName The name of the module which tried to load this plugin.
 *		 * /
 *		throw new CKEditorError( 'plugin-load: It was not possible to load the "{$pluginName}" plugin in module "{$moduleName}', {
 *			pluginName: 'foo',
 *			moduleName: 'bar'
 *		} );
 *
 * @extends Error
 */
export default class CKEditorError extends Error {
	/**
	 * Creates an instance of the CKEditorError class.
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

	/**
	 * A utility that ensures the the thrown error is a {@link module:utils/ckeditorerror~CKEditorError} one.
	 * It is useful when combined with the {@link module:watchdog/watchdog~Watchdog} feature, which can restart the editor in case
	 * of a {@link module:utils/ckeditorerror~CKEditorError} error.
	 *
	 * @param {Error} err An error.
	 * @param {Object} context An object connected through properties with the editor instance. This context will be used
	 * by the watchdog to verify which editor should be restarted.
	 */
	static rethrowUnexpectedError( err, context ) {
		if ( err.is && err.is( 'CKEditorError' ) ) {
			throw err;
		}

		/**
		 * An unexpected error occurred inside the CKEditor 5 codebase. This error will look like the original one
		 * to make the debugging easier.
		 *
		 * This error is only useful when the editor is initialized using the {@link module:watchdog/watchdog~Watchdog} feature.
		 * In case of such error (or any {@link module:utils/ckeditorerror~CKEditorError} error) the watchdog should restart the editor.
		 *
		 * @error unexpected-error
		 */
		const error = new CKEditorError( err.message, context );

		// Restore the original stack trace to make the error look like the original one.
		// See https://github.com/ckeditor/ckeditor5/issues/5595 for more details.
		error.stack = err.stack;

		throw error;
	}
}

/**
 * Attaches the link to the documentation at the end of the error message. Use whenever you log a warning or error on the
 * console. It is also used by {@link module:utils/ckeditorerror~CKEditorError}.
 *
 *		 /**
 *		  * There was a problem processing the configuration of the toolbar. The item with the given
 *		  * name does not exist so it was omitted when rendering the toolbar.
 *		  *
 *		  * @error toolbarview-item-unavailable
 *		  * @param {String} name The name of the component.
 *		  * /
 *		 console.warn( attachLinkToDocumentation(
 *		 	'toolbarview-item-unavailable: The requested toolbar item is unavailable.' ), { name } );
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
