/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint browser: false, node: true, strict: true */

'use strict';

const gulp = require( 'gulp' );
const runSequence = require( 'run-sequence' );

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

require( './dev/tasks/build/tasks' )( config ).register();
require( './dev/tasks/test/tasks' )( config ).register();
require( './dev/tasks/docs/tasks' )( config ).register();

// Lint tasks.
const ckeditor5Lint = require( 'ckeditor5-dev-lint' )( config );
gulp.task( 'lint', ckeditor5Lint.lint );
gulp.task( 'lint-staged', ckeditor5Lint.lintStaged );
gulp.task( 'default', [ 'build' ] );
gulp.task( 'pre-commit', [ 'lint-staged' ] );

// Development environment tasks.
const ckeditor5DevEnv = require( 'ckeditor5-dev-env' )( config );
gulp.task( 'init', ckeditor5DevEnv.initRepository );
gulp.task( 'create-package', ckeditor5DevEnv.createPackage );
gulp.task( 'update', ckeditor5DevEnv.updateRepositories );
gulp.task( 'pull', ckeditor5DevEnv.updateRepositories );
gulp.task( 'status', ckeditor5DevEnv.checkStatus );
gulp.task( 'st', ckeditor5DevEnv.checkStatus );
gulp.task( 'relink', ckeditor5DevEnv.relink );
gulp.task( 'install', ckeditor5DevEnv.installPackage );
gulp.task( 'exec', ckeditor5DevEnv.execOnRepositories );

// Bundling tasks.
const ckeditor5DevBundle = require( 'ckeditor5-dev-bundler-rollup' )( config );
gulp.task( 'bundle:clean', ckeditor5DevBundle.clean );
gulp.task( 'bundle:generate',
	[
		'bundle:clean',
		'build:js:esnext',
		'build:themes:esnext'
	],
	ckeditor5DevBundle.generateFromConfig
);
gulp.task( 'bundle:minify:js', ckeditor5DevBundle.minify.js );
gulp.task( 'bundle:minify:css', ckeditor5DevBundle.minify.css );

gulp.task( 'bundle', ( callback ) => {
	runSequence( 'bundle:generate',
		[
			'bundle:minify:js',
			'bundle:minify:css'
		],
		() => ckeditor5DevBundle.showSummary( callback )
	);
} );
