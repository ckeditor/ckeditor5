#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

// Updates `@ckeditor/ckeditor5-*` and `ckeditor5` dependencies in `packages/*` and `release/*` directories to the latest version.
// Changes in `packages/*` will be committed as well.
//
// See https://github.com/cksource/ckeditor5-internal/issues/1123.
//
// This task must be called before: `npm run release:publish`.
//
// Use:
// npm run release:update-package-versions -- --dry-run
//
// Available arguments:
// --dry-run:   Prevents the script from committing, and instead displays detailed list of changes from each file that was changed.

const CKEDITOR5_PATH = path.posix.resolve( __dirname, '..', '..' );
const CKEDITOR5_INTERNAL_PATH = path.posix.resolve( __dirname, '..', '..', 'external', 'ckeditor5-internal' );
const COLLABORATION_FEATURES_PATH = path.posix.resolve( __dirname, '..', '..', 'external', 'collaboration-features' );

if ( !fs.existsSync( CKEDITOR5_INTERNAL_PATH ) ) {
	throw new Error( `The script assumes that the directory "${ CKEDITOR5_INTERNAL_PATH }" exists.` );
}

if ( !fs.existsSync( COLLABORATION_FEATURES_PATH ) ) {
	throw new Error( `The script assumes that the directory "${ COLLABORATION_FEATURES_PATH }" exists.` );
}

require( '@ckeditor/ckeditor5-dev-env' )
	.updatePackageVersions(
		// paths to update
		[
			{ path: CKEDITOR5_PATH + '/packages', commit: true },
			{ path: CKEDITOR5_PATH + '/release', commit: false },
			{ path: CKEDITOR5_INTERNAL_PATH + '/packages', commit: true },
			{ path: CKEDITOR5_INTERNAL_PATH + '/release', commit: false },
			{ path: COLLABORATION_FEATURES_PATH + '/packages', commit: true },
			{ path: COLLABORATION_FEATURES_PATH + '/release', commit: false }
		],

		// dry run flag
		process.argv.includes( '--dry-run' )
	);
