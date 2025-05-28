#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { globSync } from 'glob';
import chalk from 'chalk';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

// This script ensures that the "manual/" test directories are only located in the root
// of the "tests" directories. Previously, they have been nested deeper, which prevents
// those tests from being compiled while running tests using the `--files` argument.
// See: https://github.com/ckeditor/ckeditor5/issues/12251.

const globPatterns = [
	'packages/*/tests/*/**/manual/**/*.@(js|ts|html|md)',
	'tests/*/**/manual/**/*.@(js|ts|html|md)'
];

const manualDirectoriesNotInTestsRoot = globPatterns.flatMap( pattern => globSync( pattern, { cwd: CKEDITOR5_ROOT_PATH } ) );

if ( manualDirectoriesNotInTestsRoot.length ) {
	console.log( chalk.red( 'The "manual/" directory should be stored directly in the "tests/" directory.' ) );
	console.log( chalk.red( 'The following tests do not follow this rule:' ) );
	console.log( chalk.red( manualDirectoriesNotInTestsRoot.map( str => ` - ${ str }` ).join( '\n' ) ) );

	process.exit( 1 );
}
