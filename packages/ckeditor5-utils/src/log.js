/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console */

/**
 * @module utils/log
 */

import { attachLinkToDocumentation } from './ckeditorerror';

/**
 * The logging module.
 *
 * This object features two functions that should be used across CKEditor code base to log errors and warnings.
 * Despite being an overridable interface for native `console.*` this module serves also the goal to limit the
 * code size of a minified CKEditor package. During minification process the messages will be shortened and
 * links to their documentation will be logged to the console.
 *
 * All errors and warning should be documented in the following way:
 *
 *		/**
 *		 * Error thrown when a plugin cannot be loaded due to JavaScript errors, lack of plugins with a given name, etc.
 *		 *
 *		 * @error plugin-load
 *		 * @param pluginName The name of the plugin that could not be loaded.
 *		 * @param moduleName The name of the module which tried to load this plugin.
 *		 * /
 *		log.error( 'plugin-load: It was not possible to load the "{$pluginName}" plugin in module "{$moduleName}', {
 *			pluginName: 'foo',
 *			moduleName: 'bar'
 *		} );
 *
 * ### Warning vs Error vs Throw
 *
 * * Whenever a potentially incorrect situation occurs, which does not directly lead to an incorrect behavior,
 * log a warning.
 * * Whenever an incorrect situation occurs, but the app may continue working (although perhaps incorrectly),
 * log an error.
 * * Whenever it's really bad and it does not make sense to continue working, throw a {@link module:utils/ckeditorerror~CKEditorError}.
 *
 * @namespace
 */
const log = {
	/**
	 * Logs an error to the console.
	 *
	 * Read more about error logging in the {@link module:utils/log} module.
	 *
	 * @param {String} message The error message in an `error-name: Error message.` format.
	 * During the minification process the "Error message" part will be removed to limit the code size
	 * and a link to this error documentation will be logged to the console.
	 * @param {Object} [data] Additional data describing the error.
	 */
	error( message, data ) {
		console.error( attachLinkToDocumentation( message ), data );
	},

	/**
	 * Logs a warning to the console.
	 *
	 * Read more about error logging in the {@link module:utils/log} module.
	 *
	 * @param {String} message The warning message in a `warning-name: Warning message.` format.
	 * During the minification process the "Warning message" part will be removed to limit the code size
	 * and a link to this error documentation will be logged to the console.
	 * @param {Object} [data] Additional data describing the warning.
	 */
	warn( message, data ) {
		console.warn( attachLinkToDocumentation( message ), data );
	}
};

export default log;
