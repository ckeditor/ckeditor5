/* jshint node: true, esnext: true */

'use strict';

const path = require( 'path' );
const gulp = require( 'gulp' );
const rename = require( 'gulp-rename' );
const babel = require( 'gulp-babel' );
const stream = require( 'stream' );

const sep = path.sep;

const utils = {
	fork( sourceStream ) {
		const fork = new stream.PassThrough( { objectMode: true } );

		return sourceStream.pipe( fork );
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

		return new stream.PassThrough( { objectMode: true } )
			.pipe( utils.pickVersionedFile( format ) )
			.pipe( babel( {
				plugins: [ `transform-es2015-modules-${ babelModuleTranspiler }` ]
			} ) );
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