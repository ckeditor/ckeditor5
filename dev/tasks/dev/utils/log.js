/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

let logOut;
let logErr;

module.exports = {
	/**
	 * Configure login output functions.
	 *
	 * 		log.configure( logOut, logErr );
	 *
	 * 		const function logOut( message ) {
	 * 			// Save output to file.
	 * 			...
	 * 		}
	 * 		const function logErr( message) {
	 * 			// Save error to file.
	 * 			...
	 * 		}
	 *
	 * @param {function} stdout Function to be used to log standard output.
	 * @param {function} stderr Function to be used to log standard error.
	 */
	configure( stdout, stderr ) {
		logOut = stdout;
		logErr = stderr;
	},

	/**
	 * Log output using function provided in {@link configure}.
	 *
	 * @param {String} message Message to be logged.
	 */
	out( message ) {
		if ( logOut ) {
			logOut( message );
		}
	},

	/**
	 * Log errors using function provided in {@link configure}.
	 *
	 * @param {String} message Message to be logged.
	 */
	err( message ) {
		if ( logErr ) {
			logErr( message );
		}
	}
};
