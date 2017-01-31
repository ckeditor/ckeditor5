/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const gulp = require( 'gulp' );

// Lint tasks. ---------------------------------------------------------------

const ckeditor5Lint = require( '@ckeditor/ckeditor5-dev-lint' )();

gulp.task( 'lint', ckeditor5Lint.lint );
gulp.task( 'lint-staged', ckeditor5Lint.lintStaged );
gulp.task( 'pre-commit', [ 'lint-staged' ] );

// Documentation. -------------------------------------------------------------

gulp.task( 'docs', () => {
	return require( '@ckeditor/ckeditor5-dev-docs' )
		.build( {
			readmePath: path.join( process.cwd(), 'README.md' ),
			sourceFiles: [
				process.cwd() + '/packages/ckeditor5-*/src/**/*.@(js|jsdoc)',
				'!' + process.cwd() + '/packages/ckeditor5-*/src/lib/**/*.js'
			],
			destinationPath: path.join( process.cwd(), 'build', 'docs' )
		} );
} );

// Tests. ---------------------------------------------------------------------

gulp.task( 'test', () => {
	return require( '@ckeditor/ckeditor5-dev-tests' )
		.runAutomatedTests( getTestOptions() );
} );

gulp.task( 'test:manual', () => {
	return require( '@ckeditor/ckeditor5-dev-tests' )
		.runManualTests( getTestOptions() );
} );

function getTestOptions() {
	return require( '@ckeditor/ckeditor5-dev-tests' )
		.parseArguments( process.argv.slice( 2 ) );
}

// Translations ----------------------------------------------------------------

gulp.task( 'translations:collect', () => {
	return require( '@ckeditor/ckeditor5-dev-env' ).collectTranslations();
} );

gulp.task( 'translations:upload', () => {
	return require( '@ckeditor/ckeditor5-dev-env' ).uploadTranslations();
} );

gulp.task( 'translations:download', () => {
	return require( '@ckeditor/ckeditor5-dev-env' ).downloadTranslations();
} );
