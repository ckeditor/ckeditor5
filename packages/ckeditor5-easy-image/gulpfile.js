/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const gulp = require( 'gulp' );
const ckeditor5Lint = require( '@ckeditor/ckeditor5-dev-lint' );
const options = {
	// Files ignored by `gulp lint` task.
	// Files from .gitignore will be added automatically during task execution.
	ignoredFiles: [
		'src/lib/**'
	]
};

gulp.task( 'lint', () => ckeditor5Lint.lint( options ) );
gulp.task( 'lint-staged', () => ckeditor5Lint.lintStaged( options ) );
gulp.task( 'pre-commit', [ 'lint-staged' ] );
