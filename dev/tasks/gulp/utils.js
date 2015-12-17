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
const stream = require( 'stream' );

const sep = path.sep;

const utils = {
	src( root, pattern, watch ) {
		const srcDir = path.join( root, pattern );
		let stream = gulp.src( srcDir );

		if ( watch ) {
			stream = stream
				// Let's use plumber only when watching. In other cases we should fail quickly and loudly.
				.pipe( gulpPlumber() )
				.pipe( gulpWatch( srcDir ) );
		}

		return stream;
	},

	dist( distDir, format ) {
		const destDir = path.join( distDir, format );

		return gulp.dest( destDir );
	},

	transpile( format ) {
		const babelModuleTranspilers = {
			amd: 'amd',
			cjs: 'commonjs'
		};
		const babelModuleTranspiler = babelModuleTranspilers[ format ];

		if ( !babelModuleTranspiler ) {
			throw new Error( `Incorrect format: ${ format }` );
		}

		return new stream.PassThrough( { objectMode: true } )
			.pipe( utils.pickVersionedFile( format ) )
			.pipe( babel( {
				plugins: [ `transform-es2015-modules-${ babelModuleTranspiler }` ]
			} ) );
	},

	addFormat( distDir ) {
		return ( pipes, format ) => {
			const conversionPipes = [];

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

	pickVersionedFile( format ) {
		return rename( ( path ) => {
			const regexp = new RegExp( `__${ format }$` );

			path.basename = path.basename.replace( regexp, '' );
		} );
	},

	/**
	 * Move files out of `node_modules/ckeditor5-xxx/src/*` directories to `ckeditor5-xxx/*`.
	 *
	 * @returns {Stream}
	 */
	unpackModules( modulePathPattern ) {
		return rename( ( filePath ) => {
			filePath.dirname = filePath.dirname.replace( modulePathPattern, `${ sep }$1${ sep }` );

			// Remove now empty src/ dirs.
			if ( !filePath.extname && filePath.basename == 'src' ) {
				filePath.basename = '';
			}
		} );
	},

	wrapCKEditor5Module() {
		return rename( ( filePath ) => {
			filePath.dirname = path.join( filePath.dirname, 'ckeditor5' );
		} );
	}
};

module.exports = utils;