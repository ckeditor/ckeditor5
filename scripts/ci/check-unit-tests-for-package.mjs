#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import { glob } from 'glob';
import minimist from 'minimist';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

main()
	.catch( err => {
		console.error( err );

		process.exit( 1 );
	} );

async function main() {
	const { packageName, checkCoverage, allowNonFullCoverage, coverageFile, attempts } = getOptions( process.argv.slice( 2 ) );

	runTests( { packageName, checkCoverage, attempts } );

	if ( checkCoverage && !allowNonFullCoverage ) {
		const exitCode = checkCodeCoverage();

		if ( coverageFile ) {
			const matches = await glob( 'coverage/*/lcov.info' );

			for ( const filePath of matches ) {
				const buffer = await fs.readFile( filePath );

				await fs.writeFile( coverageFile, buffer, { flag: 'as' } );
			}
		}

		process.exit( exitCode );
	}
}

/**
 * @param {Object} options
 * @param {String} options.packageName
 * @param {Boolean} options.checkCoverage
 * @param {Number} options.attempts
 */
function runTests( { packageName, checkCoverage, attempts = 3 } ) {
	const shortName = packageName.replace( /^ckeditor5?-/, '' );

	const testCommand = [
		'yarn',
		'test',
		'--reporter=dots',
		'--production',
		`-f ${ shortName }`,
		checkCoverage ? '--coverage' : null
	].filter( Boolean );

	try {
		execSync( testCommand.join( ' ' ), {
			cwd: CKEDITOR5_ROOT_PATH,
			stdio: 'inherit'
		} );
	} catch ( err ) {
		if ( !attempts ) {
			throw err;
		}

		console.log( `\n⚠️ Retry the test execution. Remaining attempts: ${ attempts - 1 }.` );

		return runTests( {
			packageName,
			checkCoverage,
			attempts: attempts - 1
		} );
	}
}

function checkCodeCoverage() {
	execSync( 'cp coverage/*/coverage-final.json .nyc_output', {
		cwd: CKEDITOR5_ROOT_PATH,
		stdio: 'inherit'
	} );

	try {
		execSync( 'npx nyc check-coverage --branches 100 --functions 100 --lines 100 --statements 100', {
			cwd: CKEDITOR5_ROOT_PATH,
			stdio: 'inherit'
		} );
	} catch {
		return 1;
	}

	return 0;
}

/**
 * @param {Array.<String>} argv
 * @returns {Object} options
 * @returns {String} options.packageName
 * @returns {Boolean} options.checkCoverage
 * @returns {Boolean} options.allowNonFullCoverage
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
			'check-coverage',
			'allow-non-full-coverage'
		],
		default: {
			'allow-non-full-coverage': false,
			'coverage-file': null
		}
	} );

	options.attempts = Number( options.attempts || 3 );
	options.packageName = options[ 'package-name' ];
	options.coverageFile = options[ 'coverage-file' ];
	options.checkCoverage = options[ 'check-coverage' ];
	options.allowNonFullCoverage = options[ 'allow-non-full-coverage' ];

	return options;
}
