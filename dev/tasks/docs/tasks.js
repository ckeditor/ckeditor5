/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const jsdoc = require( 'gulp-jsdoc3' );

module.exports = () => {
	gulp.task( 'docs', [ 'build-esnext' ], function( cb ) {
		const config = require( './jsdoc.json' );

		// Add the readme to the output.
		gulp.src( [ 'README.md' ], { read: false } )
			.pipe( jsdoc( config, cb ) );
	} );
};
