/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );

const config = {
	ROOT_DIR: '.',
	DIST_DIR: 'dist',
	WORKSPACE_DIR: '..'
};

require( './dev/tasks/gulp/build/tasks' )( config );
require( './dev/tasks/gulp/dev/tasks' )( config );

gulp.task( 'default', [ 'build' ] );
