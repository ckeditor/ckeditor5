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
const gulpWatch = require( 'gulp-watch' );
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
					.pipe( watch ? gulpWatch( glob ) : utils.noop() );
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
					.pipe( watch ? gulpWatch( glob ) : utils.noop() )
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
						.pipe( watch ? gulpWatch( glob, opts ) : utils.noop() );
				} );

				return merge.apply( null, streams )
					.pipe( utils.unpackModules() );
			}
		}
	};

	gulp.task( 'build:clean', tasks.clean );

	gulp.task( 'build', [ 'build:clean' ], () => {
		//
		// NOTE: Error handling in streams is hard.
		//
		// Most likely this code isn't optimal, but it's a result of 8h spent on search
		// for a solution to the ruined pipeline whenever something throws.
		//
		// Most important fact is that when dest stream emits an error the src stream
		// unpipes it. Problem is when you start using tools like multipipe or gulp-mirror,
		// because you lose control over the graph of the streams and you cannot reconnect them
		// with a full certainty that you connected them correctly, since you'd need to know these
		// libs internals.
		//
		// BTW. No, gulp-plumber is not a solution here because it does not affect the other tools.
		//
		// Hence, I decided that it'll be best to restart the whole piece. However, I wanted to avoid restarting the
		// watcher as it sounds like something heavy.
		//
		// The flow looks like follows:
		//
		// 1. codeStream
		// 2. inputStream
		// 3. conversionStream (may throw)
		// 4. outputStream
		//
		// The input and output streams allowed me to easier debug and restart everything. Additionally, the output
		// stream is returned to Gulp so it must be stable. I decided to restart also the inputStream because when conversionStream
		// throws, then inputStream gets paused. Most likely it's possible to resume it, so we could pipe codeStream directly to
		// conversionStream, but it was easier this way.
		//
		// PS. The assumption is that all errors thrown somewhere inside conversionStream are forwarded to conversionStream.
		// Multipipe and gulp-mirror seem to work this way, so we get a single error emitter.
		const formats = options.formats.split( ',' );
		const codeStream = tasks.src.all( options.watch )
			.on( 'data', ( file ) => {
				gutil.log( `Processing '${ gutil.colors.cyan( file.path ) }'...` );
			} );
		const converstionStreamGenerator = utils.getConversionStreamGenerator( distDir );

		let inputStream;
		let conversionStream;
		let outputStream = utils.noop();

		startStreams();

		return outputStream;

		// Creates a single stream combining multiple conversion streams.
		function createConversionStream() {
			const formatPipes = formats.reduce( converstionStreamGenerator, [] );

			return gulpMirror.apply( null, formatPipes )
				.on( 'error', onError );
		}

		// Handles error in the combined conversion stream.
		// If we don't watch files, make sure that the process terminates ASAP. We could forward the error
		// to the output, but there may be some data in the pipeline and our error could be covered
		// by dozen of other messages.
		// If we watch files, then clean up the old streams and restart the combined conversion stream.
		function onError() {
			if ( !options.watch ) {
				process.exit( 1 );

				return;
			}

			unpipeStreams();

			gutil.log( 'Restarting...' );
			startStreams();
		}

		function startStreams() {
			inputStream = utils.noop();
			conversionStream = createConversionStream();

			codeStream
				.pipe( inputStream )
				.pipe( conversionStream )
				.pipe( outputStream );
		}

		function unpipeStreams() {
			codeStream.unpipe( inputStream );
			conversionStream.unpipe( outputStream );
		}
	} );

	return tasks;
};
