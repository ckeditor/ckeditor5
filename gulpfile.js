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
	BUNDLE_DIR: 'build/dist',
	WORKSPACE_DIR: '..',

	// Path to the default configuration file for bundler.
	BUNDLE_DEFAULT_CONFIG: 'dev/bundles/build-config-standard.js',

	DOCUMENTATION: {
		// Path to the temporary documentation files.
		SOURCE_DIR: '.docs',
		// Path to the built documentation.
		DESTINATION_DIR: 'build/docs',
		// Glob pattern with samples.
		SAMPLES: 'docs/samples/**/*.@(md|html|js)',
		// Glob pattern with guides.
		GUIDES: 'docs/guides/**/*.md'
	},

	// Files ignored by jshint and jscs tasks. Files from .gitignore will be added automatically during tasks execution.
	IGNORED_FILES: [
		'src/lib/**'
	]
};

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

const ckeditor5DevCompiler = require( '@ckeditor/ckeditor5-dev-compiler' );
const compiler = ckeditor5DevCompiler.compiler( config );

gulp.task( 'default', [ 'compile' ] );

gulp.task( 'compile', callback => {
	runSequence( 'compile:clean:all', 'compile:themes', 'compile:js', callback );
} );

gulp.task( 'compile:bundled-sample-tests', [ 'compile:bundled-sample-tests:build-editors' ],
	() => compiler.compile.bundledSampleTests() );

// Helpers. ---------------------------

gulp.task( 'compile:clean:all', () => compiler.clean.all() );
gulp.task( 'compile:clean:themes', () => compiler.clean.themes() );
gulp.task( 'compile:clean:js', () => compiler.clean.js() );

gulp.task( 'compile:themes', callback => {
	runSequence( 'compile:clean:themes', 'compile:icons', 'compile:sass', callback );
} );

gulp.task( 'compile:sass', () => compiler.compile.sass() );
gulp.task( 'compile:icons', () => compiler.compile.icons() );
gulp.task( 'compile:js', [ 'compile:clean:js' ], () => compiler.compile.js() );

// Tasks specific for preparing compiled output with unmodified source files. Used by `gulp docs` or `gulp build`.
gulp.task( 'compile:clean:js:esnext', () => compiler.clean.js( { formats: [ 'esnext' ] } ) );
gulp.task( 'compile:clean:themes:esnext', () => compiler.clean.themes( { formats: [ 'esnext' ] } ) );
gulp.task( 'compile:sass:esnext', () => compiler.compile.sass( { formats: [ 'esnext' ] } ) );
gulp.task( 'compile:icons:esnext', () => compiler.compile.icons( { formats: [ 'esnext' ] } ) );
gulp.task( 'compile:js:esnext', [ 'compile:clean:js:esnext' ], () => compiler.compile.js( { formats: [ 'esnext' ] } ) );
gulp.task( 'compile:themes:esnext', callback => {
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

// Task specific for building editors for testing releases.
gulp.task( 'compile:bundled-sample-tests:build-editors',
	[
		'compile:js:esnext',
		'compile:themes:esnext'
	],
	buildEditorsForSamples
);

// Documentation. -------------------------------------------------------------

const docsBuilder = require( '@ckeditor/ckeditor5-dev-docs' )( config );

gulp.task( 'docs', [ 'compile:js:esnext', 'docs:prepare' ], docsBuilder.buildDocs );
gulp.task( 'docs:prepare', docsBuilder.collectDocumentationFiles );

// Testing. -------------------------------------------------------------------

// TODO The below code is here only temporarily. It will be extracted to a separate package
// once we'll understand better where it should belong. Right now it's somewhere beyond testing
// environment, compilation and documentation.

/**
 * Prepares configurations for bundler based on sample files and builds editors
 * based on prepared configuration.
 *
 * You can find more details in: https://github.com/ckeditor/ckeditor5/issues/260
 *
 * @returns {Stream}
 */
function buildEditorsForSamples() {
	const { utils: compilerUtils } = require( '@ckeditor/ckeditor5-dev-compiler' );
	const { stream, tools } = require( '@ckeditor/ckeditor5-dev-utils' );

	const gulpFilter = require( 'gulp-filter' );
	const gulpRename = require( 'gulp-rename' );
	const path = require( 'path' );

	const bundleDir = path.join( config.ROOT_DIR, config.BUNDLE_DIR );

	return compilerUtils.getFilesStream( config.ROOT_DIR, config.DOCUMENTATION.SAMPLES )
		.pipe( gulpFilter( ( file ) => path.extname( file.path ) === '.js' ) )
		.pipe( gulpRename( ( file ) => {
			file.dirname = file.dirname.replace( '/docs/samples', '' );
		} ) )
		.pipe( stream.noop( ( file ) => {
			const contents = file.contents.toString( 'utf-8' );
			const bundleConfig = {};

			// Prepare the config based on sample.

			bundleConfig.format = 'iife';

			// Find `moduleName` from line which ends with "// editor:name".
			bundleConfig.moduleName = contents.match( /([a-z]+)\.create(.*)\/\/ ?editor:name/i )[ 1 ];

			// Find `editor` from line which ends with "// editor:module".
			bundleConfig.editor = contents.match( /([-a-z0-9]+\/[-a-z0-9]+)(\.js)?'; ?\/\/ ?editor:module/i )[ 1 ];

			// Find `features` from line which ends with "// editor:features".
			bundleConfig.features = contents.match( /(\[[^\]]+\]),? ?\/\/ ?(.*)editor:features/i )[ 1 ]
				.match( /([a-z-\/]+)/gi );

			// Extract `path` from Sample's path.
			bundleConfig.path = file.path.match( /ckeditor5-(.*)\.js$/ )[ 1 ];

			const splitPath = bundleConfig.path.split( path.sep );
			const packageName = splitPath[ 0 ];

			// Clean the output paths.
			return ckeditor5DevBundler.clean( bundleConfig )
				// Then bundle a editor.
				.then( () => ckeditor5DevBundler.generate( bundleConfig ) )
				// Then copy created files.
				.then( () => {
					const beginPath = splitPath.slice( 1, -1 ).join( path.sep ) || '.';
					const fileName = splitPath.slice( -1 ).join();
					const builtEditorPath = path.join( bundleDir, bundleConfig.path, bundleConfig.moduleName );
					const destinationPath = path.join.apply( null, [
						config.MODULE_DIR.amd,
						'tests',
						packageName,
						'samples',
						beginPath,
						'_assets',
						fileName
					] );

					// Copy editor builds to proper directory.
					return Promise.all( [
						tools.copyFile( `${ builtEditorPath }.js`, destinationPath ),
						tools.copyFile( `${ builtEditorPath }.css`, destinationPath )
					] );
				} )
				// And clean up.
				.then( () => tools.clean( path.join( config.BUNDLE_DIR, packageName, '..' ), packageName ) );
		} ) );
}
