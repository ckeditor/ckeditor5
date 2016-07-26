/* jshint browser: false, node: true, strict: true */

'use strict';

const gulp = require( 'gulp' );

const config = {
	ROOT_DIR: '.',
	BUILD_DIR: 'build',
	BUNDLE_DIR: 'bundle',
	WORKSPACE_DIR: '..',

	// Files ignored by jshint and jscs tasks. Files from .gitignore will be added automatically during tasks execution.
	IGNORED_FILES: [
		'src/lib/**'
	]
};

const ckeditor5Lint = require( 'ckeditor5-dev-lint' )( config );

require( './dev/tasks/build/tasks' )( config ).register();
require( './dev/tasks/bundle/tasks' )( config ).register();
require( './dev/tasks/dev/tasks' )( config ).register();
require( './dev/tasks/test/tasks' )( config ).register();
require( './dev/tasks/docs/tasks' )( config ).register();
require( './dev/tasks/exec/tasks' )( config ).register();

gulp.task( 'lint', ckeditor5Lint.lint );
gulp.task( 'lint-staged', ckeditor5Lint.lintStaged );
gulp.task( 'default', [ 'build' ] );
gulp.task( 'pre-commit', [ 'lint-staged' ] );
