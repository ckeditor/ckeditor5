/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import fs from 'fs-extra';
import { parseArgs } from 'util';
import chalk from 'chalk';
import upath from 'upath';
import { parse } from 'acorn';
import { walk } from 'estree-walker';
import { globSync } from 'glob';
import { CKEDITOR5_INDEX, CKEDITOR5_PREMIUM_FEATURES_INDEX } from './constants.mjs';
import { PACKAGES_DIRECTORY } from './release/utils/constants.mjs';

/**
 * List of paths to the allowed `input` packages.
 */
const paths = {
	'ckeditor5': CKEDITOR5_INDEX,
	'ckeditor5-premium-features': CKEDITOR5_PREMIUM_FEATURES_INDEX
};

/**
 * List of packages that are not meant to be exported in the main entry files.
 */
const exceptions = [
	...Object.keys( paths ),

	// Core packages.
	'@ckeditor/ckeditor5-theme-lark',

	// Commercial packages.
	'@ckeditor/ckeditor5-operations-compressor',
	'ckeditor5-collaboration'
];

/**
 * Parse CLI arguments.
 */
const { values } = parseArgs( {
	options: {
		/*
		 * Name of the package to check. Valid options:
		 * - `ckeditor5`.
		 * - `ckeditor5-premium-features`.
		 */
		'input': { type: 'string' }
	},

	// Skip `node ./scripts/check-exports.mjs`.
	args: process.argv.slice( 2 ),

	// Fail when unknown argument is used.
	strict: true
} );

/**
 * Resolve paths based on the `input` value.
 */
const inputPath = paths[ values.input ];

if ( !inputPath ) {
	throw new Error( `Invalid input value: ${ values.input }` );
}

/**
 * Get names of all packages in the `packages` directory.
 */
const globPath = upath.join( process.cwd(), PACKAGES_DIRECTORY, '*', 'package.json' );

const packages = globSync( globPath )
	.map( path => fs.readJsonSync( path ) )
	.map( pkg => pkg.name );

/**
 * Parse the main entry file.
 */
const ast = parse( fs.readFileSync( inputPath, 'utf8' ), {
	sourceType: 'module',
	ecmaVersion: 'latest'
} );

const exports = [];

/**
 * Walk through the AST and collect names of all exported packages.
 */
walk( ast, {
	enter( node ) {
		if ( node.type !== 'ExportAllDeclaration' && node.type !== 'ExportNamedDeclaration' ) {
			return;
		}

		const path = node.source.value;

		if ( path.startsWith( '.' ) || path.startsWith( '/' ) ) {
			return;
		}

		const packageName = path
			.split( '/' )
			.slice( 0, path.startsWith( '@' ) ? 2 : 1 )
			.join( '/' );

		exports.push( packageName );
	}
} );

/**
 * Names of the packages that are not exported in the main entry file.
 */
const missingExports = packages.filter( name => !exports.includes( name ) && !exceptions.includes( name ) );

/**
 * Names of the packages that are not present in the packages directory, but are exported in the main entry file.
 */
const missingPackages = exports.filter( name => !packages.includes( name ) );

if ( !missingExports.length && !missingPackages.length ) {
	console.log( chalk.green( 'All packages are exported in the main entry file.' ) );
	process.exit( 0 );
}

if ( missingExports.length ) {
	console.log(
		chalk.red.bold( `The following packages are not exported from the "${ values.input }" package:` )
	);

	missingExports.forEach( pkg => console.log( chalk.red( ` - ${ pkg }` ) ) );
}

if ( missingPackages.length ) {
	console.log(
		chalk.red.bold( `The following exports in the "${ values.input }" package are not present in the "packages" directory:` )
	);

	missingPackages.forEach( pkg => console.log( chalk.red( ` - ${ pkg }` ) ) );
}

process.exit( 1 );
