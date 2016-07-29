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

require( './dev/tasks/bundle/tasks' )( config ).register();
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

// Build tasks.
const ckeditor5DevBuilder = require( 'ckeditor5-dev-builder' )( config );
gulp.task( 'build', callback => {
	runSequence( 'build:clean:all', 'build:themes', 'build:js', callback );
} );

gulp.task( 'build:clean:all', ckeditor5DevBuilder.clean.all );
gulp.task( 'build:clean:themes', ckeditor5DevBuilder.clean.themes );
gulp.task( 'build:clean:js', () => ckeditor5DevBuilder.clean.js() );

gulp.task( 'build:themes', ( callback ) => {
	runSequence( 'build:clean:themes', 'build:icons', 'build:sass', callback );
} );

gulp.task( 'build:sass', () => ckeditor5DevBuilder.build.sass() );
gulp.task( 'build:icons', () => ckeditor5DevBuilder.build.icons() );
gulp.task( 'build:js', [ 'build:clean:js' ], () => ckeditor5DevBuilder.build.js() );

// Tasks specific for preparing build with unmodified source files. Uses by `gulp docs` or `gulp bundle`.
gulp.task( 'build:clean:js:esnext', () => ckeditor5DevBuilder.clean.js( { formats: [ 'esnext' ] } ) );
gulp.task( 'build:clean:themes:esnext', () => ckeditor5DevBuilder.clean.themes( { formats: [ 'esnext' ] } ) );
gulp.task( 'build:sass:esnext', () => ckeditor5DevBuilder.build.sass( { formats: [ 'esnext' ] } ) );
gulp.task( 'build:icons:esnext', () => ckeditor5DevBuilder.build.icons( { formats: [ 'esnext' ] } ) );
gulp.task( 'build:js:esnext', [ 'build:clean:js:esnext' ], () => ckeditor5DevBuilder.build.js( { formats: [ 'esnext' ] } ) );
gulp.task( 'build:themes:esnext', ( callback ) => {
	runSequence( 'build:clean:themes:esnext', 'build:icons:esnext', 'build:sass:esnext', callback );
} );

// Tasks specific for testing under node.
gulp.task( 'build:clean:js:cjs', () => ckeditor5DevBuilder.clean.js( { formats: [ 'cjs' ] } ) );
gulp.task( 'build:js:cjs', [ 'build:clean:js:cjs' ], () => ckeditor5DevBuilder.build.js( { formats: [ 'cjs' ] } ) );
