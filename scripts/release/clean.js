#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs' );
const rimraf = require( 'rimraf' );

cleanReleaseArtifacts().then(
	() => { console.log( 'Done!' ); },
	err => { console.error( err.stack ); }
);

/**
 * Removes all build artifacts from source directories.
 *
 * @returns {Promise}
 */
async function cleanReleaseArtifacts() {
	const typeScriptPackages = await findTypeScriptPackages();
	const typeScriptPatterns = typeScriptPackages.map( pkg => `packages/${ pkg }/src/**/*.@(js|d.ts)` );

	const removePatterns = [
		...typeScriptPatterns,
		'src/**/*.@(js|d.ts)'
	];

	for ( const pattern of removePatterns ) {
		await removeFiles( pattern );
	}
}

/**
 * Finds all packages in `packages` directory that are in TypeScript.
 *
 * @returns {Promise} Array of package names.
 */
async function findTypeScriptPackages() {
	const allPackages = await findAllPackages();
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
 * @returns {Promise} Array of package names.
 */
function findAllPackages() {
	return new Promise( ( resolve, reject ) => {
		fs.readdir( 'packages', ( err, files ) => {
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
		fs.access( `packages/${ pkg }/tsconfig.release.json`, fs.constants.F_OK, err => {
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
