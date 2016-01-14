/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );

const config = {
	ROOT_DIR: '.',
	DIST_DIR: 'dist',
	WORKSPACE_DIR: '..',

	// Files ignored by jshit and jscs tasks. Files from .gitignore will be added automatically during tasks execution.
	IGNORED_FILES: [ 'lib/**' ]
};

require( './dev/tasks/gulp/build/tasks' )( config );
require( './dev/tasks/gulp/dev/tasks' )( config );
require( './dev/tasks/gulp/lint/tasks' )( config );

gulp.task( 'default', [ 'build' ] );
