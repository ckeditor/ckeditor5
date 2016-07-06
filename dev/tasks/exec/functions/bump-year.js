/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const path = require( 'path' );
const replace = require( 'gulp-replace' );
const filterGitignore = require( '../utils/filtergitignore' );

// Change this to correct year.
const year = '2017';

/**
 * Replaces license date in source files with new date.
 *
 * Example (remember to change the year harcoded in the module):
 *
 *		gulp exec --task bump-year
 *
 * @param {String} workdir
 * @returns {Object}
 */
module.exports = function executeBumpYear( workdir ) {
	const licenseRegexp = /(@license Copyright \(c\) 2003-)[0-9]{4}(, CKSource - Frederico Knabben\.)/g;
	const glob = path.join( workdir, '**/*' );

	return gulp.src( glob )
		.pipe( filterGitignore() )
		.pipe( replace(
			licenseRegexp,
			`$1${ year }$2`,
			{ skipBinary: true }
		) )
		.pipe( gulp.dest( workdir ) );
};
