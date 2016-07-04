/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

 'use strict';

const gulp = require( 'gulp' );
const path = require( 'path' );
const replace = require( 'gulp-replace' );
const gitignore = require( '../utils/gitignore-filter' );

/**
 * Replaces license date in source files with new date
 *
 * @param {String} workdir
 * @returns {Object} stream
 */
module.exports = ( workdir ) => {
	// Change this to correct year
	const year = '2017';

	const licenseRegexp = /(@license Copyright \(c\) 2003-)[0-9]{4}(, CKSource - Frederico Knabben\.)/g;
	const glob = path.join( workdir, '**/*' );

	return gulp.src( glob )
		.pipe( gitignore() )
		.pipe( replace(
			licenseRegexp,
			`$1${ year }$2`,
			{ skipBinary: true }
		) )
		.pipe( gulp.dest( workdir ) );
};
