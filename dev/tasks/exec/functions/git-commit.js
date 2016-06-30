/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

 'use strict';

const gulp = require( 'gulp' );
const path = require( 'path' );

/**
 * {String} workdir
 */
module.exports = ( workdir ) => {
	const glob = path.join( workdir, '**/*' );

	return gulp.src( glob )
		.pipe( gulp.dest( workdir ) );
};
