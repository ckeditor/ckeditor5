#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

// This script aims to verify whether all editor SVG icons are valid. Current criteria are:
// - SVG icon should have a defined `viewBox`
// - double quotation marks (") are enforced over single ones (')

import fs from 'fs-extra';
import upath from 'upath';
import { glob } from 'glob';

const svgPaths = glob.sync( upath.join( process.cwd(), 'packages', '*', 'theme', 'icons', '*.svg' ) ).sort();

const singleQuotationMarksUsed = [];
const missingViewBox = [];

svgPaths.forEach( path => {
	const file = fs.readFileSync( path, 'utf-8' );

	const SVGs = file.match( /<svg[\s\S]+<\/svg>/g );

	if ( SVGs.length === 0 ) {
		throw new Error( `No SVG defined in file: ${ path }` );
	}

	if ( SVGs.length > 1 ) {
		throw new Error( `Multiple SVGs defined in file: ${ path }` );
	}

	const SVG = SVGs[ 0 ];

	if ( SVG.match( '\'' ) ) {
		singleQuotationMarksUsed.push( path );
	}

	if ( !SVG.match( 'viewBox=' ) ) {
		missingViewBox.push( path );
	}
} );

if ( singleQuotationMarksUsed.length ) {
	console.log( '\nFollowing editor icons have used single quotation marks instead of double ones:' );
	console.log( singleQuotationMarksUsed.map( path => ` - ${ path }` ).join( '\n' ) );
}

if ( missingViewBox.length ) {
	console.log( '\nFollowing editor icons are missing `viewBox`:' );
	console.log( missingViewBox.map( path => ` - ${ path }` ).join( '\n' ) );
}

if ( [ ...singleQuotationMarksUsed, ...missingViewBox ].length ) {
	process.exit( 1 );
}
