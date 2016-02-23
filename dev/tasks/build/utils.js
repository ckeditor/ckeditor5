/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const gulp = require( 'gulp' );
const rename = require( 'gulp-rename' );
const gulpBabel = require( 'gulp-babel' );
const gutil = require( 'gulp-util' );
const gulpFilter = require( 'gulp-filter' );
const multipipe = require( 'multipipe' );
const PassThrough = require( 'stream' ).PassThrough;
const through = require( 'through2' );

const utils = {
	/**
	 * Code which can be appended to a transpiled (into AMD) test files in order to
	 * load the 'tests' module and defer launching Bender until it's ready.
	 *
	 * Note: This code will not be transpiled so keep it in ES5.
	 */
	benderLauncherCode:
`
require( [ 'tests' ], bender.defer(), function( err ) {
	// The problem with Require.JS is that there are no stacktraces if we won't log this.
	console.error( err );
	console.log( err.stack );
} );
`,

	/**
	 * Module formats supported by the builder.
	 */
	SUPPORTED_FORMATS: [ 'esnext', 'amd', 'cjs' ],

	/**
	 * Creates a simple duplex stream.
	 *
	 * @param {Function} [callback] A callback which will be executed with each chunk.
	 * @returns {Stream}
	 */
	noop( callback ) {
		if ( !callback ) {
			return new PassThrough( { objectMode: true } );
		}

		return through( { objectMode: true }, ( file, encoding, throughCallback ) => {
			callback( file );

			throughCallback( null, file );
		} );
	},

	/**
	 * Saves the files piped into this stream to the `dist/` directory.
	 *
	 * @param {String} distDir The `dist/` directory path.
	 * @param {String} format The format of the distribution (`esnext`, `amd`, or `cjs`).
	 * @returns {Stream}
	 */
	dist( distDir, format ) {
		const destDir = path.join( distDir, format );

		return gulp.dest( destDir );
	},

	/**
	 * Creates a function generating convertion streams.
	 * Used to generate `formats.reduce()` callback where `formats` is an array of formats that should be generated.
	 *
	 * @param {String} distDir The `dist/` directory path.
	 * @returns {Function}
	 */
	getConversionStreamGenerator( distDir ) {
		return ( pipes, format ) => {
			const conversionPipes = [];

			conversionPipes.push( utils.pickVersionedFile( format ) );

			if ( format != 'esnext' ) {
				// Convert src files.
				const filterSource = gulpFilter( ( file ) => {
					return utils.isSourceFile( file ) && utils.isJSFile( file );
				}, { restore: true } );
				const transpileSource = utils.transpile( format, utils.getBabelOptionsForSource( format ) );
				conversionPipes.push(
					filterSource,
					transpileSource,
					filterSource.restore
				);

				// Convert test files.
				const filterTests = gulpFilter( ( file ) => {
					return utils.isTestFile( file ) && utils.isJSFile( file );
				}, { restore: true } );
				const transpileTests = utils.transpile( format, utils.getBabelOptionsForTests( format ) );
				conversionPipes.push(
					filterTests,
					transpileTests,
					utils.appendBenderLauncher(),
					filterTests.restore
				);
			}

			conversionPipes.push(
				utils.dist( distDir, format ),
				utils.noop( ( file ) => {
					gutil.log( `Finished writing '${ gutil.colors.cyan( file.path ) }'` );
				} )
			);

			pipes.push( multipipe.apply( null, conversionPipes ) );

			return pipes;
		};
	},

	/**
	 * Transpiles files piped into this stream to the given format (`amd` or `cjs`).
	 *
	 * @param {String} format
	 * @returns {Stream}
	 */
	transpile( format, options ) {
		return gulpBabel( options )
			.on( 'error', function( err ) {
				gutil.log( gutil.colors.red( `Error (Babel:${ format })` ) );
				gutil.log( gutil.colors.red( err.message ) );
				console.log( '\n' + err.codeFrame + '\n' );
			} );
	},

	/**
	 * Returns an object with Babel options for the source code.
	 *
	 * @param {String} format
	 * @returns {Object} options
	 */
	getBabelOptionsForSource( format ) {
		return {
			plugins: utils.getBabelPlugins( format ),
			// Ensure that all paths ends with '.js' because Require.JS (unlike Common.JS/System.JS)
			// will not add it to module names which look like paths.
			resolveModuleSource: utils.appendModuleExtension
		};
	},

	/**
	 * Returns an object with Babel options for the test code.
	 *
	 * @param {String} format
	 * @returns {Object} options
	 */
	getBabelOptionsForTests( format ) {
		return {
			plugins: utils.getBabelPlugins( format ),
			resolveModuleSource: utils.appendModuleExtension,
			moduleIds: true,
			moduleId: 'tests'
		};
	},

	/**
	 * Returns an array of Babel plugins to use.
	 *
	 * @param {String} format
	 * @returns {Array}
	 */
	getBabelPlugins( format ) {
		const babelModuleTranspilers = {
			amd: 'amd',
			cjs: 'commonjs'
		};
		const babelModuleTranspiler = babelModuleTranspilers[ format ];

		if ( !babelModuleTranspiler ) {
			throw new Error( `Incorrect format: ${ format }` );
		}

		return [
			// Note: When plugin is specified by its name, Babel loads it from a context of a
			// currently transpiled file (in our case - e.g. from ckeditor5-core/src/foo.js).
			// Obviously that fails, since we have all the plugins installed only in ckeditor5/
			// and we want to have them only there to avoid installing them dozens of times.
			//
			// Anyway, I haven't found in the docs that you can also pass a plugin instance here,
			// but it works... so let's hope it will.
			require( `babel-plugin-transform-es2015-modules-${ babelModuleTranspiler }` )
		];
	},

	/**
	 * Appends the {@link #benderLauncherCode} at the end of the file.
	 *
	 * @returns {Stream}
	 */
	appendBenderLauncher() {
		return through( { objectMode: true }, ( file, encoding, callback ) => {
			if ( !file.isNull() ) {
				file.contents = new Buffer( file.contents.toString() + utils.benderLauncherCode );
			}

			callback( null, file );
		} );
	},

	/**
	 * Allows us to pick one of files suffixed with the format (`__esnext`, `__amd`, or `__cjs`) and removes
	 * files with other suffixes from the stream.
	 *
	 * For example: we have `load__esnext.js`, `load__amd.js` and `load__cjs.js`. After applying this
	 * transformation when compiling code for a specific format the proper file will be renamed to `load.js`.
	 * Files not matching a specified format will be removed.
	 *
	 * @param {String} format
	 * @returns {Stream}
	 */
	pickVersionedFile( format ) {
		const rejectedFormats = utils.SUPPORTED_FORMATS
			.filter( ( item ) => item !== format );
		const pickRegexp = new RegExp( `__${ format }$` );
		const rejectRegexp = new RegExp( `__(${ rejectedFormats.join( '|' ) }).js$` );

		const pick = rename( ( path ) => {
			path.basename = path.basename.replace( pickRegexp, '' );
		} );
		const remove = gulpFilter( ( file ) => !rejectRegexp.test( file.path ) );

		return multipipe( pick, remove );
	},

	/**
	 * Processes paths of files inside CKEditor5 packages.
	 *
	 * * `ckeditor5-xxx/src/foo/bar.js` -> `ckeditor5/xxx/foo/bar.js`
	 * * `ckeditor5-xxx/tests/foo/bar.js` -> `tests/xxx/foo/bar.js`
	 *
	 * @returns {Stream}
	 */
	renamePackageFiles() {
		return rename( ( file ) => {
			const dirFrags = file.dirname.split( path.sep );

			// Validate the input for the clear conscious.

			if ( dirFrags[ 0 ].indexOf( 'ckeditor5-' ) !== 0 ) {
				throw new Error( 'Path should start with "ckeditor5-".' );
			}

			dirFrags[ 0 ] = dirFrags[ 0 ].replace( /^ckeditor5-/, '' );

			const firstFrag = dirFrags[ 1 ];

			if ( firstFrag == 'src' ) {
				// Remove 'src/'.
				dirFrags.splice( 1, 1 );

				// Temporary implementation of the UI lib option. See #88.
				if ( dirFrags[ 0 ] == 'ui-default' ) {
					dirFrags[ 0 ] = 'ui';
				}

				// And prepend 'ckeditor5/'.
				dirFrags.unshift( 'ckeditor5' );
			} else if ( firstFrag == 'tests' ) {
				// Remove 'tests/' from the package dir.
				dirFrags.splice( 1, 1 );

				// And prepend 'tests/'.
				dirFrags.unshift( 'tests' );
			} else {
				throw new Error( 'Path should start with "ckeditor5-*/(src|tests)".' );
			}

			file.dirname = path.join.apply( null, dirFrags );
		} );
	},

	/**
	 * Processes paths of files inside the main CKEditor5 package.
	 *
	 * * `src/foo/bar.js` -> `ckeditor5/foo/bar.js`
	 * * `tests/foo/bar.js` -> `tests/foo/bar.js`
	 *
	 * @returns {Stream}
	 */
	renameCKEditor5Files() {
		return rename( ( file ) => {
			const dirFrags = file.dirname.split( path.sep );
			const firstFrag = dirFrags[ 0 ];

			if ( firstFrag == 'src' ) {
				// Replace 'src/' with 'ckeditor5/'.
				// src/path.js -> ckeditor5/path.js
				dirFrags.splice( 0, 1, 'ckeditor5' );
			} else if ( firstFrag != 'tests' ) {
				throw new Error( 'Path should start with "src" or "tests".' );
			}

			file.dirname = path.join.apply( null, dirFrags );
		} );
	},

	/**
	 * Appends file extension to file URLs. Tries to not touch named modules.
	 *
	 * @param {String} source
	 * @returns {String}
	 */
	appendModuleExtension( source ) {
		if ( /^https?:|\.[\/\\]/.test( source ) && !/\.js$/.test( source ) ) {
			return source + '.js';
		}

		return source;
	},

	/**
	 * Checks whether a file is a test file.
	 *
	 * @param {Vinyl} file
	 * @returns {Boolean}
	 */
	isTestFile( file ) {
		// TODO this should be based on bender configuration (config.tests.*.paths).
		if ( !file.relative.startsWith( 'tests' + path.sep ) ) {
			return false;
		}

		const dirFrags = file.relative.split( path.sep );

		return !dirFrags.some( dirFrag => dirFrag.startsWith( '_' ) );
	},

	/**
	 * Checks whether a file is a source file.
	 *
	 * @param {Vinyl} file
	 * @returns {Boolean}
	 */
	isSourceFile( file ) {
		return !utils.isTestFile( file );
	},

	/**
	 * Checks whether a file is a JS file.
	 *
	 * @param {Vinyl} file
	 * @returns {Boolean}
	 */
	isJSFile( file ) {
		return file.path.endsWith( '.js' );
	}
};

module.exports = utils;
