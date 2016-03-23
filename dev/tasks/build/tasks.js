/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const gulp = require( 'gulp' );
const merge = require( 'merge-stream' );
const mirror = require( 'gulp-mirror' );
const gulpWatch = require( 'gulp-watch' );
const gulpPlumber = require( 'gulp-plumber' );
const gutil = require( 'gulp-util' );
const filter = require( 'gulp-filter' );
const utils = require( './utils' );
const runSequence = require( 'run-sequence' );

module.exports = ( config ) => {
	const buildDir = path.join( config.ROOT_DIR, config.BUILD_DIR );
	const themesGlob = path.join( 'theme', '**', '*.scss' );
	const iconsGlob = path.join( 'theme', 'icons', '*.svg' );
	const parsedArguments = utils.parseArguments();

	const tasks = {
		clean: {
			/**
			 * Removes "themes" folder from "./build/{format}" directory.
			 */
			themes() {
				return utils.clean( buildDir, path.join( `@(${ utils.parseArguments().formats.join( '|' ) })`, 'theme' ) );
			},

			/**
			 * Removes all but "themes" folder from "./build/{format}" directory.
			 */
			js( options ) {
				// TODO: ES6 default function parameters
				options = options || utils.parseArguments();

				return utils.clean( buildDir, path.join( `@(${ options.formats.join( '|' ) })`, '!(theme)' ) );
			},

			/**
			 * Removes the "./build" directory.
			 */
			all() {
				return utils.clean( buildDir, path.join() );
			}
		},

		src: {
			js: {
				/**
				 * Returns a stream of all source files.
				 *
				 * @param {Boolean} [watch] Whether the files should be watched.
				 * @returns {Stream}
				 */
				all( watch ) {
					return merge( tasks.src.js.main( watch ), tasks.src.js.ckeditor5( watch ), tasks.src.js.packages( watch ) );
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
					const glob = path.join( config.ROOT_DIR, '@(src|tests)', '**', '*' );

					return gulp.src( glob, { nodir: true } )
						.pipe( watch ? gulpWatch( glob ) : utils.noop() )
						.pipe( utils.renameCKEditor5Files() );
				},

				/**
				 * Returns a stream of all source files from CKEditor 5 dependencies.
				 *
				 * @param {Boolean} [watch] Whether to watch the files.
				 * @returns {Stream}
				 */
				packages( watch ) {
					const dirs = utils.getPackages( config.ROOT_DIR );

					const streams = dirs.map( ( dirPath ) => {
						const glob = path.join( dirPath, '@(src|tests)', '**', '*' );
						// Use parent as a base so we get paths starting with 'ckeditor5-*/src/*' in the stream.
						const baseDir = path.parse( dirPath ).dir;
						const opts = { base: baseDir, nodir: true };

						return gulp.src( glob, opts )
							.pipe( watch ? gulpWatch( glob, opts ) : utils.noop() );
					} );

					return merge.apply( null, streams )
						.pipe( utils.renamePackageFiles() );
				}
			},

			/**
			 * Returns a stream of all theme (*.scss) files.
			 *
			 * @returns {Stream}
			 */
			sass() {
				const dirs = utils.getPackages( config.ROOT_DIR );

				const streams = dirs.map( ( dirPath ) => {
					const glob = path.join( dirPath, themesGlob );
					const baseDir = path.parse( dirPath ).dir;
					const opts = { base: baseDir, nodir: true };

					return gulp.src( glob, opts );
				} );

				return merge.apply( null, streams );
			},

			icons() {
				const dirs = utils.getPackages( config.ROOT_DIR );

				const streams = dirs.map( ( dirPath ) => {
					const glob = path.join( dirPath, iconsGlob );
					const baseDir = path.parse( dirPath ).dir;
					const opts = { base: baseDir, nodir: true };

					return gulp.src( glob, opts );
				} );

				return merge.apply( null, streams );
			}
		},

		build: {
			/**
			 * The build task which is capable of copying, watching, processing and writing all JavaScript files
			 * to the `build/` directory.
			 *
			 * @param {Object} options
			 * @param {String} options.formats
			 * @param {Boolean} [options.watch]
			 * @returns {Stream}
			 */
			js( options ) {
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
				// 1. codeStream (including logger)
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
				const codeStream = tasks.src.js.all( options.watch )
					.pipe(
						utils.noop( ( file ) => {
							gutil.log( `Processing '${ gutil.colors.cyan( file.path ) }'...` );
						} )
					);
				const conversionStreamGenerator = utils.getConversionStreamGenerator( buildDir );
				const outputStream = utils.noop();

				let inputStream;
				let conversionStream;

				startStreams();

				return outputStream;

				// Creates a single stream combining multiple conversion streams.
				function createConversionStream() {
					const formatPipes = options.formats.reduce( conversionStreamGenerator, [] );

					return mirror.apply( null, formatPipes )
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
			},

			/**
			 * The task capable of watching, processing and writing CSS files into `build/[formats]/theme`
			 * directories.
			 *
			 * @param {Object} options
			 * @param {String} options.formats
			 * @param {Boolean} [options.watch]
			 * @returns {Stream}
			 */
			sass( options ) {
				if ( options.watch ) {
					const glob = path.join( config.ROOT_DIR, 'node_modules', 'ckeditor5-*', themesGlob );

					// Initial build.
					build();

					gutil.log( `Watching theme files in '${ gutil.colors.cyan( glob ) }' for changes...` );

					return gulp.watch( glob, event => {
						gutil.log( `Theme file '${ gutil.colors.cyan( event.path ) }' has been ${ event.type }...` );

						// Re-build the entire theme if the file has been changed.
						return build();
					} );
				} else {
					return build();
				}

				function build() {
					const formatStreams = utils.getThemeFormatDestStreams( buildDir, options.formats );

					return tasks.src.sass()
						.pipe( gulpPlumber() )
						.pipe( utils.filterThemeEntryPoints() )
						.pipe(
							utils.noop( file => {
								gutil.log( `Found theme entry point '${ gutil.colors.cyan( file.path ) }'.` );
							} )
						)
						.pipe( utils.compileThemes( 'ckeditor.css' ) )
						.pipe( mirror( formatStreams ) )
						.on( 'error', console.log );
				}
			},

			/**
			 * The task capable of converting *.svg icon files into `./build/[formats]/theme/iconmanagermodel.js`
			 * sprite.
			 *
			 * @param {Object} options
			 * @param {String} options.formats
			 * @returns {Stream}
			 */
			icons( options ) {
				const formatStreams = utils.getThemeFormatDestStreams( buildDir, options.formats, format => {
					if ( format !== 'esnext' ) {
						return utils.transpile( format, utils.getBabelOptionsForSource( format ) );
					} else {
						return utils.noop();
					}
				} );

				return tasks.src.icons()
					.pipe( utils.compileIconSprite() )
					.pipe( filter( '*.js' ) )
					.pipe( mirror( formatStreams ) );
			}
		}
	};

	gulp.task( 'build', callback => {
		runSequence( 'build:clean:all', 'build:themes', 'build:js', callback );
	} );

	gulp.task( 'build:clean:all', tasks.clean.all );
	gulp.task( 'build:clean:themes', tasks.clean.themes );
	gulp.task( 'build:clean:js', () => {
		return tasks.clean.js( parsedArguments );
	} );

	gulp.task( 'build:themes', ( callback ) => {
		runSequence( 'build:clean:themes', 'build:icons', 'build:sass', callback );
	} );

	gulp.task( 'build:sass', () => {
		return tasks.build.sass( parsedArguments );
	} );

	gulp.task( 'build:icons', () => {
		return tasks.build.icons( parsedArguments );
	} );

	gulp.task( 'build:js', [ 'build:clean:js' ], () => {
		return tasks.build.js( parsedArguments );
	} );

	// Tasks specific for `gulp docs` builder.
	gulp.task( 'build:clean:js:esnext', () => {
		return tasks.clean.js( { formats: [ 'esnext' ] } );
	} );

	gulp.task( 'build:js:esnext', [ 'build:clean:js:esnext' ], () => {
		return tasks.build.js( { formats: [ 'esnext' ] } );
	} );

	return tasks;
};
