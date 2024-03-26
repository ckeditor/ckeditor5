/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

// Checks if all available packages of `ckeditor5` and `ckeditor5-premium-features` are on the list in `packages-lists.json` file.
//
// Usage:
// 	yarn run check-packages-lists

/* eslint-env node */

const chalk = require( 'chalk' );
const upath = require( 'upath' );
const fs = require( 'fs-extra' );
const { globSync } = require( 'glob' );

const EXCLUDED_PACKAGES = [
	'ckeditor5-premium-features',
	'ckeditor5-collaboration'
];

const pathToPackagesLists = upath.resolve( __dirname, '..', 'packages-lists.json' );

// Exit process when `packages-lists.json` file does not exist.
if ( !fs.existsSync( pathToPackagesLists ) ) {
	console.log( chalk.red.bold( 'File "packages-lists.json" does not exists.' ) );
	process.exit( 1 );
}

// Get content of `packages-lists.json` file.
const packagesListsFileContent = fs.readJsonSync( pathToPackagesLists );

// CKEditor5
const allCKEditor5PackagesNames = getPackagesNames( [ 'packages/*/package.json' ] );
const missingCKE5Packages = allCKEditor5PackagesNames
	.filter( pkg => !packagesListsFileContent.ckeditor5.includes( pkg ) )
	.filter( pkg => !EXCLUDED_PACKAGES.includes( pkg ) );

// Commercial
let missingCommercialPackages = [];

if ( fs.existsSync( 'external/ckeditor5-commercial' ) ) {
	const allCKEditor5CommercialPackagesNames = getPackagesNames( [ 'external/ckeditor5-commercial/packages/*/package.json' ] );

	missingCommercialPackages = allCKEditor5CommercialPackagesNames
		.filter( pkg => !packagesListsFileContent[ 'ckeditor5-premium-features' ].includes( pkg ) )
		.filter( pkg => !EXCLUDED_PACKAGES.includes( pkg ) );
}

// Final check and log.
if ( missingCKE5Packages.length || missingCommercialPackages.length ) {
	logMissingPackages( missingCKE5Packages, 'ckeditor5' );
	logMissingPackages( missingCommercialPackages, 'ckeditor5-premium-features' );
	process.exitCode = 1;
} else {
	console.log( chalk.red.green( '\nFile "packages-lists.json" is up-to-date.' ) );
}

/**
 * Gets all packages names from given list of paths.
 *
 * @param {Array.<String>} listOfPaths
 */
function getPackagesNames( listOfPaths ) {
	const pathToCKEditor5 = upath.resolve( __dirname, '../' );
	const allPathsToCKEditor5PackageJson = globSync( listOfPaths, {
		cwd: pathToCKEditor5,
		nodir: true,
		absolute: true
	} );

	return allPathsToCKEditor5PackageJson.map( pathToPackageJson => fs.readJsonSync( pathToPackageJson ).name );
}

/**
 * Logs missing packages.
 *
 * @param {Array.<String>} packagesList
 * @param {String} packagesSource
 */
function logMissingPackages( packagesList, packagesSource ) {
	if ( !packagesList.length ) {
		return;
	}

	console.log( chalk.red.bold(
		`\nNot all packages from "${ packagesSource }" were added to the "packages-lists.json" file. List of missing packages:`
	) );
	packagesList.forEach( packageName => console.log( chalk.red( ` - "${ packageName }"` ) ) );
}
