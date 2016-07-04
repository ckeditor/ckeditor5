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
const devTools = require( '../../lib/tools' );
const semver = require( 'semver' );
const buildUtils = require( '../build/utils' );
const benderConfig = require( '../../../bender' );

/**
 * Defines Node.js testing task and development tools testing tasks.
 *
 * To run tests under Node.js:
 *
 *		gulp test:node
 *
 * To run build under Node.js before testing:
 *
 *		gulp test:node:build
 *
 * To run testing under Node.js with code coverage:
 *
 *		gulp test:node:coverage
 *
 * To run development tools tests:
 *
 * 		gulp test:dev
 *
 * To run development tools tests with coverage:
 *
 * 		gulp test:dev:coverage
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
		prepareNodeCoverage() {
			const src = benderConfig.coverage.paths.map( ( item ) => {
				return item.replace( 'build/amd/', 'build/cjs/' );
			} );
			tasks.coverage = true;

			return gulp.src( src )
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

			if ( semver.lt( process.version, minVersion ) ) {
				throw new gutil.PluginError( {
					plugin: 'test-node',
					message: `Wrong Node.js version. Please use Node.js in version v${ minVersion } or higher.`
				} );
			}

			const benderSrc = benderConfig.tests.all.paths.map( ( item ) => {
				return item.replace( 'build/amd/', 'build/cjs/' ) + '/*.js' ;
			} );

			const src = [
				...benderSrc,
				'!build/cjs/tests/{ui,ui-*}/**/*.js',
				'!build/cjs/tests/theme-*/**/*.js',
				'!build/cjs/tests/creator-*/**/*.js'
			];

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
		},

		/**
		 * Runs dev unit tests.
		 *
		 * @returns {Stream}
		 */
		devTest() {
			return gulp.src( 'dev/tests/**/*.js' )
				.pipe( mocha() )
				.pipe( tasks.coverage ? istanbul.writeReports() : buildUtils.noop() );
		},

		/**
		 * Prepares files for coverage report.
		 *
		 * @returns {Stream}
		 */
		prepareDevCoverage() {
			tasks.coverage = true;

			return gulp.src( 'dev/tasks/**/*.js' )
				.pipe( istanbul() )
				.pipe( istanbul.hookRequire() );
		},

		register() {
			gulp.task( 'test:node:pre-coverage', [ 'build:js:cjs' ], tasks.prepareNodeCoverage );
			gulp.task( 'test:node', tasks.testInNode );
			gulp.task( 'test:node:build', [ 'build:js:cjs' ] , tasks.testInNode );
			gulp.task( 'test:node:coverage', [ 'build:js:cjs', 'test:node:pre-coverage' ], tasks.testInNode );

			gulp.task( 'test:dev:pre-coverage', tasks.prepareDevCoverage );
			gulp.task( 'test:dev', tasks.devTest );
			gulp.task( 'test:dev:coverage', [ 'test:dev:pre-coverage' ], tasks.devTest );
		}
	};

	return tasks;
};
