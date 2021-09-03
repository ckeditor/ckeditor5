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
 *      * ./packages/ * /node_modules
 *      * ./external/ * /node_modules
 *      * ./external/ * /packages/ * /node_modules
 */

const fs = require( 'fs' );
const path = require( 'path' );

const CWD = process.cwd();
const EXTERNAL_PATH = path.join( CWD, 'external' );

const filesToRemove = [
	path.join( CWD, 'yarn.lock' ),
	path.join( CWD, 'package-lock.json' )
];

console.log( 'Removing "lock" files...' );

for ( const file of filesToRemove ) {
	if ( fs.existsSync( file ) ) {
		fs.unlinkSync( file );
	}
}

console.log( 'Removing "node_modules/" directory...' );
fs.rmdirSync( path.join( CWD, 'node_modules' ), { recursive: true } );

console.log( 'Removing the nested "packages/*/node_modules/" directories...' );
removeDirectoryInPackages( CWD, 'node_modules' );

console.log( 'Checking whether the "external/" directory exists...' );

if ( fs.existsSync( EXTERNAL_PATH ) ) {
	console.log( `Removing the nested "external/**/node_modules/" directories...` );

	for ( const externalRepo of getDirectories( EXTERNAL_PATH ) ) {
		fs.rmdirSync( path.join( externalRepo, 'node_modules' ), { recursive: true } );
		removeDirectoryInPackages( externalRepo, 'node_modules' );
	}
}

console.log( 'Done.' );

// Removes a directory specified as `directoryName` in all found packages.
//
// Substitute of `rm -rf packages/*/node_modules` on Unix environments.
//
// @param {String} rootDir
// @param {String} directoryName
function removeDirectoryInPackages( rootDir, directoryName ) {
	const directoryPath = path.join( rootDir, 'packages' );

	for ( const absolutePath of getDirectories( directoryPath ) ) {
		fs.rmdirSync( path.join( absolutePath, directoryName ), { recursive: true } );
	}
}

// Returns an array containing absolute paths to all directories found in the `rootDir` directory.
//
// @param {String} rootDir
// @return {Array.<String>}
function getDirectories( rootDir ) {
	return fs.readdirSync( rootDir, { withFileTypes: true } )
		.filter( dirent => dirent.isDirectory() )
		.map( dirent => path.join( rootDir, dirent.name ) )
}
