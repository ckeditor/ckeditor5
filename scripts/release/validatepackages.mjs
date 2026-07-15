#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { existsSync, readdirSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { availableParallelism } from 'node:os';
import { promisify } from 'node:util';
import upath from 'upath';
import chalk from 'chalk';
import { RELEASE_NPM_DIRECTORY } from './utils/constants.mjs';

const execFileAsync = promisify( execFile );
const releaseDirectory = upath.join( process.cwd(), RELEASE_NPM_DIRECTORY );

if ( !existsSync( releaseDirectory ) ) {
	console.log( chalk.red( 'The "release" directory does not exist.' ) );

	process.exit( 1 );
}

const directoryNames = readdirSync( releaseDirectory );
const failures = new Array( directoryNames.length );
const workerCount = Math.min( availableParallelism(), 8, directoryNames.length );
let nextIndex = 0;

await Promise.all( Array.from( { length: workerCount }, async () => {
	while ( nextIndex < directoryNames.length ) {
		const index = nextIndex++;
		const directoryName = directoryNames[ index ];
		const packagePath = upath.join( releaseDirectory, directoryName );

		try {
			await execFileAsync( 'pnpm', [
				'publint',
				packagePath,
				'--level=warning',
				'--strict',
				'--pack=npm'
			], {
				cwd: process.cwd(),
				encoding: 'utf-8'
			} );
		} catch ( error ) {
			failures[ index ] = error.stdout || error.stderr || error;
		}
	}
} ) );

for ( const [ index, failure ] of failures.entries() ) {
	if ( !failure ) {
		continue;
	}

	console.error( chalk.red( `Validation of the "${ directoryNames[ index ] }" package failed with the following errors:` ) );
	console.log( failure );
}

if ( failures.every( failure => !failure ) ) {
	console.log( chalk.green( 'No issues found with the packages.' ) );
}

process.exit( Number( failures.some( failure => failure ) ) );
