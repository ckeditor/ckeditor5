#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import path from 'node:path';
import { glob } from 'glob';
import { rimraf } from 'rimraf';
import minimist from 'minimist';
import isTypeScriptPackage from './utils/istypescriptpackage.mjs';
import { PACKAGES_DIRECTORY } from './utils/constants.mjs';

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
			`${ pkg }/src/!(lib)/**/*.@(js|js.map|d.ts)`,
			// Remove files from in the `src/` directory.
			`${ pkg }/src/*.@(js|js.map|d.ts)`
		];
	} );

	// The root directory.
	typeScriptPatterns.push( `${ options.cwd }/src/*.@(js|js.map|d.ts)` );

	const removePatterns = typeScriptPatterns.flatMap( item => item );

	for ( const pattern of removePatterns ) {
		await rimraf( pattern, { glob: true } );
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
async function findAllPackages( repositoryRoot ) {
	return glob( `${ PACKAGES_DIRECTORY }/*/`, { cwd: repositoryRoot, absolute: true } )
		// Glob returns packages from bottom to top (Z-A). Let's align the results to `fs.readdir()` (A-Z).
		.then( items => items.reverse() );
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
