#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { globSync } from 'glob';
import chalk from 'chalk';
import { CKEDITOR5_ROOT_PATH, CKEDITOR5_COMMERCIAL_PATH, IS_ISOLATED_REPOSITORY } from '../constants.mjs';
import upath from 'upath';

// This script validates the manual tests against two rules:
//
// 1. A "manual/" directory must be located directly in the package root.
// 2. Manual test scripts must be written in TypeScript.

let hasError = false;

// Rule 1: manual tests live in the root-level "manual/" directories of packages. Directories
// named "manual/" under the "tests/" directories are no longer scanned by the manual test server.
// See: https://github.com/ckeditor/ckeditor5/issues/12251.
const nestedManualTestPatterns = [
	'packages/*/tests/**/manual/**/*.@(js|ts|html|md)',
	'tests/**/manual/**/*.@(js|ts|html|md)'
];

const manualDirectoriesNotInPackageRoot = nestedManualTestPatterns
	.flatMap( pattern => globSync( pattern, { cwd: CKEDITOR5_ROOT_PATH } ).map( upath.normalize ) );

if ( manualDirectoriesNotInPackageRoot.length ) {
	hasError = true;

	console.log( chalk.red( 'The "manual/" directory should be stored directly in the package root.' ) );
	console.log( chalk.red( 'The following tests do not follow this rule:' ) );
	console.log( chalk.red( manualDirectoriesNotInPackageRoot.map( str => ` - ${ str }` ).join( '\n' ) ) );
}

// Rule 2: JavaScript is no longer accepted so that every manual test is covered by the
// `typecheck:manual` task. The `tests/_utils` helpers shared between the automated and manual
// tests live outside the "manual/" directories and are intentionally not covered by this rule.
// See: https://github.com/ckeditor/ckeditor5-commercial/issues/11146.
const rootsToCheck = IS_ISOLATED_REPOSITORY ? [ CKEDITOR5_ROOT_PATH ] : [ CKEDITOR5_ROOT_PATH, CKEDITOR5_COMMERCIAL_PATH ];

const javaScriptManualTests = rootsToCheck
	.flatMap( root => globSync( 'packages/*/manual/**/*.@(js|cjs|mjs)', { cwd: root, absolute: true } ) )
	.map( upath.normalize );

if ( javaScriptManualTests.length ) {
	hasError = true;

	console.log( chalk.red( 'Manual tests must be written in TypeScript (".ts").' ) );
	console.log( chalk.red( 'The following JavaScript files are not allowed:' ) );
	console.log( chalk.red( javaScriptManualTests.map( str => ` - ${ str }` ).join( '\n' ) ) );
}

if ( hasError ) {
	process.exit( 1 );
}
