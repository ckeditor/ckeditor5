/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );

const config = {
	ROOT_DIR: '.',
	DIST_DIR: 'dist',
	WORKSPACE_DIR: '..',

	// Files ignored by jshit and jscs tasks. Files from .gitignore will be added automatically during tasks execution.
	IGNORED_FILES: [ 'src/lib/**' ]
};

require( './dev/tasks/build/tasks' )( config );
require( './dev/tasks/dev/tasks' )( config );
require( './dev/tasks/lint/tasks' )( config );

gulp.task( 'default', [ 'build' ] );
gulp.task( 'pre-commit', [ 'lint-staged' ] );
