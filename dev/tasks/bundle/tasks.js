/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const gulp = require( 'gulp' );
const gulpCssnano = require( 'gulp-cssnano' );
const gulpUglify = require( 'gulp-uglify' );
const gutil = require( 'gulp-util' );
const runSequence = require( 'run-sequence' );
const utils = require( './utils' );
const rollup = require( 'rollup' ).rollup;
const rollupBabel = require( 'rollup-plugin-babel' );

module.exports = ( config ) => {
	const args = utils.parseArguments();
	const sourceBuildDir = path.join( config.ROOT_DIR, config.BUILD_DIR, 'esnext' );
	const bundleDir = path.join( config.ROOT_DIR, config.BUNDLE_DIR );
	const temporaryEntryFilePath = './tmp/entryfile.js';

	const tasks = {
		/**
		 * Remove all files from bundle directory.
		 */
		clean() {
			return utils.clean( bundleDir, '*.*' );
		},

		/**
		 * Combine whole editor files into two files `ckeditor.js` and `ckeditor.css`.
		 *
		 * For JS bundle is needed to pass configuration file `gulp bundle --config path/to/file.js` where
		 * we need to specify which features and creator we want to include in our bundle.
		 *
		 * 		example-config-file.js
		 * 		modude.exports = {
		 * 			// Name of CKEditor instance exposed by bundle.
		 * 			moduleName 'MyCKEditor',
		 *
		 * 			// E.g. `path/to/classic-editor/classic.js`.
		 * 			creator: 'path/to/editor.creator.js'
		 *
		 * 			// List of features.
		 * 			features: [
		 * 				// It could be whole path.
		 * 				'path/to/some/feature.js',
		 *
		 * 				// And it could be only name of feature if feature is default CKEditor feature.
		 * 				'typing'
		 * 			]
		 * 		}
		 *
		 * @param {String} configFilePath Path to the bundle configuration file.
		 * @return {Promise} Promise that resolve bundling for CSS anf JS.
		 */
		generate( configFilePath ) {
			// When config file is not specified.
			if ( !configFilePath ) {
				// Then log error.
				gutil.log( gutil.colors.red( `Bundle Error: Path to the config file is required. 'gulp bundle --config path/to/file.js'` ) );
				// And stop process as failed.
				process.exit( 1 );
			}

			// Get configuration from the configuration file.
			const config = require( path.resolve( '.', configFilePath ) );

			// Create temporary entry file.
			fs.writeFileSync( temporaryEntryFilePath, utils.renderEntryFileContent( config ) );

			/**
			 * Bundling JS by Rollup.
			 */
			function bundleJS() {
				const outputFile = path.join( bundleDir, 'ckeditor.js' );

				return rollup( {
					entry: temporaryEntryFilePath,
					plugins: [
						rollupBabel( {
							presets: [ 'es2015-rollup' ]
						} )
					]
				} ).then( ( bundle ) => {
					return bundle.write( {
						dest: outputFile,
						format: 'iife',
						moduleName: config.moduleName
					} );
				} ).then( () => {
					// If everything went well then remove temporary entry file.
					utils.clean( '', temporaryEntryFilePath );
				} ).catch( ( err ) => {
					// If something went wrong then log error.
					gutil.log( gutil.colors.red( `Bundle Error` ) );
					gutil.log( gutil.colors.red( err.stack ) );

					// And remove temporary entry file.
					utils.clean( '', temporaryEntryFilePath );
				} );
			}

			/**
			 * CSS is already bundled by a build task, so we need only to copy it.
			 */
			function bundleCSS() {
				const cssSource = path.join( sourceBuildDir, 'theme', 'ckeditor.css' );

				return utils.copyFile( cssSource, bundleDir );
			}

			// Lets wait for both - JS and CSS.
			return Promise.all( [ bundleJS(), bundleCSS() ] );
		},

		minify: {
			/**
			 * JS minification by UglifyJS.
			 */
			js() {
				let stream = gulp.src( path.join( bundleDir, 'ckeditor.js' ) )
					.pipe( gulpUglify() );

				return utils.saveFileFromStreamAsMinified( stream, bundleDir );
			},

			/**
			 * CSS minification by cssnano.
			 */
			css() {
				let stream = gulp.src( path.join( bundleDir, 'ckeditor.css' ) )
					.pipe( gulpCssnano() );

				return utils.saveFileFromStreamAsMinified( stream, bundleDir );
			}
		},

		register() {
			gulp.task( 'bundle:clean', tasks.clean );
			gulp.task( 'bundle:generate',
				[
					'bundle:clean',
					'build:js:esnext',
					'build:themes:esnext'
				],
				() => tasks.generate( args.config )
			);
			gulp.task( 'bundle:minify:js', tasks.minify.js );
			gulp.task( 'bundle:minify:css', tasks.minify.css );
			gulp.task( 'bundle:next', tasks.next );

			gulp.task( 'bundle', ( callback ) => {
				runSequence( 'bundle:generate', [ 'bundle:minify:js', 'bundle:minify:css' ], () => {
					const files = [ 'ckeditor.js', 'ckeditor.css', 'ckeditor.min.js', 'ckeditor.min.css' ];
					const filesStats = utils.getFilesSizeStats( files, bundleDir );

					// Show bundle summary on console.
					utils.showFilesSummary( 'Bundle summary', filesStats );

					// Finish the task.
					callback();
				} );
			} );
		}
	};

	return tasks;
};
