/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const gulp = require( 'gulp' );
const gulpRename = require( 'gulp-rename' );
const gutil = require( 'gulp-util' );
const filesize = require( 'filesize' );
const mainUtils = require( '../utils' );

const utils = {
	/**
	 * Save files from stream in specific destination and add `.min` suffix to the name.
	 *
	 * @param {Stream} stream
	 * @param {String} destination path
	 * @returns {Stream}
	 */
	saveFileFromStreamAsMinified( stream, destination ) {
		return stream
			.pipe( gulpRename( {
				suffix: '.min'
			} ) )
			.pipe( gulp.dest( destination ) );
	},

	/**
	 * Get human readable size of the file.
	 *
	 * @param {String} path path to the file
	 */
	getFileSize( path ) {
		return filesize( fs.statSync( path ).size );
	},

	/**
	 * Log on console size of every passed file in specified directory.
	 *
	 * 		utils.logFileSize( [ 'ckeditor.min.js', 'ckeditor.min.css' ], 'path/to/dir' );
	 *
	 * 		ckeditor.min.js: 192.43 KB
	 * 		ckeditor.min.css: 5.38 KB
	 *
	 * @param {String} [rootDir='']
	 * @param {Array<String>} files
	 */
	logFilesSize( files, rootDir = '' ) {
		files = files.map( ( file ) => {
			let filePath = path.join( rootDir, file );
			let name = path.basename( filePath );
			let size = utils.getFileSize( filePath );

			return `${name}: ${size}`;
		} );

		gutil.log( gutil.colors.green( `\n${ files.join( '\n' ) }` ) );
	},

	/**
	 * Copy specified file to specified destination.
	 *
	 * @param {String} from file path
	 * @param {String} to copied file destination
	 * @return {Promise}
	 */
	copyFile( from, to ) {
		return new Promise( ( resolve ) => {
			gulp.src( from )
				.pipe( gulp.dest( to ) )
				.on( 'finish', resolve );
		} );
	}
};

// Assign properties from top level utils.
module.exports = Object.assign( utils, mainUtils );
