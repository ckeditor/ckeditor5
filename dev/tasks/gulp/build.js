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

const path = require( 'path' );
const gulp = require( 'gulp' );
const del = require( 'del' );
const merge = require( 'merge-stream' );
const gulpMirror = require( 'gulp-mirror' );
const gutil = require( 'gulp-util' );
const minimist = require( 'minimist' );
const utils = require( './utils' );

const sep = path.sep;
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
			 * @param {Boolean} [watch] Whether the files should be watched.
			 * @returns {Stream}
			 */
			main( watch ) {
				return utils.src( config.ROOT_DIR, 'ckeditor.js', watch );
			},

			/**
			 * Returns a stream of all source files from CKEditor 5.
			 *
			 * @param {Boolean} [watch] Whether the files should be watched.
			 * @returns {Stream}
			 */
			ckeditor5( watch ) {
				return utils.src( config.ROOT_DIR, 'src/**/*.js', watch )
					.pipe( utils.wrapCKEditor5Module() );
			},

			/**
			 * Returns a stream of all source files from CKEditor 5 dependencies.
			 *
			 * @param {Boolean} [watch] Whether the files should be watched.
			 * @returns {Stream}
			 */
			modules( watch ) {
				// For an odd reason file.dirname does not contain `node_modules/`. Maybe the base dir
				// is automatically set to only the varying piece of the path.
				const modulePathPattern = new RegExp( `(ckeditor5-[^${ sep }]+)${ sep }src` );

				return utils.src( config.ROOT_DIR, 'node_modules/ckeditor5-*/src/**/*.js', watch )
					.pipe( utils.unpackModules( modulePathPattern ) );
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