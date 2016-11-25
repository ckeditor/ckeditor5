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

// Tasks specific for preparing compiled output with unmodified source files. Used by `gulp docs` or `gulp build`.
// Todo: These tasks should be moved direct to Docs and Bundler.
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

const ckeditor5DevBundler = require( '@ckeditor/ckeditor5-dev-bundler-rollup' )( config );

gulp.task( 'build', callback => {
	runSequence(
		'bundle:generate',
		[
			'bundle:minify:js',
			'bundle:minify:css'
		],
		() => ckeditor5DevBundler.showSummaryFromConfig( callback )
	);
} );

// Helpers. ---------------------------

gulp.task( 'bundle:clean', ckeditor5DevBundler.cleanFromConfig );
gulp.task( 'bundle:minify:js', ckeditor5DevBundler.minify.jsFromConfig );
gulp.task( 'bundle:minify:css', ckeditor5DevBundler.minify.cssFromConfig );

// Generates the bundle without minifying it.
gulp.task( 'bundle:generate',
	[
		'bundle:clean',
		'compile:js:esnext',
		'compile:themes:esnext'
	],
	ckeditor5DevBundler.generateFromConfig
);

// Documentation. -------------------------------------------------------------

const ckeditor5DevDocs = require( '@ckeditor/ckeditor5-dev-docs' );
const docsBuilder = ckeditor5DevDocs.docs( config );

gulp.task( 'docs', [ 'docs:clean', 'compile:js:esnext' ], ( done ) => {
	runSequence( 'docs:editors', 'docs:build', done );
} );

// Documentation's helpers.
gulp.task( 'docs:clean', docsBuilder.clean );
gulp.task( 'docs:build', docsBuilder.buildDocs );
gulp.task( 'docs:editors', [ 'compile:js:esnext', 'compile:themes:esnext' ], () => {
	return docsBuilder.buildEditorsForSamples( getCKEditor5PackagesPaths(), config.DOCUMENTATION.SAMPLES );
} );

// Tests. ---------------------------------------------------------------------

const tests = require( '@ckeditor/ckeditor5-dev-tests' );

gulp.task( 'test', () => {
	return tests.tasks.test( getTestOptions() );
} );

// Requires compiled sources. Task should be used in parallel with `gulp compile --formats=esnext --watch`.
gulp.task( 'test:server', () => {
	const options = getTestOptions();
	options.sourcePath = path.resolve( config.MODULE_DIR.esnext );

	return tests.tasks.runTests( options );
} );

gulp.task( 'test:manual', ( done ) => {
	tests.tasks.manualTests.run( {
		packages: getCKEditor5PackagesPaths(),
		destinationPath: path.resolve( config.ROOT_DIR, '.manual' ),
	}, done );
} );

function getTestOptions() {
	const options = tests.utils.parseArguments();

	options.packages = getCKEditor5PackagesPaths();

	// If --paths weren't specified, then test all packages.
	if ( !options.paths ) {
		options.paths = options.packages
			.map( ( packagePath ) => tests.utils.getPackageName( path.resolve( packagePath ) ) );
	}

	return options;
}
