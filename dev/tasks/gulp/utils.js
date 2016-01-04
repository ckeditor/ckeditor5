/* jshint node: true, esnext: true */

'use strict';

const path = require( 'path' );
const gulp = require( 'gulp' );
const rename = require( 'gulp-rename' );
const babel = require( 'gulp-babel' );
const gulpWatch = require( 'gulp-watch' );
const gulpPlumber = require( 'gulp-plumber' );
const gutil = require( 'gulp-util' );
const multipipe = require( 'multipipe' );
const PassThrough = require( 'stream' ).PassThrough;

const utils = {
	/**
	 * Creates a pass-through stream.
	 *
	 * @returns {Stream}
	 */
	noop() {
		return new PassThrough( { objectMode: true } );
	},

	/**
	 * Transforms a stream of files into a watched stream of files.
	 *
	 * @param {String} glob The glob pattern to watch.
	 * @param {Object} opts Gulp watcher opts.
	 * @returns {Stream}
	 */
	watch( glob, opts ) {
		return multipipe(
			// Note: we're using plumber only when watching. In other cases we should fail quickly and loudly.
			gulpPlumber(),
			gulpWatch( glob, opts )
		);
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
	 * Transpiles files piped into this stream to the given format (`amd` or `cjs`).
	 *
	 * @param {String} format
	 * @returns {Stream}
	 */
	transpile( format ) {
		const babelModuleTranspilers = {
			amd: 'amd',
			cjs: 'commonjs'
		};
		const babelModuleTranspiler = babelModuleTranspilers[ format ];

		if ( !babelModuleTranspiler ) {
			throw new Error( `Incorrect format: ${ format }` );
		}

		return babel( {
			plugins: [
				// Note: When plugin is specified by its name, Babel loads it from a context of a
				// currently transpiled file (in our case - e.g. from ckeditor5-core/src/foo.js).
				// Obviously that fails, since we have all the plugins installed only in ckeditor5/
				// and we want to have them only there to avoid installing them dozens of times.
				//
				// Anyway, I haven't found in the docs that you can also pass a plugin instance here,
				// but it works... so let's hope it will.
				require( `babel-plugin-transform-es2015-modules-${ babelModuleTranspiler }` )
			],
			// Ensure that all paths ends with '.js' because Require.JS (unlike Common.JS/System.JS)
			// will not add it to module names which look like paths.
			resolveModuleSource: ( source ) => {
				return utils.appendModuleExtension( source );
			}
		} );
	},

	/**
	 * Creates a function adding transpilation pipes to the `pipes` param.
	 * Used to generate `formats.reduce()` callback where `formats` is an array
	 * of formats that should be generated.
	 *
	 * @param {String} distDir The `dist/` directory path.
	 * @returns {Function}
	 */
	addFormat( distDir ) {
		return ( pipes, format ) => {
			const conversionPipes = [];

			conversionPipes.push( utils.pickVersionedFile( format ) );

			if ( format != 'esnext' ) {
				conversionPipes.push( utils.transpile( format ) );
			}

			conversionPipes.push(
				utils.dist( distDir, format )
					.on( 'data', ( file ) => {
						gutil.log( `Finished writing '${ gutil.colors.cyan( file.path ) }'` );
					} )
			);

			pipes.push( multipipe.apply( null, conversionPipes ) );

			return pipes;
		};
	},

	/**
	 * Allows us to pick one of files suffixed with the format (`__esnext`, `__amd`, or `__cjs`).
	 *
	 * For example: we have `load__esnext.js`, `load__amd.js` and `load__cjs.js`. After applying this
	 * transformation when compiling code for a specific format the proper file will be renamed to `load.js`.
	 *
	 * @param {String} format
	 * @returns {Stream}
	 */
	pickVersionedFile( format ) {
		return rename( ( path ) => {
			const regexp = new RegExp( `__${ format }$` );

			path.basename = path.basename.replace( regexp, '' );
		} );
	},

	/**
	 * Moves files out of `ckeditor5-xxx/src/*` directories to `ckeditor5-xxx/*`.
	 *
	 * @returns {Stream}
	 */
	unpackModules() {
		return rename( ( file ) => {
			const dir = file.dirname.split( path.sep );

			// Validate the input for the clear conscious.

			if ( dir[ 0 ].indexOf( 'ckeditor5-' ) !== 0 ) {
				throw new Error( 'Path should start with "ckeditor5-".' );
			}

			if ( dir[ 1 ] != 'src' ) {
				throw new Error( 'Path should start with "ckeditor5-*/src".' );
			}

			// Remove 'src'.
			dir.splice( 1, 1 );

			file.dirname = path.join.apply( null, dir );
		} );
	},

	/**
	 * Adds `ckeditor5/` to a file path.
	 *
	 * @returns {Stream}
	 */
	wrapCKEditor5Module() {
		return rename( ( file ) => {
			file.dirname = path.join( file.dirname, 'ckeditor5' );
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
	}
};

module.exports = utils;