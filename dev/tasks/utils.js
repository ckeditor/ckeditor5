/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const del = require( 'del' );
const gutil = require( 'gulp-util' );

const utils = {
	/**
	 * Removes files and directories specified by `glob` starting from `rootDir`
	 * and gently informs about deletion.
	 *
	 * @param {String} rootDir The path to the root directory (i.e. "dist/").
	 * @param {String} glob Glob specifying what to clean.
	 * @returns {Promise}
	 */
	clean( rootDir, glob ) {
		return del( path.join( rootDir, glob ) ).then( paths => {
			paths.forEach( p => {
				gutil.log( `Deleted file '${ gutil.colors.cyan( p ) }'.` );
			} );
		} );
	}
};

module.exports = utils;
