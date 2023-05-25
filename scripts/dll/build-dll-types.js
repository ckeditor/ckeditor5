#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const fs = require( 'fs' );
const minimist = require( 'minimist' );
const path = require( 'path' );
const tools = require( '@ckeditor/ckeditor5-dev-utils/lib/tools' );

const packageName = tools.readPackageName( process.cwd() );

const argv = minimist( process.argv.slice( 2 ), {
	string: [
		'template',
		'file',
		'package-name'
	],
	default: {
		'template': path.resolve( __dirname, './templates/package.ts.txt' ),
		'file': getShortPackageName( packageName ) + '.d.ts',
		'package-name': packageName
	}
} );

const templatePath = path.resolve( process.cwd(), argv.template );
const template = fs.readFileSync( templatePath, { encoding: 'utf8' } );
const outDir = path.join( process.cwd(), 'build' );

const content = template
	.replace( /__NAME__/g, getGlobalKeyForPackage( argv[ 'package-name' ] ) )
	.replace( /__FULL_PACKAGE_NAME__/g, argv[ 'package-name' ] );

fs.writeFileSync( path.join( outDir, argv.file ), content );

console.log( `Generated typings for "${ packageName }" package DLL build.` );

/**
 * Transforms the package name (`@ckeditor/ckeditor5-foo-bar`) to the name that will be used while
 * exporting the library into the global scope.
 *
 * @param {String} packageName
 * @returns {String}
 */
function getGlobalKeyForPackage( packageName ) {
	return getShortPackageName( packageName )
		.replace( /-([a-z])/g, ( match, p1 ) => p1.toUpperCase() );
}

function getShortPackageName( packageName ) {
	return packageName.replace( /^@ckeditor\/ckeditor5?-/, '' );
}
