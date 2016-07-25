/* jshint browser: false, node: true, strict: true */

'use strict';

const gulp = require( 'gulp' );

const config = {
	ROOT_DIR: '.',
	WORKSPACE_DIR: '..',

	// Files ignored by jshint and jscs tasks. Files from .gitignore will be added automatically during tasks execution.
	IGNORED_FILES: [
		'src/lib/**'
	]
};

const ckeditor5Lint = require( 'ckeditor5-dev-task-lint' )( config );

gulp.task( 'lint', ckeditor5Lint.lint );
gulp.task( 'lint-staged', ckeditor5Lint.lintStaged );
gulp.task( 'pre-commit', [ 'lint-staged' ] );
