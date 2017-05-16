/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const gulp = require( 'gulp' );
const ckeditor5Lint = require( '@ckeditor/ckeditor5-dev-lint' );

gulp.task( 'lint', () => ckeditor5Lint.lint() );
gulp.task( 'lint-staged', () => ckeditor5Lint.lintStaged() );
gulp.task( 'pre-commit', [ 'lint-staged' ] );
