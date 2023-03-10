#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );
const fs = require( 'fs' );
const rimraf = require( 'rimraf' );
const minimist = require( 'minimist' );

const options = parseArguments( process.argv.slice( 2 ) );

cleanReleaseArtifacts( options ).then(
	() => {
		console.log( 'Done!' );
	},
	err => {
		console.error( err.stack );
	}
);

/**
 * Removes all build artifacts from source directories.
 *
 * @aram {Object} options
 * @aram {String} options.cwd An absolute path to the repository where to look for packages.
 * @returns {Promise}
 */
async function cleanReleaseArtifacts( options ) {
	const typeScriptPackages = await findTypeScriptPackages( options.cwd );

	// CKEditor 5 packages.
	const typeScriptPatterns = typeScriptPackages.map( pkg => {
		return [
			// Ignore the `lib/` directory in each package.
			`packages/${ pkg }/src/!(lib)/**/*.@(js|js.map|d.ts)`,
			// Remove files from in the `src/` directory.
			`packages/${ pkg }/src/*.@(js|js.map|d.ts)`
		];
	} );

	// The root directory.
	typeScriptPatterns.push( 'src/*.@(js|js.map|d.ts)' );

	const removePatterns = typeScriptPatterns.flatMap( item => item );

	for ( const pattern of removePatterns ) {
		await removeFiles( pattern );
	}
}

/**
 * Finds all packages in `packages` directory that are in TypeScript.
 *
 * @param {String} repositoryRoot An absolute path to the repository where to look for packages.
 * @returns {Promise} Array of package names.
 */
async function findTypeScriptPackages( repositoryRoot ) {
	const allPackages = await findAllPackages( repositoryRoot );
	const result = [];

	for ( const pkg of allPackages ) {
		if ( await isTypeScriptPackage( pkg ) ) {
			result.push( pkg );
		}
	}

	return result;
}

/**
 * Finds all packages in `packages` directory.
 *
 * @param {String} repositoryRoot An absolute path to the repository where to look for packages.
 * @returns {Promise} Array of package names.
 */
function findAllPackages( repositoryRoot ) {
	return new Promise( ( resolve, reject ) => {
		fs.readdir( path.join( repositoryRoot, 'packages' ), ( err, files ) => {
			if ( err ) {
				reject( err );
			} else {
				resolve( files );
			}
		} );
	} );
}

/**
 * Checks if the package is in TypeScript.
 *
 * @param {String} pkg Package name.
 * @returns {Promise} Whether the package is TypeScript one.
 */
function isTypeScriptPackage( pkg ) {
	return new Promise( resolve => {
		fs.access( `packages/${ pkg }/tsconfig.json`, fs.constants.F_OK, err => {
			resolve( !err );
		} );
	} );
}

/**
 * Removes all files matched with the provided globbing pattern.
 *
 * @param {String} pattern
 * @returns {Promise}
 */
function removeFiles( pattern ) {
	return new Promise( ( resolve, reject ) => {
		rimraf( pattern, err => {
			if ( err ) {
				reject( err );
			} else {
				resolve();
			}
		} );
	} );
}

/**
 * Parses CLI arguments and prepares configuration for the crawler.
 *
 * @param {Array.<String>} args CLI arguments and options.
 * @returns {Object} options
 */
function parseArguments( args ) {
	const config = {
		string: [
			'cwd'
		],

		default: {
			cwd: process.cwd()
		}
	};

	const options = minimist( args, config );

	options.cwd = path.resolve( options.cwd );

	return options;
}
