/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );
const istanbul = require( 'gulp-istanbul' );
const gutil = require( 'gulp-util' );
const mocha = require( 'gulp-mocha' );
const chai = require( 'chai' );
const filterBy = require( 'gulp-filter-by' );
const filter = require( 'gulp-filter' );
const sinon = require( 'sinon' );
const devTools = require( '../dev/utils/tools' );
const semver = require( 'semver' );
const buildUtils = require( '../build/utils' );

/**
 * Defines Node.js testing task.
 *
 * To run tests under node:
 *
 *		gulp test:node
 *
 * To run build before testing:
 *
 *		gulp test:node:build
 *
 * To run testing with code coverage:
 *
 *		gulp test:node:coverage
 */
module.exports = () => {
	const ignoreRegexp = /\/\* ?bender-tags:.*\bbrowser-only\b.*\*\//;

	// Inject globals before running tests.
	global.should = chai.should;
	global.expect = chai.expect;
	global.assert = chai.assert;
	global.sinon = sinon;

	const tasks = {
		/**
		 * Is set to `true` when code coverage report will be displayed.
		 *
		 * @type {Boolean}
		 */
		coverage: false,

		/**
		 * Prepares files for coverage report.
		 *
		 * @returns {Stream}
		 */
		prepareCoverage() {
			tasks.coverage = true;

			return gulp.src( 'build/cjs/ckeditor5/**/*.js' )
				.pipe( istanbul() )
				.pipe( istanbul.hookRequire() );
		},

		/**
		 * Runs tests in Node.js environment.
		 *
		 * @returns {Stream}
		 */
		testInNode() {
			const minVersion = '6.0.0';
			const src = [
				'build/cjs/tests/**/*.js',
				'!**/_utils/**/*.js',
				'!build/cjs/tests/{ui,ui-*}/**/*.js',
				'!build/cjs/tests/theme-*/**/*.js'
			];

			if ( semver.lt( process.version, minVersion ) ) {
				throw new gutil.PluginError( {
					plugin: 'test-node',
					message: `Wrong Node.js version. Please use Node.js in version v${ minVersion } or higher.`
				} );
			}

			return gulp.src( src )
				.pipe( tasks.skipManual() )
				.pipe( tasks.skipIgnored() )
				.pipe( mocha( { reporter: 'progress' } ) )
				.pipe( tasks.coverage ? istanbul.writeReports() : buildUtils.noop() );
		},

		/**
		 * Removes manual test files from source stream. It checks if the markdown file with the same name exists.
		 *
		 * @returns {Stream}
		 */
		skipManual() {
			return filter( ( file ) => {
				return !devTools.isFile( file.path.slice( 0, -3 ) + '.md' );
			} );
		},

		/**
		 * Skips test files that are marked to be ignored when testing outside browser.
		 * To ignore file, add `browser-only` to bender-tags comment in test file.
		 *
		 * @returns {Stream}
		 */
		skipIgnored() {
			return filterBy( file => !file.contents.toString().match( ignoreRegexp ) );
		}
	};

	gulp.task( 'test:node:pre-coverage', [ 'build:js:cjs' ], tasks.prepareCoverage );
	gulp.task( 'test:node', tasks.testInNode );
	gulp.task( 'test:node:build', [ 'build:js:cjs' ] , tasks.testInNode );
	gulp.task( 'test:node:coverage', [ 'build:js:cjs', 'test:node:pre-coverage' ], tasks.testInNode );

	return tasks;
};
