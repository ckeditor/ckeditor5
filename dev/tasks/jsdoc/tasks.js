/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );
const jsdoc = require( 'gulp-jsdoc3' );

module.exports = () => {
	gulp.task( 'docs', [ 'build-esnext' ], function( cb ) {
		let config = require( './jsdoc.json' );

		// Add readme to output
		gulp.src( [ 'README.md' ], { read: false } )
			.pipe( jsdoc( config, cb ) );
	} );
};
