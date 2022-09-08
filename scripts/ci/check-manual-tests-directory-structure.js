#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const glob = require( 'glob' );
const path = require( 'path' );
const { red } = require( './ansi-colors' );
const ROOT_DIRECTORY = path.join( __dirname, '..', '..' );

// This script ensures that the "manual/" test directories are only located in the root
// of the "tests" directories. Previously, they have been nested deeper, which prevents
// those tests from being compiled while running tests using the `--files` argument.
// See: https://github.com/ckeditor/ckeditor5/issues/12251.

const globPatterns = [
	'packages/*/tests/*/**/manual/**/*.@(js|ts|html|md)',
	'tests/*/**/manual/**/*.@(js|ts|html|md)'
];

const manualDirectoriesNotInTestsRoot = globPatterns.flatMap( pattern => glob.sync( pattern, { cwd: ROOT_DIRECTORY } ) );

if ( manualDirectoriesNotInTestsRoot.length ) {
	console.log( red( 'The "manual/" directory should be stored directly in the "tests/" directory.' ) );
	console.log( red( 'The following tests do not follow this rule:' ) );
	console.log( red( manualDirectoriesNotInTestsRoot.map( str => ` - ${ str }` ).join( '\n' ) ) );

	process.exit( 1 );
}
