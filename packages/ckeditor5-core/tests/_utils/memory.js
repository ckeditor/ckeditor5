/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, document, setTimeout */

const TEST_RETRIES = 2;
const TEST_TIMEOUT = 5000;
const GARBAGE_COLLECTOR_TIMEOUT = 500;

/**
 * Memory tests suite definition that:
 *
 * * skips tests when garbage collector is not available,
 * * creates/destroys editor element (id = 'mem-editor').
 *
 * This method should be used with dedicated memory usage test case functions:
 *
 *        describe( 'editor', () => {
 *			// Other tests.
 *
 *			describeMemoryUsage( () => {
 *				testMemoryUsage( 'should not grow on multiple create/destroy', () => {
 *					return ClassicEditor.create( document.querySelector( '#mem-editor' ) );
 *				} );
 *			} );
 *		} );
 *
 * @param {Function} callback Callback with test suit body
 */
export function describeMemoryUsage( callback ) {
	// Skip all memory tests due to https://github.com/ckeditor/ckeditor5/issues/1731.
	describe( 'memory usage', () => {
		skipIfIncompatibleEnvironment();

		beforeEach( createEditorElement );

		afterEach( removeEditorElement );

		callback();
	} );
}

/**
 * Single test case for memory usage test. Handles the memory leak test procedure.
 *
 * 1. Create and destroy the editor instance to pre-fill the memory with some cacheable data.
 * 2. Record the heap size.
 * 3. Create and destroy the editor 5 times.
 * 4. Record the heap size and compare with the previous result.
 * 5. Fail when exceeded a 1MB treshold (see code comments for why 1MB).
 *
 * See {@link describeMemoryUsage} function for usage details.
 *
 * @param {String} testName Name of a test case.
 * @param {Function} createEditor Callback which creates editor and returns its `.create()` promise.
 */
export function testMemoryUsage( testName, createEditor ) {
	it( testName, function() {
		this.timeout( TEST_TIMEOUT );

		// Unfortunately the tests fails from time to time so retry a failed tests.
		this.retries( TEST_RETRIES );

		return runTest( createEditor );
	} );
}

// Runs a single test case.
function runTest( createEditor ) {
	let memoryAfterFirstStart;

	return Promise
		.resolve()
		// Initialize the first editor before mesuring the heap size.
		// A cold start may allocate a bit of memory on the module-level.
		.then( createAndDestroy )
		.then( () => {
			return collectMemoryStats().then( mem => {
				memoryAfterFirstStart = mem;
			} );
		} )
		// Run create&destroy multiple times. Helps scaling up the issue.
		.then( createAndDestroy ) // #1
		.then( createAndDestroy ) // #2
		.then( createAndDestroy ) // #3
		.then( createAndDestroy ) // #4
		.then( createAndDestroy ) // #5
		.then( collectMemoryStats )
		.then( memory => {
			const memoryDifference = memory.usedJSHeapSize - memoryAfterFirstStart.usedJSHeapSize;

			// While theoretically we should get 0KB when there's no memory leak, in reality,
			// the results we get (when there are no leaks) vary from -500KB to 500KB (depending on which tests are executed).
			// However, when we had memory leaks, memoryDifference was reaching 20MB,
			// so, in order to detect significant memory leaks we can expect that the heap won't grow more than 1MB.
			expect( memoryDifference, 'used heap size should not grow' ).to.be.at.most( 1e6 );
		} );

	function createAndDestroy() {
		return Promise.resolve()
			.then( createEditor )
			.then( destroyEditor );
	}
}

function createEditorElement() {
	const editorElement = document.createElement( 'div' );
	editorElement.id = 'mem-editor';

	editorElement.innerHTML =
		'<h2>Editor 1</h2>\n' +
		'<p>This is an editor instance. And there\'s <a href="http://ckeditor.com">some link</a>.</p>';

	document.body.appendChild( editorElement );
}

function removeEditorElement() {
	document.getElementById( 'mem-editor' ).remove();
}

function destroyEditor( editor ) {
	return editor.destroy();
}

function collectMemoryStats() {
	return new Promise( resolve => {
		// Enforce garbage collection before recording memory stats.
		window.gc();

		setTimeout( () => {
			const memeInfo = window.performance.memory;

			resolve( {
				totalJSHeapSize: memeInfo.totalJSHeapSize,
				usedJSHeapSize: memeInfo.usedJSHeapSize,
				jsHeapSizeLimit: memeInfo.jsHeapSizeLimit
			} );
		}, GARBAGE_COLLECTOR_TIMEOUT );
	} );
}

// Will skip test suite if tests are run inside incompatible environment:
// - No window.gc (only Google Chrome).
// - Chrome on Windows (tests heavily break).
//
// Currently on Google Chrome supports this method and must be run with proper flags:
//
// 		google-chrome -js-flags="--expose-gc"
//
function skipIfIncompatibleEnvironment() {
	// eslint-disable-next-line mocha/no-top-level-hooks
	before( function() {
		if ( !window.gc || isWindows() ) {
			this.skip();
		}
	} );
}

// The windows environment does not cooperate with this tests.
function isWindows() {
	const userAgent = window.navigator.userAgent.toLowerCase();

	return userAgent.indexOf( 'windows' ) > -1;
}
