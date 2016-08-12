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
	MODULE_DIR: {
		amd: 'build/modules/amd',
		cjs: 'build/modules/cjs',
		esnext: 'build/modules/esnext'
	},
	DOCS_DIR: 'build/docs',
	BUNDLE_DIR: 'build/dist',
	WORKSPACE_DIR: '..',

	// Path to the default configuration file for bundler.
	BUNDLE_DEFAULT_CONFIG: 'dev/bundles/build-config-standard.js',

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
gulp.task( 'default', [ 'compile' ] );
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

// Bundling and building tasks.
const ckeditor5DevBundle = require( 'ckeditor5-dev-bundler-rollup' )( config );
gulp.task( 'bundle:clean', ckeditor5DevBundle.cleanFromConfig );
gulp.task( 'bundle:minify:js', ckeditor5DevBundle.minify.jsFromConfig );
gulp.task( 'bundle:minify:css', ckeditor5DevBundle.minify.cssFromConfig );

gulp.task( 'build:generate',
	[
		'bundle:clean',
		'compile:js:esnext',
		'compile:themes:esnext'
	],
	ckeditor5DevBundle.generateFromConfig
);

gulp.task( 'build', ( callback ) => {
	runSequence( 'build:generate',
		[
			'bundle:minify:js',
			'bundle:minify:css'
		],
		() => ckeditor5DevBundle.showSummaryFromConfig( callback )
	);
} );

// Compile tasks.
const ckeditor5DevCompiler = require( 'ckeditor5-dev-compiler' )( config );
const compiler = ckeditor5DevCompiler.compiler;

gulp.task( 'compile', callback => {
	runSequence( 'compile:clean:all', 'compile:themes', 'compile:js', callback );
} );

// Clean tasks.
gulp.task( 'compile:clean:all', () => compiler.clean.all() );
gulp.task( 'compile:clean:themes', () => compiler.clean.themes() );
gulp.task( 'compile:clean:js', () => compiler.clean.js() );

gulp.task( 'compile:themes', ( callback ) => {
	runSequence( 'compile:clean:themes', 'compile:icons', 'compile:sass', callback );
} );

gulp.task( 'compile:sass', () => compiler.compile.sass() );
gulp.task( 'compile:icons', () => compiler.compile.icons() );
gulp.task( 'compile:js', [ 'compile:clean:js' ], () => compiler.compile.js() );

// Tasks specific for preparing compiled output with unmodified source files. Uses by `gulp docs` or `gulp bundle`.
gulp.task( 'compile:clean:js:esnext', () => compiler.clean.js( { formats: [ 'esnext' ] } ) );
gulp.task( 'compile:clean:themes:esnext', () => compiler.clean.themes( { formats: [ 'esnext' ] } ) );
gulp.task( 'compile:sass:esnext', () => compiler.compile.sass( { formats: [ 'esnext' ] } ) );
gulp.task( 'compile:icons:esnext', () => compiler.compile.icons( { formats: [ 'esnext' ] } ) );
gulp.task( 'compile:js:esnext', [ 'compile:clean:js:esnext' ], () => compiler.compile.js( { formats: [ 'esnext' ] } ) );
gulp.task( 'compile:themes:esnext', ( callback ) => {
	runSequence( 'compile:clean:themes:esnext', 'compile:icons:esnext', 'compile:sass:esnext', callback );
} );

// Tasks specific for testing under node.
gulp.task( 'compile:clean:js:cjs', () => compiler.clean.js( { formats: [ 'cjs' ] } ) );
gulp.task( 'compile:js:cjs', [ 'compile:clean:js:cjs' ], () => compiler.compile.js( { formats: [ 'cjs' ] } ) );

// Docs.
const docsBuilder = ckeditor5DevCompiler.docs;
gulp.task( 'docs', [ 'compile:js:esnext' ], docsBuilder.buildDocs );
