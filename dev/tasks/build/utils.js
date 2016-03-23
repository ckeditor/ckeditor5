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

const fs = require( 'fs' );
const sass = require( 'node-sass' );
const del = require( 'del' );
const minimist = require( 'minimist' );
const sprite = require( 'gulp-svg-sprite' );
const pipe = require( 'multipipe' );
const filter = require( 'gulp-filter' );

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
	 * Saves the files piped into this stream to the `build/` directory.
	 *
	 * @param {String} buildDir The `build/` directory path.
	 * @param {String} format The format of the buildribution (`esnext`, `amd`, or `cjs`).
	 * @returns {Stream}
	 */
	destBuild( buildDir, format ) {
		const destDir = path.join( buildDir, format );

		return gulp.dest( destDir );
	},

	/**
	 * Creates a function generating convertion streams.
	 * Used to generate `formats.reduce()` callback where `formats` is an array of formats that should be generated.
	 *
	 * @param {String} buildDir The `build/` directory path.
	 * @returns {Function}
	 */
	getConversionStreamGenerator( buildDir ) {
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
				utils.destBuild( buildDir, format ),
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
			} else if ( firstFrag == 'theme' ) {
				// Remove 'theme/' from the package dir.
				// console.log( dirFrags );
				// dirFrags.length = 0;
				// dirFrags.splice( 1, 2 );
			} else {
				throw new Error( 'Path should start with "ckeditor5-*/(src|tests|theme)".' );
			}

			file.dirname = path.join.apply( null, dirFrags );
		} );
	},

	/**
	 * Processes paths of files inside the main CKEditor5 package.
	 *
	 * * `src/foo/bar.js` -> `ckeditor5/foo/bar.js`
	 * * `tests/foo/bar.js` -> `tests/ckeditor5/foo/bar.js`
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
			} else if ( firstFrag == 'tests' ) {
				// Insert 'ckeditor5/' after 'tests/'.
				// tests/foo.js -> tests/ckeditor5/foo.js
				dirFrags.splice( 1, 0, 'ckeditor5' );
			} else {
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

		return !dirFrags.some( dirFrag => {
			return dirFrag.startsWith( '_' ) && dirFrag != '_utils-tests';
		} );
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
	},

	/**
	 * Finds all CKEditor5 package directories in "node_modules" folder.
	 *
	 * @param {String} rootDir A root directory containing "node_modules" folder.
	 * @returns {Array} Array of ckeditor5-* package directory paths.
	 */
	getPackages( rootDir ) {
		// Find all CKEditor5 package directories. Resolve symlinks so we watch real directories
		// in order to workaround https://github.com/paulmillr/chokidar/issues/419.
		return fs.readdirSync( path.join( rootDir, 'node_modules' ) )
			// Look for ckeditor5-* directories.
			.filter( ( fileName ) => fileName.indexOf( 'ckeditor5-' ) === 0 )
			// Resolve symlinks and keep only directories.
			.map( ( fileName ) => {
				let filePath = path.join( rootDir, 'node_modules', fileName );
				let stat = fs.lstatSync( filePath );

				if ( stat.isSymbolicLink() ) {
					filePath = fs.realpathSync( filePath );
					stat = fs.lstatSync( filePath );
				}

				if ( stat.isDirectory() ) {
					return filePath;
				}

				// Filter...
				return false;
			} )
			// 					...those out.
			.filter( ( filePath ) => filePath );
	},

	/**
	 * Filters theme entry points only from a stream of SCSS files.
	 *
	 * @returns {Stream}
	 */
	filterThemeEntryPoints() {
		return filter( '**/theme.scss' );
	},

	/**
	 * Given the input stream of theme entry-point files (theme.scss), this method:
	 * 	1. Collects paths to entry-point.
	 * 	2. Builds the output CSS theme file using aggregated entry-points.
	 * 	3. Returns a stream containing built CSS theme file.
	 *
	 * @param {String} fileName The name of the output CSS theme file.
	 * @returns {Stream}
	 */
	compileThemes( fileName ) {
		const paths = [];
		const stream = through.obj( collectThemeEntryPoint, renderThemeFromEntryPoints );

		function collectThemeEntryPoint( file, enc, callback ) {
			paths.push( file.path );

			callback();
		}

		function renderThemeFromEntryPoints( callback ) {
			gutil.log( `Compiling '${ gutil.colors.cyan( fileName ) }' from ${ gutil.colors.cyan( paths.length ) } entry points...` );

			const dataToRender = paths.map( p => `@import '${ p }';` )
				.join( '\n' );

			try {
				const rendered = sass.renderSync( utils.getSassOptions( dataToRender ) );

				stream.push( new gutil.File( {
					path: fileName,
					contents: new Buffer( rendered.css )
				} ) );

				callback();
			} catch ( err ) {
				callback( err );
			}
		}

		return stream;
	},

	/**
	 * Parses command line arguments and returns them as a user-friendly hash.
	 *
	 * @param {String} dataToRender
	 * @returns {Object}
	 */
	getSassOptions( dataToRender ) {
		return {
			data: dataToRender,
			sourceMap: true,
			sourceMapEmbed: true,
			outputStyle: 'expanded',
			sourceComments: true
		};
	},

	/**
	 * Removes files and directories specified by `glob` starting from `rootDir`
	 * and gently informs about deletion.
	 *
	 * @param {String} rootDir The path to the root directory (i.e. "dist/").
	 * @param {String} glob Glob specifying what to clean.
	 * @returns {Promise}
	 */
	clean( rootDir, glob ) {
		return del( path.join( rootDir, glob ) ).then( paths => {
			paths.forEach( p => {
				gutil.log( `Deleted file '${ gutil.colors.cyan( p ) }'.` );
			} );
		} );
	},

	/**
	 * Parses command line arguments and returns them as a user-friendly hash.
	 *
	 * @returns {Object} options
	 * @returns {Array} [options.formats] Array of specified output formats ("esnext" or "amd").
	 * @returns {Boolean} [options.watch] A flag which enables watch mode.
	 */
	parseArguments() {
		const options = minimist( process.argv.slice( 2 ), {
			string: [
				'formats'
			],

			boolean: [
				'watch'
			],

			default: {
				formats: 'amd',
				watch: false
			}
		} );

		options.formats = options.formats.split( ',' );

		return options;
	},

	/**
	 * Given a stream of .svg files it returns a stream containing JavaScript
	 * icon sprite file.
	 *
	 * @returns {Stream}
	 */
	compileIconSprite() {
		return sprite( utils.getIconSpriteOptions() );
	},

	/**
	 * Returns svg-sprite util options to generate <symbol>-based, JavaScript
	 * sprite file.
	 *
	 * @returns {Object}
	 */
	getIconSpriteOptions() {
		return {
			shape: {
				id: {
					generator: name => `ck-icon-${ name.match( /([^\/]*)\.svg$/ )[ 1 ] }`
				},
			},
			svg: {
				xmlDeclaration: false,
				doctypeDeclaration: false,
			},
			mode: {
				symbol: {
					dest: './', // Flatten symbol/
					inline: true,
					render: {
						js: {
							template: path.join( __dirname, 'iconmanagermodel.tpl' ),
							dest: 'iconmanagermodel.js',
						}
					}
				}
			}
		};
	},

	/**
	 * Given a stream of files it returns an array of gulp-mirror streams outputting
	 * files to `build/[formats]/theme/` directories for each of desired output formats (cjs, amd, etc.).
	 *
	 * @param {String} buildDir A path to /build directory.
	 * @param {Array} formats An array of desired output formats.
	 * @param {Function} [transformationStream] A stream used to transform files before they're saved to
	 * desired `build/[formats]/theme` directories. Useful for transpilation.
	 * @returns {Stream[]} An array of streams.
	 */
	getThemeFormatDestStreams( buildDir, formats, transformationStream ) {
		return formats.map( f => {
			return pipe(
				transformationStream ? transformationStream( f ) : utils.noop(),
				gulp.dest( path.join( buildDir, f, 'theme' ) ),
				utils.noop( ( file ) => {
					gutil.log( `Output for ${ gutil.colors.cyan( f ) } is '${ gutil.colors.cyan( file.path ) }'.` );
				} )
			);
		} );
	}
};

module.exports = utils;
