#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

// This script updates the version of CKEditor 5 in the `@ckeditor/ckeditor5-utils/src/version` module.
// It should be called as a post hook, after generating changelogs.

const fs = require( 'fs' );
const path = require( 'path' );
const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
const versionUtils = require( '@ckeditor/ckeditor5-dev-env/lib/release-tools/utils/versions' );

const CWD = process.cwd();
const UTILS_PACKAGE_PATH = path.join( CWD, 'packages', 'ckeditor5-utils' );
const UTILS_MODULE_PATH = path.join( UTILS_PACKAGE_PATH, 'src', 'version.js' );

const version = versionUtils.getLastFromChangelog();

const fileContent = fs.readFileSync( UTILS_MODULE_PATH, 'utf-8' )
	.replace( /const version = '\d+\.\d+\.\d+';/, `const version = '${ version }';` );

fs.writeFileSync( UTILS_MODULE_PATH, fileContent );

process.chdir( UTILS_PACKAGE_PATH );

if ( exec( 'git status -s' ).trim().length ) {
	exec( 'git add src/version.js' );
	exec( 'git commit -m "Internal: Updated version of CKEditor 5."' );

	console.log( 'The version has been updated and committed.' );
} else {
	console.log( 'Nothing to commit. Version is up-to-date.' );
}

process.chdir( CWD );

function exec( command ) {
	return tools.shExec( command, { verbosity: 'error' } );
}
