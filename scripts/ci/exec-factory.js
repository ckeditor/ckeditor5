/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const childProcess = require( 'child_process' );

const { red, green, magenta } = require( './ansi-colors' );
const TravisFolder = require( './travis-folder' );

/**
 * Creates and returns `exec()` function working in specific CWD.
 *
 * @param {String} cwd
 * @returns {Function}
 */
module.exports = cwd => {
	const travisFolder = new TravisFolder();

	/**
	 * Executes the specified command. E.g. for displaying the Node's version, use:
	 *
	 *		exec( 'node', '-v' );
	 *
	 * The output will be formatted using Travis's structure that increases readability.
	 *
	 * @param {String[]} command
	 */
	return ( ...command ) => {
		travisFolder.start( 'script', magenta( '$ ' + command.join( ' ' ) ) );

		console.log( `CWD: ${ cwd }` );

		const childProcessStatus = childProcess.spawnSync( command[ 0 ], command.slice( 1 ), {
			encoding: 'utf8',
			shell: true,
			cwd,
			stdio: 'inherit',
			stderr: 'inherit'
		} );

		const EXIT_CODE = childProcessStatus.status;
		const color = EXIT_CODE ? red : green;

		travisFolder.end( 'script' );

		console.log( color( `The command "${ command.join( ' ' ) }" exited with ${ EXIT_CODE }.\n` ) );

		if ( childProcessStatus.status ) {
			// An error occurred. Break the entire script.
			process.exit( EXIT_CODE );
		}
	};
};
