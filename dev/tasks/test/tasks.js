/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );
const mocha = require( 'gulp-mocha' );
const chai = require( 'chai' );
const filterBy = require( 'gulp-filter-by' );
const filter = require( 'gulp-filter' );
const sinon = require( 'sinon' );
const minimist = require( 'minimist' );
const devTools = require( '../dev/utils/tools' );

module.exports = () => {
	const ignoreRegexp = /\/\* ?bender-tags:.*\bbrowser-only\b.*\*\//;

	// Inject globals before running tests.
	global.should = chai.should;
	global.expect = chai.expect;
	global.assert = chai.assert;
	global.sinon = sinon;

	const tasks = {
		testEditor() {
			const options = minimist( process.argv.slice( 2 ), {
				boolean: [ 'node' ],
				default: {
					'node': false
				}
			} );

			if ( options.node ) {
				return tasks.testInNode();
			}
		},

		testInNode() {
			return gulp.src( 'dist/cjs/tests/**/*.js' )
				.pipe( tasks.skipManual() )
				.pipe( tasks.skipIgnored() )
				.pipe( mocha() );
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

	gulp.task( 'test-editor', tasks.testEditor );

	return tasks;
};
