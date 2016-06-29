/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const through = require( 'through2' );
const path = require( 'path' );
// const gitignore = require( 'gulp-gitignore' );

const filter = require( 'gulp-filter' );
const gitignore = require( 'parse-gitignore' );
const fs = require( 'fs' );

const PassThrough = require( 'stream' ).PassThrough;

function filterGitignore() {
	const fp = '.gitignore';

	if ( !fs.existsSync( fp ) ) {
		return new PassThrough( { objectMode: true } );
	}

	let glob = gitignore( fp );
	let inverted = glob.map( pattern => pattern.startsWith( '!' ) ? pattern.slice( 1 ) : '!' + pattern );
	inverted.unshift( '**/*' );

	return filter( inverted );
}

/**
 * {String} workdir
 */
module.exports = ( workdir ) => {
	const glob = path.join( workdir, '**/*' );

	let fileCount = 0;

	return gulp.src( glob )
		.pipe( filterGitignore() )
		.pipe( through.obj( ( file, enc, cb ) => {
			fileCount++;
			// console.log( file.path );

			cb( );
		} ) )
		.on( 'end', ( ) => {
			console.log( 'File count:', fileCount );
		} );
};
