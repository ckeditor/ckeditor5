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

// Development environment tasks. ---------------------------------------------

const ckeditor5DevEnv = require( '@ckeditor/ckeditor5-dev-env' )( {
	workspaceDir: '..'
} );

gulp.task( 'init', ckeditor5DevEnv.initRepository );
gulp.task( 'create-package', ckeditor5DevEnv.createPackage );
gulp.task( 'update', ckeditor5DevEnv.updateRepositories );
gulp.task( 'pull', ckeditor5DevEnv.updateRepositories );
gulp.task( 'status', ckeditor5DevEnv.checkStatus );
gulp.task( 'st', ckeditor5DevEnv.checkStatus );
gulp.task( 'relink', ckeditor5DevEnv.relink );
gulp.task( 'install', ckeditor5DevEnv.installPackage );
gulp.task( 'exec', ckeditor5DevEnv.execOnRepositories );

// Documentation. -------------------------------------------------------------

gulp.task( 'docs', () => {
	return require( '@ckeditor/ckeditor5-dev-docs' )
		.build( {
			readmePath: path.join( process.cwd(), 'README.md' ),
			sourceFiles: [
				process.cwd() + '/node_modules/ckeditor5-*/src/**/*.@(js|jsdoc)',
				'!' + process.cwd() + '/node_modules/ckeditor5-*/src/lib/**/*.js'
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
