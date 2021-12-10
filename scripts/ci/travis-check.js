#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const childProcess = require( 'child_process' );
const crypto = require( 'crypto' );
const path = require( 'path' );

const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );
const { TRAVIS_JOB_TYPE } = process.env;

const RED = '\x1B[0;31m';
const GREEN = '\x1B[32m';
const CYAN = '\x1B[36;1m';
const MAGENTA = '\x1B[35;1m';
const NO_COLOR = '\x1B[0m';

// Tests + Code coverage.
if ( TRAVIS_JOB_TYPE === 'Tests' ) {
	console.log( `\n${ CYAN }Running the "Tests" build.${ NO_COLOR }\n` );

	exec( 'node', './scripts/ci/check-packages-code-coverage.js' );
}

// Verifying the code style.
if ( TRAVIS_JOB_TYPE === 'Validation' ) {
	console.log( `\n${ CYAN }Running the "Validation" build.${ NO_COLOR }\n` );

	// Linters.
	exec( 'yarn', 'run', 'lint' );
	exec( 'yarn', 'run', 'stylelint' );

	// Verifying manual tests.
	exec( 'yarn', 'run', 'dll:build' );

	// Disabled validation of manual tests due to lack of memory on Travis.
	// After migration to webpack 5, the manual test server ends with the following error:
	// "exited with 137."
	// See: #10982.
	// exec( 'sh', './scripts/check-manual-tests.sh', '-r', 'ckeditor5', '-f', 'ckeditor5' );
}

/**
 * Executes the specified command. E.g. for displaying the Node's version, use:
 *
 *		exec( 'node', '-v' );
 *
 * The output will be formatted using Travis's structure that increases readability.
 *
 * @param {..String} command
 */
function exec( ...command ) {
	const travis = {
		_lastTimerId: null,
		_lastStartTime: null,

		foldStart() {
			console.log( `travis_fold:start:script${ MAGENTA }$ ${ command.join( ' ' ) }${ NO_COLOR }` );
			this._timeStart();
		},

		foldEnd() {
			this._timeFinish();
			console.log( '\ntravis_fold:end:script\n' );
		},

		_timeStart() {
			const nanoSeconds = process.hrtime.bigint();

			this._lastTimerId = crypto.createHash( 'md5' ).update( nanoSeconds.toString() ).digest( 'hex' );
			this._lastStartTime = nanoSeconds;

			// Intentional direct write to stdout, to manually control EOL.
			process.stdout.write( `travis_time:start:${ this._lastTimerId }\r\n` );
		},

		_timeFinish() {
			const travisEndTime = process.hrtime.bigint();
			const duration = travisEndTime - this._lastStartTime;

			// Intentional direct write to stdout, to manually control EOL.
			process.stdout.write(
				`\ntravis_time:end:${ this._lastTimerId }:start=${ this._lastStartTime },` +
				`finish=${ travisEndTime },duration=${ duration }\r\n`
			);
		}
	};

	travis.foldStart();

	const childProcessStatus = childProcess.spawnSync( command[ 0 ], command.slice( 1 ), {
		encoding: 'utf8',
		shell: true,
		cwd: ROOT_DIRECTORY,
		stdio: 'inherit',
		stderr: 'inherit'
	} );

	const EXIT_CODE = childProcessStatus.status;
	const COLOR = EXIT_CODE ? RED : GREEN;

	travis.foldEnd();

	console.log( `${ COLOR }The command "${ command.join( ' ' ) }" exited with ${ EXIT_CODE }.${ NO_COLOR }\n` );

	if ( childProcessStatus.status ) {
		// An error occurred. Break the entire script.
		process.exit( EXIT_CODE );
	}
}
