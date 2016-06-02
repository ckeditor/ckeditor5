/* jshint node: true */

'use strict';

const gulp = require( 'gulp' );

const config = {
	ROOT_DIR: '.',
	BUILD_DIR: 'build',
	WORKSPACE_DIR: '..',

	// Files ignored by jshint and jscs tasks. Files from .gitignore will be added automatically during tasks execution.
	IGNORED_FILES: [
		'src/lib/**'
	]
};

require( './dev/tasks/build/tasks' )( config );
require( './dev/tasks/dev/tasks' )( config );
require( './dev/tasks/lint/tasks' )( config );
require( './dev/tasks/test/tasks' )( config );
require( './dev/tasks/docs/tasks' )( config );

gulp.task( 'default', [ 'build' ] );
gulp.task( 'pre-commit', [ 'lint-staged' ] );

// Required to check registered tasks
module.exports = gulp;
