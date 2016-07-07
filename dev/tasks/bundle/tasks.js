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
const mkdirp = require( 'mkdirp' );

module.exports = ( config ) => {
	const args = utils.parseArguments();
	const sourceBuildDir = path.join( config.ROOT_DIR, config.BUILD_DIR, 'esnext' );
	const bundleDir = path.join( config.ROOT_DIR, config.BUNDLE_DIR );
	const bundleTmpDir = path.join( bundleDir, 'tmp' );
	const temporaryEntryFilePath = path.join( bundleTmpDir, 'entryfile.js' );

	const tasks = {
		/**
		 * Removes all files from bundle directory.
		 */
		clean() {
			return utils.clean( bundleDir, '*.*' );
		},

		/**
		 * Combines whole editor files into two files `ckeditor.js` and `ckeditor.css`.
		 *
		 * For JS bundle is required to pass configuration file `gulp bundle --config path/to/file.js` where
		 * we need to specify which editor and features we want to include in our bundle.
		 *
		 *		// example-config-file.js:
		 *
		 *		module.exports = {
		 *			// Name of CKEditor instance exposed as global variable by a bundle.
		 *			moduleName: 'MyCKEditor',
		 *
		 *			// Path to specified editor module.
		 *			// It could be a path relative to `build/esnext/ckeditor5` directory e.g. `classic-editor/classic`
		 *			// or path relative to directory where build task will be executed `./full/path/to/custom/editor`.
		 *			//
		 *			// Note: file extension is appended automatically.
		 *			editor: 'classic-editor/classic',
		 *
		 *			// List of features.
		 *			//
		 *			// Note: file extension is appended automatically.
		 *			features: [
		 *				// It could be a plugin name only if plugin is a default CKEditor plugin.
		 *				'delete',
		 *
		 *				// It could be a path relative to `build/esnext/ckeditor5` directory.
		 *				`typing/typing`,
		 *
		 *				// Or it could be a path relative to directory where build task will be executed.
		 *				'./path/to/some/custom/feature',
		 *			]
		 *		};
		 *
		 * @param {String} configFilePath Path to the bundle configuration file.
		 * @returns {Promise} Promise that resolve bundling for CSS and JS.
		 */
		generate( configFilePath ) {
			// When config file is not specified.
			if ( !configFilePath ) {
				// Then log error.
				gutil.log( gutil.colors.red( `Bundle Error: Path to the config file is required. 'gulp bundle --config path/to/file.js'` ) );

				// And stop task as failed.
				return Promise.reject();
			}

			// Get configuration from the configuration file.
			const config = require( path.resolve( '.', configFilePath ) );

			// Create a temporary entry file with proper directory structure if not exist.
			mkdirp.sync( bundleTmpDir );
			fs.writeFileSync( temporaryEntryFilePath, utils.renderEntryFileContent( bundleTmpDir, config ) );

			// Bundling JS by Rollup.
			function bundleJS() {
				const outputFile = path.join( bundleDir, 'ckeditor.js' );

				return rollup( {
					entry: temporaryEntryFilePath,
					plugins: [
						rollupBabel( {
							presets: [ 'es2015-rollup' ]
						} )
					]
				} )
				.then( ( bundle ) => {
					return bundle.write( {
						dest: outputFile,
						format: 'iife',
						moduleName: config.moduleName
					} );
				} )
				.then( () => {
					// If everything went well then remove tmp directory.
					utils.clean( bundleTmpDir, path.join( '' ) );
				} )
				.catch( ( err ) => {
					// If something went wrong then log error.
					gutil.log( gutil.colors.red( err.stack ) );

					// And remove tmp directory.
					utils.clean( bundleTmpDir, path.join( '' ) );

					throw new Error( 'Build error.' );
				} );
			}

			// CSS is already bundled by a build task, so we need only to copy it.
			function bundleCss() {
				const cssSource = path.join( sourceBuildDir, 'theme', 'ckeditor.css' );

				return utils.copyFile( cssSource, bundleDir );
			}

			// Lets wait for both - JS and CSS.
			return Promise.all( [ bundleJS(), bundleCss() ] );
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
