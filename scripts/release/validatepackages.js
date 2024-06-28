#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const { existsSync, readdirSync } = require( 'fs' );
const { execSync } = require( 'child_process' );
const { join } = require( 'upath' );
const { red, green } = require( 'chalk' );
const { RELEASE_NPM_DIRECTORY } = require( './utils/constants' );

const releaseDirectory = join( process.cwd(), RELEASE_NPM_DIRECTORY );

if ( !existsSync( releaseDirectory ) ) {
	console.log( red( 'The "release" directory does not exist.' ) );

	process.exit( 1 );
}

let isSuccess = true;

for ( const directoryName of readdirSync( releaseDirectory ) ) {
	const path = join( releaseDirectory, directoryName );

	try {
		execSync( `yarn publint ${ path } --level=warning --strict`, {
			cwd: process.cwd(),
			encoding: 'utf-8',
			stdio: 'pipe'
		} );
	} catch ( error ) {
		console.error( red( `Validation of the "${ directoryName }" package failed with the following errors:` ) );
		console.log( error.stdout );

		isSuccess = false;
	}
}

if ( isSuccess ) {
	console.log( green( 'No issues found with the packages.' ) );
}

process.exit( Number( !isSuccess ) );
