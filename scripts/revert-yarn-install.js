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

console.log( 'Removing "./node_modules/" and "./packages/*/node_modules/" directories...' );
removeNodeModulesInRepository( cwd );

console.log( 'Removing the nested "external/**/node_modules/" directories...' );
removeDirectoryFromExternalRepositories( cwd );

console.log( 'Done.' );

// Removes the `node_modules/` directory in the `rootDir` and all found packages (packages/*).
//
// Substitute of `rm -rf node_modules/ packages/*/node_modules/` on Unix environments.
//
// @param {String} rootDir
// @param {String} directoryName
function removeNodeModulesInRepository( rootDir ) {
	const directoryPath = path.join( rootDir, 'packages' );

	fs.rmdirSync( path.join( rootDir, 'node_modules' ), { recursive: true } );

	for ( const absolutePath of getDirectories( directoryPath ) ) {
		fs.rmdirSync( path.join( absolutePath, 'node_modules' ), { recursive: true } );
	}
}

// Removes the nested `node_modules/` directory in repositories found in the `external/` directory.
//
// @param {String} rootDir
function removeDirectoryFromExternalRepositories( rootDir ) {
	const externalPath = path.join( rootDir, 'external' );

	if ( fs.existsSync( externalPath ) ) {
		for ( const externalRepo of getDirectories( externalPath ) ) {
			// Remove `node_modules` within the external repository.
			removeNodeModulesInRepository( externalRepo, 'node_modules' );

			// Remove `rootDir/external/**/node_modules`.
			removeDirectoryFromExternalRepositories( externalRepo );
		}
	}
}

// Returns an array containing absolute paths to all directories found in the `rootDir` directory.
//
// @param {String} rootDir
// @return {Array.<String>}
function getDirectories( rootDir ) {
	if ( !fs.existsSync( rootDir ) ) {
		return [];
	}

	return fs.readdirSync( rootDir, { withFileTypes: true } )
		.filter( dirent => dirent.isDirectory() )
		.map( dirent => path.join( rootDir, dirent.name ) );
}
