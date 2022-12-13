#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const checkPackagesCodeCoverage = require( './check-packages-code-coverage' );
const childProcess = require( 'child_process' );
const path = require( 'path' );
const TravisFolder = require( './travis-folder' );
const { red, cyan, green, magenta } = require( './ansi-colors' );

const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );
const { TRAVIS_JOB_TYPE } = process.env;

const travisFolder = new TravisFolder();

console.log( cyan( `\nRunning the "${ TRAVIS_JOB_TYPE }" build.\n` ) );

// Tests + Code coverage.
if ( TRAVIS_JOB_TYPE === 'Tests' ) {
	checkPackagesCodeCoverage();
}

// Verifying the code style.
if ( TRAVIS_JOB_TYPE === 'Validation' ) {
	// Linters.
	exec( 'yarn', 'run', 'lint' );
	exec( 'yarn', 'run', 'stylelint' );

	// Verifying manual tests.
	exec( 'yarn', 'run', 'dll:build' );
	exec( 'sh', './scripts/check-manual-tests.sh', '-r', 'ckeditor5', '-f', 'ckeditor5' );

	exec( 'node', './scripts/ci/check-manual-tests-directory-structure.js' );
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
	travisFolder.start( 'script', magenta( '$ ' + command.join( ' ' ) ) );

	const childProcessStatus = childProcess.spawnSync( command[ 0 ], command.slice( 1 ), {
		encoding: 'utf8',
		shell: true,
		cwd: ROOT_DIRECTORY,
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
}
