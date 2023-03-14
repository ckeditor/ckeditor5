#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const childProcess = require( 'child_process' );
const path = require( 'path' );

const { cyan, green } = require( './ansi-colors' );
const checkPackagesCodeCoverage = require( './check-packages-code-coverage' );
const execFactory = require( './exec-factory' );
const shouldRunShortFlow = require( './should-run-short-flow' );
const triggerCkeditor5ContinuousIntegration = require( './trigger-ckeditor5-continuous-integration' );

const { TRAVIS_JOB_TYPE } = process.env;

console.log( cyan( `\nRunning the "${ TRAVIS_JOB_TYPE }" build.\n` ) );

const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );
const shortFlow = shouldRunShortFlow( ROOT_DIRECTORY );
const exec = execFactory( ROOT_DIRECTORY );

// Tests + Code coverage.
if ( TRAVIS_JOB_TYPE === 'Tests' ) {
	if ( shortFlow ) {
		console.log( green( 'Only the documentation files were modified, skipping checking the code coverage.\n' ) );
	} else {
		const coverageExitCode = checkPackagesCodeCoverage();

		if ( coverageExitCode ) {
			process.exit( coverageExitCode );
		}
	}

	const repository = 'ckeditor/ckeditor5';
	const lastCommit = childProcess.execSync( 'git rev-parse HEAD' ).toString();

	const promise = triggerCkeditor5ContinuousIntegration( repository, lastCommit );

	if ( promise ) {
		promise.then( response => {
			if ( response.error_message ) {
				throw new Error( `CI trigger failed: "${ response.error_message }".` );
			}

			console.log( 'CI triggered successfully.' );
		} );
	}
}

// Verifying the code style.
if ( TRAVIS_JOB_TYPE === 'Validation' ) {
	if ( shortFlow ) {
		console.log( green( 'Only the documentation files were modified, running the static analyze only.\n' ) );
	}

	// Linters.
	exec( 'yarn', 'run', 'lint' );
	exec( 'yarn', 'run', 'stylelint' );

	if ( shortFlow ) {
		process.exit();
	}

	// Verifying manual tests.
	exec( 'yarn', 'run', 'dll:build' );
	exec( 'sh', './scripts/check-manual-tests.sh', '-r', 'ckeditor5', '-f', 'ckeditor5' );

	exec( 'node', './scripts/ci/check-manual-tests-directory-structure.js' );
}
