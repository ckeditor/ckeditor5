/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );

const config = {
	ROOT_DIR: '.',
	DIST_DIR: 'dist'
};

require( './dev/tasks/gulp/build/tasks' )( config );

gulp.task( 'default', [ 'build' ] );
