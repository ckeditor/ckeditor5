/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const path = require( 'path' );
const gulp = require( 'gulp' );
const gulpCssnano = require( 'gulp-cssnano' );
const gulpUglify = require( 'gulp-uglify' );
const runSequence = require( 'run-sequence' );
const utils = require( './utils' );
const rollup = require( 'rollup' ).rollup;
const rollupBabel = require( 'rollup-plugin-babel' );

module.exports = ( config ) => {
	const sourceBuildDir = path.join( config.ROOT_DIR, config.BUILD_DIR, 'esnext' );
	const bundleDir = path.join( config.ROOT_DIR, config.BUNDLE_DIR );
	const entryFilePath = path.join( config.ROOT_DIR, 'dev', 'tasks', 'bundle', 'buildclassiceditor.js' );

	const tasks = {
		/**
		 * Remove all files from bundle directory.
		 */
		clean() {
			return utils.clean( bundleDir, '*.*' );
		},

		/**
		 * Combine whole editor files into two files `ckeditor.js` and `ckeditor.css`.
		 */
		generate() {
			/**
			 * Bundling JS by Rollup.
			 *
			 * At this moment we don't know a list of every dependency needed in the bundle. It is because
			 * editor features load automatically during initialization process. To work around this problem
			 * we have created a custom entry file where we defined some of imports with features
			 * needed to initialize editor.
			 *
			 * For more details see `buildclassiceditor.js`.
			 */
			function bundleJS() {
				const outputFile = path.join( bundleDir, 'ckeditor.js' );

				return rollup( {
					entry: entryFilePath,
					plugins: [
						rollupBabel( {
							presets: [ 'es2015-rollup' ]
						} )
					]
				} ).then( ( bundle ) => {
					return bundle.write( {
						dest: outputFile,
						format: 'iife',
						moduleName: 'ClassicEditor'
					} );
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
		}
	};

	gulp.task( 'bundle:clean', tasks.clean );
	gulp.task( 'bundle:generate', [ 'bundle:clean', 'build:js:esnext', 'build:themes:esnext' ], tasks.generate );
	gulp.task( 'bundle:minify:js', tasks.minify.js );
	gulp.task( 'bundle:minify:css', tasks.minify.css );
	gulp.task( 'bundle:next', tasks.next );

	gulp.task( 'bundle', ( callback ) => {
		runSequence( 'bundle:generate', [ 'bundle:minify:js', 'bundle:minify:css' ], () => {
			// Print files size on console just before the end of the task.
			const files = [ 'ckeditor.js', 'ckeditor.min.js', 'ckeditor.css', 'ckeditor.min.css' ];
			utils.logFilesSize( files, bundleDir );

			// Finish the task.
			callback();
		} );
	} );

	return tasks;
};
