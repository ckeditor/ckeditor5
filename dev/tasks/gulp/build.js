/* jshint node: true, esnext: true */

'use strict';

const KNOWN_OPTIONS = {
	build: {
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
	}
};

const fs = require( 'fs' );
const path = require( 'path' );
const gulp = require( 'gulp' );
const del = require( 'del' );
const merge = require( 'merge-stream' );
const gulpMirror = require( 'gulp-mirror' );
const gutil = require( 'gulp-util' );
const minimist = require( 'minimist' );
const utils = require( './utils' );

const options = minimist( process.argv.slice( 2 ), KNOWN_OPTIONS[ process.argv[ 2 ] ] );

module.exports = ( config ) => {
	const distDir = path.join( config.ROOT_DIR, config.DIST_DIR );

	const tasks = {
		/**
		 * Removes the dist directory.
		 */
		clean() {
			return del( distDir );
		},

		src: {
			/**
			 * Returns a stream of all source files.
			 *
			 * @param {Boolean} [watch] Whether the files should be watched.
			 * @returns {Stream}
			 */
			all( watch ) {
				return merge( tasks.src.main( watch ), tasks.src.ckeditor5( watch ), tasks.src.modules( watch ) );
			},

			/**
			 * Returns a stream with just the main file (`ckeditor5/ckeditor.js`).
			 *
			 * @param {Boolean} [watch] Whether to watch the files.
			 * @returns {Stream}
			 */
			main( watch ) {
				const glob = path.join( config.ROOT_DIR, 'ckeditor.js' );

				return gulp.src( glob )
					.pipe( watch ? utils.watch( glob ) : utils.noop() );
			},

			/**
			 * Returns a stream of all source files from CKEditor 5.
			 *
			 * @param {Boolean} [watch] Whether to watch the files.
			 * @returns {Stream}
			 */
			ckeditor5( watch ) {
				const glob = path.join( config.ROOT_DIR, 'src', '**', '*.js' );

				return gulp.src( glob )
					.pipe( watch ? utils.watch( glob ) : utils.noop() )
					.pipe( utils.wrapCKEditor5Module() );
			},

			/**
			 * Returns a stream of all source files from CKEditor 5 dependencies.
			 *
			 * @param {Boolean} [watch] Whether to watch the files.
			 * @returns {Stream}
			 */
			modules( watch ) {
				// Find all CKEditor5 package directories. Resolve symlinks so we watch real directories
				// in order to workaround https://github.com/paulmillr/chokidar/issues/419.
				const dirs = fs.readdirSync( path.join( config.ROOT_DIR, 'node_modules' ) )
					// Look for ckeditor5-* directories.
					.filter( ( fileName ) => fileName.indexOf( 'ckeditor5-' ) === 0 )
					// Resolve symlinks and keep only directories.
					.map( ( fileName ) => {
						let filePath = path.join( config.ROOT_DIR, 'node_modules', fileName );
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

				const streams = dirs.map( ( dirPath ) => {
					const glob = path.join( dirPath, 'src', '**', '*.js' );
					// Use parent as a base so we get paths starting with 'ckeditor5-*/src/*' in the stream.
					const baseDir = path.parse( dirPath ).dir;
					const opts = { base: baseDir };

					return gulp.src( glob, opts )
						.pipe( watch ? utils.watch( glob, opts ) : utils.noop() );
				} );

				return merge.apply( null, streams )
					.pipe( utils.unpackModules() );
			}
		}
	};

	gulp.task( 'build:clean', tasks.clean );

	gulp.task( 'build', [ 'build:clean' ], () => {
		const formats = options.formats.split( ',' );
		const codeStream = tasks.src.all( options.watch )
			.on( 'data', ( file ) => {
				gutil.log( `Processing '${ gutil.colors.cyan( file.path ) }'...` );
			} );
		const formatPipes = formats.reduce( utils.addFormat( distDir ), [] );

		return codeStream
			.pipe( gulpMirror.apply( null, formatPipes ) );
	} );

	return tasks;
};