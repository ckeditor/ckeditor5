#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const fs = require( 'fs' );
const path = require( 'path' );

const cwd = process.cwd();

const filesToRemove = [
	path.join( cwd, 'yarn.lock' ),
	path.join( cwd, 'package-lock.json' )
];

console.log( 'Starting removing "lock" files...' );

for ( const file of filesToRemove ) {
	if ( fs.existsSync( file ) ) {
		console.log( `Removing: "${ file }"...` );
		fs.unlinkSync( file );
	}
}

console.log( 'Done.' );
