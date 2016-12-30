/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint browser: false, node: true, strict: true */

'use strict';

const gulp = require( 'gulp' );
const ckeditor5Lint = require( '@ckeditor/ckeditor5-dev-lint' )( {
	// Files ignored by `gulp lint` task.
	// Files from .gitignore will be added automatically during task execution.
	ignoredFiles: [
		'src/lib/**'
	]
} );

gulp.task( 'lint', ckeditor5Lint.lint );
gulp.task( 'lint-staged', ckeditor5Lint.lintStaged );
gulp.task( 'pre-commit', [ 'lint-staged' ] );
