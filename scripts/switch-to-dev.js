#!/bin/bash

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );
const chalk = require( 'chalk' );
const { execSync } = require( 'child_process' );
const { updateJSONFile } = require( '@ckeditor/ckeditor5-dev-utils' ).tools;

const REPOS_TO_LINK = [
	'ckeditor5-dev',
	'ckeditor5-linters-config'
];

console.log( chalk.blue( '🔹 Finding all packages to link.' ) );

const packagesToLink = REPOS_TO_LINK.flatMap( repoToLink => {
	const packagesData = [];

	const repoPath = path.join( __dirname, '..', '..', repoToLink );

	if ( !fs.existsSync( repoPath ) ) {
		console.log( chalk.yellow( `⚠️  Directory ${ chalk.underline( repoPath ) } is missing, skipping.` ) );

		return packagesData;
	}

	// The root package.
	packagesData.push( getPackageData( repoPath ) );

	// the "./packages" directory packages.
	const packagesPath = path.join( repoPath, 'packages' );

	if ( fs.existsSync( packagesPath ) ) {
		packagesData.push(
			...fs.readdirSync( packagesPath ).map( packageDirectory => {
				const packagePath = path.join( packagesPath, packageDirectory );

				return getPackageData( packagePath );
			} )
		);
	}

	return packagesData;
} );

console.log( chalk.blue( '🔹 Finding all package.json files and saving their initial content.' ) );

const pkgJsonArr = glob.sync( '**/package.json', { ignore: '**/node_modules/**' } ).map( pkgJsonPath => {
	const content = fs.readFileSync( pkgJsonPath, 'utf-8' );

	return { content, path: pkgJsonPath };
} );

console.log( chalk.blue( '🔹 Updating all package.json files.' ) );

for ( const pkgJson of pkgJsonArr ) {
	updateJSONFile( pkgJson.path, packageJsonContent => {
		for ( const packageData of packagesToLink ) {
			const newValue = `link:${ packageData.path }`.split( path.sep ).join( path.posix.sep );

			if ( packageJsonContent.dependencies && packageJsonContent.dependencies[ packageData.name ] ) {
				packageJsonContent.dependencies[ packageData.name ] = newValue;
			} else if ( packageJsonContent.devDependencies && packageJsonContent.devDependencies[ packageData.name ] ) {
				packageJsonContent.devDependencies[ packageData.name ] = newValue;
			}
		}

		return packageJsonContent;
	} );
}

console.log( chalk.blue( '🔹 Updating the dependencies.' ) );

try {
	execSync( 'yarn install', {
		cwd: path.join( __dirname, '..' ),
		stdio: 'inherit'
	} );
} catch ( err ) {
	console.log( chalk.red( 'Updating the dependencies failed with a message:' ) );
	console.log( chalk.red( err.message ) );
}

console.log( chalk.blue( '🔹 Reversing all package.json files to their original content.' ) );

pkgJsonArr.forEach( pkgJson => fs.writeFileSync( pkgJson.path, pkgJson.content ) );

/**
 * For a given package path, returns object containing its path and name.
 *
 * @param {String} packagePath
 * @returns {Object}
 */
function getPackageData( packagePath ) {
	const packageJsonPath = path.join( packagePath, 'package.json' );
	const packageJsonContent = JSON.parse( fs.readFileSync( packageJsonPath, 'utf-8' ) );

	return {
		path: packagePath,
		name: packageJsonContent.name
	};
}
