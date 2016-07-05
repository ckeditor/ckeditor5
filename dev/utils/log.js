/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gutil = require( 'gulp-util' );

let logOut = ( msg ) => gutil.log( msg );
let logErr = ( msg ) => gutil.log( gutil.colors.red( msg ) );

module.exports = {
	/**
	 * Configure login output functions.
	 *
	 * 		log.configure( logOut, logErr );
	 *
	 * 		function logOut( message ) {
	 * 			// Save output to file.
	 * 			...
	 * 		}
	 *
	 * 		function logErr( message) {
	 * 			// Save error to file.
	 * 			...
	 * 		}
	 *
	 * @param {Function} stdout Function to be used to log standard output.
	 * @param {Function} stderr Function to be used to log standard error.
	 */
	configure( stdout, stderr ) {
		logOut = stdout;
		logErr = stderr;
	},

	/**
	 * Logs output using function provided in {@link configure}.
	 *
	 * @param {String} message Message to be logged.
	 */
	out( message ) {
		if ( logOut ) {
			logOut( message );
		}
	},

	/**
	 * Logs errors using function provided in {@link #configure}.
	 *
	 * @param {String} message Message to be logged.
	 */
	err( message ) {
		if ( logErr ) {
			logErr( message );
		}
	}
};
