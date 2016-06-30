/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const through = require( 'through2' );
const path = require( 'path' );
const filter = require( 'gulp-filter' );
const gitignore = require( 'parse-gitignore' );
const fs = require( 'fs' );
const PassThrough = require( 'stream' ).PassThrough;
const replace = require( 'gulp-replace' );

function filterGitignore() {
	const fp = '.gitignore';

	if ( !fs.existsSync( fp ) ) {
		return new PassThrough( { objectMode: true } );
	}

	let glob = gitignore( fp );
	let inverted = glob.map(
		pattern => pattern.startsWith( '!' ) ? pattern.slice( 1 ) : '!' + pattern
	);
	inverted.unshift( '**/*' );

	return filter( inverted );
}

/**
 * {String} workdir
 */
module.exports = ( workdir ) => {
	const glob = path.join( workdir, '**/*' );
	const reLicense = /(@license Copyright \(c\) 2003-)[0-9]{4}/g;
	const yearReplacement = '$12017';

	let fileCount = 0;

	return gulp.src( glob )
		.pipe( filterGitignore() )
		.pipe( replace(
			reLicense,
			yearReplacement,
			{ skipBinary: true }
		) )
		.pipe( through.obj( ( file, enc, next ) => {
			fileCount++;

			next( null, file );
		} ) )
		.pipe( gulp.dest( workdir ) )
		.on( 'end', ( ) => {
			console.log( 'File count:', fileCount );
		} );
};
