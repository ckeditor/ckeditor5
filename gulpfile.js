/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint browser: false, node: true, strict: true */

'use strict';

const path = require( 'path' );
const gulp = require( 'gulp' );
const runSequence = require( 'run-sequence' );
const compiler = require( '@ckeditor/ckeditor5-dev-compiler' );

const config = {
	ROOT_DIR: '.',
	MODULE_DIR: {
		amd: './build/modules/amd',
		cjs: './build/modules/cjs',
		esnext: './build/modules/esnext'
	},
	BUNDLE_DIR: './build/dist',
	WORKSPACE_DIR: '..',

	// Path to the default configuration file for bundler.
	BUNDLE_DEFAULT_CONFIG: './dev/bundles/build-config-standard.js',

	DOCUMENTATION: {
		// Path to the built editors.
		BUNDLE_DIR: './build/docs/assets/scripts/samples',
		// Path to the built documentation.
		DESTINATION_DIR: './build/docs',
		// Glob pattern with samples.
		SAMPLES: './docs/samples/**/*.@(md|html|js)'
	},

	// Files ignored by jshint and jscs tasks. Files from .gitignore will be added automatically during tasks execution.
	IGNORED_FILES: [
		'src/lib/**'
	]
};

// Return an array with paths to the CKEditor 5 dependencies.
function getCKEditor5PackagesPaths() {
	return compiler.utils.getPackages( config.ROOT_DIR );
}

// Lint tasks. ---------------------------------------------------------------

const ckeditor5Lint = require( '@ckeditor/ckeditor5-dev-lint' )( config );

gulp.task( 'lint', ckeditor5Lint.lint );
gulp.task( 'lint-staged', ckeditor5Lint.lintStaged );
gulp.task( 'pre-commit', [ 'lint-staged' ] );

// Development environment tasks. ---------------------------------------------

const ckeditor5DevEnv = require( '@ckeditor/ckeditor5-dev-env' )( config );

gulp.task( 'init', ckeditor5DevEnv.initRepository );
gulp.task( 'create-package', ckeditor5DevEnv.createPackage );
gulp.task( 'update', ckeditor5DevEnv.updateRepositories );
gulp.task( 'pull', ckeditor5DevEnv.updateRepositories );
gulp.task( 'status', ckeditor5DevEnv.checkStatus );
gulp.task( 'st', ckeditor5DevEnv.checkStatus );
gulp.task( 'relink', ckeditor5DevEnv.relink );
gulp.task( 'install', ckeditor5DevEnv.installPackage );
gulp.task( 'exec', ckeditor5DevEnv.execOnRepositories );

// Compilation tasks. ---------------------------------------------------------

gulp.task( 'default', [ 'compile' ] );

gulp.task( 'compile', () => {
	const args = compiler.utils.parseArguments();
	const formats = {};

	for ( const item of args.formats ) {
		formats[ item ] = config.MODULE_DIR[ item ];
	}

	return compiler.tasks.compile( {
		formats,
		packages: getCKEditor5PackagesPaths(),
		watch: args.watch,
		es5: args.es5,
		samplesGlob: config.DOCUMENTATION.SAMPLES,
		verbosity: args.verbosity
	} );
} );

// Tasks specific for preparing compiled output with unmodified source files. Used by `gulp docs`.
// TODO: These tasks should be moved directly to ckeditor5-dev-docs.
gulp.task( 'compile:clean:js:esnext', () => {
	return compiler.tasks.clean.js( [ config.MODULE_DIR.esnext ] );
} );

gulp.task( 'compile:clean:themes:esnext', () => {
	return compiler.tasks.clean.themes( [ config.MODULE_DIR.esnext ] );
} );

gulp.task( 'compile:sass:esnext', () => {
	return compiler.tasks.process.sass( {
		formats: { esnext: config.MODULE_DIR.esnext },
		packages: getCKEditor5PackagesPaths()
	} );
} );

gulp.task( 'compile:icons:esnext', () => {
	return compiler.tasks.process.icons( {
		formats: { esnext: config.MODULE_DIR.esnext },
		packages: getCKEditor5PackagesPaths()
	} );
} );

gulp.task( 'compile:js:esnext', [ 'compile:clean:js:esnext' ], () => {
	return compiler.tasks.process.js( {
		formats: { esnext: config.MODULE_DIR.esnext },
		packages: getCKEditor5PackagesPaths()
	} );
} );

gulp.task( 'compile:themes:esnext', ( callback ) => {
	runSequence( 'compile:clean:themes:esnext', 'compile:icons:esnext', 'compile:sass:esnext', callback );
} );

// Building tasks. ------------------------------------------------------------

gulp.task( 'build', () => {
	const bundler = require( '@ckeditor/ckeditor5-dev-bundler-rollup' );

	return bundler.tasks.build( getBuildOptions() );
} );

function getBuildOptions() {
	const minimist = require( 'minimist' );
	const pathToConfig = minimist( process.argv.slice( 2 ) ).config || './build-config';

	return {
		packages: getCKEditor5PackagesPaths(),
		buildConfig: require( path.resolve( '.', pathToConfig ) ),
	};
}

// Documentation. -------------------------------------------------------------

gulp.task( 'docs', [ 'docs:clean', 'compile:js:esnext', 'compile:themes:esnext' ], ( done ) => {
	runSequence( 'docs:build', done );
} );

// Documentation's helpers.
gulp.task( 'docs:clean', () => {
	const docsBuilder = require( '@ckeditor/ckeditor5-dev-docs' ).docs( config );

	return docsBuilder.clean();
} );

gulp.task( 'docs:build', () => {
	const docsBuilder = require( '@ckeditor/ckeditor5-dev-docs' ).docs( config );

	return docsBuilder.buildDocs();
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
	return require( '@ckeditor/ckeditor5-dev-tests' ).parseArguments( process.argv.slice( 2 ) );
}
