#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

/**
 * This script removes files and directories created when calling `(yarn|npm) install`.
 *
 * Files to remove:
 *      * package-lock.json
 *      * yarn.lock
 *
 * Directories to remove:
 *      * ./node_modules/
 *      * ./packages/ ** /node_modules
 *      * ./external/ ** /node_modules
 *
 * To find the nested directories, the "**" pattern is used.
 */

const fs = require( 'fs' );
const path = require( 'path' );

try {
	// Check whether packages are installed.
	require.resolve( '@ckeditor/ckeditor5-dev-utils' );
} catch ( error ) {
	console.log( 'Required @ckeditor/ckeditor5-dev-utils package cannot be found. Please install node deps before calling this script.' );

	process.exit();
}

const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );

const cwd = process.cwd();

const filesToRemove = [
	path.join( cwd, 'yarn.lock' ),
	path.join( cwd, 'package-lock.json' )
];

console.log( 'Removing "lock" files...' );

for ( const file of filesToRemove ) {
	if ( fs.existsSync( file ) ) {
		fs.unlinkSync( file );
	}
}

console.log( 'Removing the nested "node_modules/" directories...' );

tools.clean( cwd, './**/node_modules', { verbosity: 'error' } )
	.then( () => {
		console.log( 'Done.' );
	} );
