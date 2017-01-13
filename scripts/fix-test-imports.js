#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );

const testDir = path.join( process.cwd(), 'tests' );
const testPath = path.join( testDir , '**', '*.js' );

for ( const filePath of glob.sync( testPath ) ) {
	const fileContent = fs.readFileSync( filePath, 'utf-8' )
		.replace( /\nimport[^']+?'([^']+?)'/gm, fixImport );

	fs.writeFileSync( filePath, fileContent , 'utf-8' );
}

function fixImport( wholeImport , path ) {
	let fixedImport = fixCkeditorPaths( wholeImport, path );
	fixedImport = fixTestPaths( fixedImport, path );

	return fixedImport;
}

function fixCkeditorPaths( wholeImport, path ) {
	if ( path.indexOf( 'ckeditor5/' ) !== 0 ) {
		return wholeImport;
	}

	const index = wholeImport.indexOf( path );
	const pathChunks = path.split( '/' );

	return (
		wholeImport.slice( 0, index ) +
		'ckeditor5-' + pathChunks[ 1 ] + '/src/' + pathChunks.slice( 2 ).join( '/' ) +
		wholeImport.slice( path.length + index )
	);
}

function fixTestPaths( wholeImport, path ) {
	if ( path.indexOf( 'tests/' ) !== 0 ) {
		return wholeImport;
	}

	const index = wholeImport.indexOf( path );
	const pathChunks = path.split( '/' );

	return (
		wholeImport.slice( 0, index ) +
		'ckeditor5-' + pathChunks[ 1 ] + '/tests/' + pathChunks.slice( 2 ).join( '/' ) +
		wholeImport.slice( path.length + index )
	);
}
