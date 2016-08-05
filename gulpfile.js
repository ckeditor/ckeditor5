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

require( './dev/tasks/test/tasks' )( config ).register();

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
gulp.task( 'bundle:clean', ckeditor5DevBundle.cleanFromConfig );
gulp.task( 'bundle:generate',
	[
		'bundle:clean',
		'build:js:esnext',
		'build:themes:esnext'
	],
	ckeditor5DevBundle.generateFromConfig
);
gulp.task( 'bundle:minify:js', ckeditor5DevBundle.minify.jsFromConfig );
gulp.task( 'bundle:minify:css', ckeditor5DevBundle.minify.cssFromConfig );

gulp.task( 'bundle', ( callback ) => {
	runSequence( 'bundle:generate',
		[
			'bundle:minify:js',
			'bundle:minify:css'
		],
		() => ckeditor5DevBundle.showSummaryFromConfig( callback )
	);
} );

// Build tasks.
const ckeditor5DevBuilder = require( 'ckeditor5-dev-builder' )( config );
const builder = ckeditor5DevBuilder.builder;
gulp.task( 'build', callback => {
	runSequence( 'build:clean:all', 'build:themes', 'build:js', callback );
} );

gulp.task( 'build:clean:all', builder.clean.all );
gulp.task( 'build:clean:themes', builder.clean.themes );
gulp.task( 'build:clean:js', () => builder.clean.js() );

gulp.task( 'build:themes', ( callback ) => {
	runSequence( 'build:clean:themes', 'build:icons', 'build:sass', callback );
} );

gulp.task( 'build:sass', () => builder.build.sass() );
gulp.task( 'build:icons', () => builder.build.icons() );
gulp.task( 'build:js', [ 'build:clean:js' ], () => builder.build.js() );

// Tasks specific for preparing build with unmodified source files. Uses by `gulp docs` or `gulp bundle`.
gulp.task( 'build:clean:js:esnext', () => builder.clean.js( { formats: [ 'esnext' ] } ) );
gulp.task( 'build:clean:themes:esnext', () => builder.clean.themes( { formats: [ 'esnext' ] } ) );
gulp.task( 'build:sass:esnext', () => builder.build.sass( { formats: [ 'esnext' ] } ) );
gulp.task( 'build:icons:esnext', () => builder.build.icons( { formats: [ 'esnext' ] } ) );
gulp.task( 'build:js:esnext', [ 'build:clean:js:esnext' ], () => builder.build.js( { formats: [ 'esnext' ] } ) );
gulp.task( 'build:themes:esnext', ( callback ) => {
	runSequence( 'build:clean:themes:esnext', 'build:icons:esnext', 'build:sass:esnext', callback );
} );

// Tasks specific for testing under node.
gulp.task( 'build:clean:js:cjs', () => builder.clean.js( { formats: [ 'cjs' ] } ) );
gulp.task( 'build:js:cjs', [ 'build:clean:js:cjs' ], () => builder.build.js( { formats: [ 'cjs' ] } ) );

// Docs.
const docsBuilder = ckeditor5DevBuilder.docs;
gulp.task( 'docs', [ 'build:js:esnext' ], docsBuilder.buildDocs );
