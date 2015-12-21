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

const sep = path.sep;

const utils = {
	/**
	 * Returns a stream of files matching the given glob pattern.
	 *
	 * @param {String} root The root directory.
	 * @param {String} glob The glob pattern.
	 * @param {Boolean} [watch] Whether to watch the files.
	 * @returns {Stream}
	 */
	src( root, glob, watch ) {
		const srcDir = path.join( root, glob );
		let stream = gulp.src( srcDir );

		if ( watch ) {
			stream = stream
				// Let's use plumber only when watching. In other cases we should fail quickly and loudly.
				.pipe( gulpPlumber() )
				.pipe( gulpWatch( srcDir ) );
		}

		return stream;
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
			plugins: [ `transform-es2015-modules-${ babelModuleTranspiler }` ],
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
	 * Moves files out of `node_modules/ckeditor5-xxx/src/*` directories to `ckeditor5-xxx/*`.
	 *
	 * @param {RegExp} modulePathPattern
	 * @returns {Stream}
	 */
	unpackModules( modulePathPattern ) {
		return rename( ( file ) => {
			file.dirname = file.dirname.replace( modulePathPattern, `${ sep }$1${ sep }` );

			// Remove now empty src/ dirs.
			if ( !file.extname && file.basename == 'src' ) {
				file.basename = '';
			}
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