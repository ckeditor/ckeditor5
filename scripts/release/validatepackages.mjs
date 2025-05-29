#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { existsSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import upath from 'upath';
import chalk from 'chalk';
import { RELEASE_NPM_DIRECTORY } from './utils/constants.mjs';

const releaseDirectory = upath.join( process.cwd(), RELEASE_NPM_DIRECTORY );

if ( !existsSync( releaseDirectory ) ) {
	console.log( chalk.red( 'The "release" directory does not exist.' ) );

	process.exit( 1 );
}

let isSuccess = true;

for ( const directoryName of readdirSync( releaseDirectory ) ) {
	const path = upath.join( releaseDirectory, directoryName );

	try {
		execSync( `yarn publint ${ path } --level=warning --strict --pack=npm`, {
			cwd: process.cwd(),
			encoding: 'utf-8',
			stdio: 'pipe'
		} );
	} catch ( error ) {
		console.error( chalk.red( `Validation of the "${ directoryName }" package failed with the following errors:` ) );
		console.log( error.stdout );

		isSuccess = false;
	}
}

if ( isSuccess ) {
	console.log( chalk.green( 'No issues found with the packages.' ) );
}

process.exit( Number( !isSuccess ) );
