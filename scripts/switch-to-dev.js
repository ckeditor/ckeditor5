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

const configPath = path.join( __dirname, '..', 'switch-to-dev.json' );
const docsUrl = 'https://ckeditor.com/docs/ckeditor5/latest/framework/guides/development-tools.html#usage-of-local-version-of-dependencies';

if ( !fs.existsSync( configPath ) ) {
	console.log( chalk.red( `Config file is missing: ${ chalk.underline( configPath ) }` ) );
	console.log( chalk.red( `See the docs: ${ chalk.underline( docsUrl ) }` ) );

	process.exit( 1 );
}

const { repositoriesToLink } = loadJson( configPath );

if ( !repositoriesToLink || !Array.isArray( repositoriesToLink ) ) {
	console.log( chalk.red( `Config file is invalid: ${ chalk.underline( configPath ) }` ) );
	console.log( chalk.red( `See the docs: ${ chalk.underline( docsUrl ) }` ) );

	process.exit( 1 );
}

console.log( chalk.blue( '🔹 Finding all packages to link.' ) );

const packagesToLink = repositoriesToLink.flatMap( repoPathFromRoot => {
	const repoPath = path.join( __dirname, '..', repoPathFromRoot );

	if ( !fs.existsSync( repoPath ) ) {
		console.log( chalk.red( `Directory ${ chalk.underline( repoPath ) } is missing.` ) );
		console.log( chalk.red( `See the docs: ${ chalk.underline( docsUrl ) }` ) );

		process.exit( 1 );
	}

	return glob.sync( path.join( repoPath, '**', 'package.json' ), { ignore: '**/node_modules/**' } )
		.map( pkgJsonPath => {
			const pkgJsonContent = loadJson( pkgJsonPath );

			return {
				name: pkgJsonContent.name,
				path: pkgJsonPath.replace( /(\\|\/)package\.json$/, '' )
			};
		} );
} );

console.log( chalk.blue( '🔹 Finding all package.json files and saving their initial content.' ) );

const cke5pkgJsonArr = glob.sync( '**/package.json', { ignore: '**/node_modules/**' } )
	.map( pkgJsonPath => {
		const pkgJsonContent = fs.readFileSync( pkgJsonPath, 'utf-8' );

		return {
			content: pkgJsonContent,
			path: pkgJsonPath
		};
	} );

console.log( chalk.blue( '🔹 Updating all package.json files.' ) );

for ( const pkgJson of cke5pkgJsonArr ) {
	const pkgJsonContent = loadJson( pkgJson.path );

	for ( const packageData of packagesToLink ) {
		const newValue = `link:${ packageData.path }`.split( path.sep ).join( path.posix.sep );

		[ 'dependencies', 'devDependencies' ].forEach( depType => {
			if ( pkgJsonContent[ depType ] && pkgJsonContent[ depType ][ packageData.name ] ) {
				pkgJsonContent[ depType ][ packageData.name ] = newValue;
			}
		} );
	}

	fs.writeFileSync( pkgJson.path, JSON.stringify( pkgJsonContent, null, 2 ) + '\n', 'utf-8' );
}

console.log( chalk.blue( '🔹 Updating the dependencies.' ) );

try {
	execSync( 'yarn install', {
		cwd: path.join( __dirname, '..' ),
		stdio: 'inherit'
	} );
} catch ( err ) {
	console.log( chalk.red( 'Updating the dependencies failed with a message:' ) );
	console.log( chalk.red( err ) );
}

console.log( chalk.blue( '🔹 Reversing all package.json files to their original content.' ) );

cke5pkgJsonArr.forEach( pkgJson => fs.writeFileSync( pkgJson.path, pkgJson.content ) );

/**
 * @param {String} path
 * @returns {JSON}
 */
function loadJson( path ) {
	const jsonRawContent = fs.readFileSync( path, 'utf-8' );

	return JSON.parse( jsonRawContent );
}
