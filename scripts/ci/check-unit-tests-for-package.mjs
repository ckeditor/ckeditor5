#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import minimist from 'minimist';

main()
	.catch( err => {
		console.error( err );

		process.exit( 1 );
	} );

async function main() {
	const { packageName, checkCoverage, coverageFile, attempts } = getOptions( process.argv.slice( 2 ) );
	const packageDirectory = path.join( 'packages', packageName );
	const coverageDirectory = path.join( packageDirectory, 'coverage' );

	// The `coverage.clean` option also handles this, but remove artifacts from a previous
	// (possibly crashed) run explicitly, so a failed run cannot leak a stale lcov report.
	await fs.rm( coverageDirectory, { recursive: true, force: true } );

	runTests( { packageDirectory, checkCoverage, attempts } );

	if ( checkCoverage && coverageFile ) {
		// The lcov report contains repository-relative `SF:` paths (`createVitestConfig()` sets the
		// reporter's `projectRoot`), so per-package reports can be concatenated verbatim.
		const lcov = await fs.readFile( path.join( coverageDirectory, 'lcov.info' ), 'utf-8' );

		await fs.writeFile( coverageFile, lcov, { flag: 'as' } );
	}
}

/**
 * Runs the package's native test script. When checking coverage, the 100% coverage thresholds
 * configured by `createVitestConfig()` make Vitest exit with a non-zero code on a violation,
 * so no external coverage check is needed.
 *
 * @param {Object} options
 * @param {String} options.packageDirectory
 * @param {Boolean} options.checkCoverage
 * @param {Number} options.attempts
 */
function runTests( { packageDirectory, checkCoverage, attempts = 3 } ) {
	const testCommand = [
		'pnpm',
		'--dir',
		packageDirectory,
		'run',
		'test',
		checkCoverage ? '--coverage.enabled' : null
	].filter( Boolean );

	try {
		execSync( testCommand.join( ' ' ), {
			cwd: process.cwd(),
			stdio: 'inherit'
		} );
	} catch ( err ) {
		if ( !attempts ) {
			throw err;
		}

		console.log( `\n⚠️ Retry the test execution. Remaining attempts: ${ attempts - 1 }.` );

		return runTests( {
			packageDirectory,
			checkCoverage,
			attempts: attempts - 1
		} );
	}
}

/**
 * @param {Array.<String>} argv
 * @returns {Object} options
 * @returns {String} options.packageName
 * @returns {Boolean} options.checkCoverage
 * @returns {String|null} options.coverageFile
 * @returns {Number} options.attempts
 */
function getOptions( argv ) {
	const options = minimist( argv, {
		string: [
			'package-name',
			'coverage-file',
			'attempts'
		],
		boolean: [
			'check-coverage'
		],
		default: {
			'coverage-file': null
		}
	} );

	options.attempts = Number( options.attempts || 3 );
	options.packageName = options[ 'package-name' ];
	options.coverageFile = options[ 'coverage-file' ];
	options.checkCoverage = options[ 'check-coverage' ];

	return options;
}
