/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, document, setTimeout */

const TEST_TIMEOUT = 6000;
const GARBAGE_COLLECTOR_TIMEOUT = 500;

/**
 * Memory tests suite definition that:
 * - skips tests when garbage collector is not available.
 * - creates/destroys editor element (id = 'mem-editor').
 *
 * This method should be used with dedicated memory usage test case functions:
 *
 *        describe( 'editor', () => {
 *			// Other tests.
 *
 *			describeMemoryUsage( () => {
 *				testMemoryUsage( 'and editor', () => {
 *					return ClassicEditor.create( document.querySelector( '#mem-editor' ) );
 *				} );
 *			} );
 *		} );
 *
 * @param {Function} callback Callback with test suit body
 */
export function describeMemoryUsage( callback ) {
	describe( 'memory usage', () => {
		skipIfNoGarbageCollector();

		beforeEach( createEditorElement );

		afterEach( destroyEditorElement );

		callback();
	} );
}

/**
 * Single test case for memory usage test. This method will handle memory usage test procedure:
 * - creating editor instance
 * - recording its memory usage (after garbage collector)
 * - create and destroy editor 10 times
 * - record memory usage after final editor destroy (after garbage collector)
 * - tests if memory grew
 *
 * See {@link describeMemoryUsage} function for usage details.
 *
 * @param {String} testName Name of a test case.
 * @param {Function} editorCreator Callback which creates editor and returns it's `.create()` promise.
 */
export function testMemoryUsage( testName, editorCreator ) {
	it( testName, function() {
		this.timeout( TEST_TIMEOUT );

		return runTest( editorCreator );
	} );
}

// Runs a single test case. This method will properly setup memory-leak test:
// - create editor
// - run garbage collector
// - record memory allocations
// - destroy the editor
// - create & destroy editor multiple times (9) - after each editor creation the test runner will be paused for ~200ms
function runTest( editorCreator ) {
	const createEditor = createAndDestroy( editorCreator );

	let memoryAfterFirstStart;

	return Promise.resolve() // Promise.resolve just to align below code.
	// First editor creation needed to load all editor code,css into the memory (it is reported as used heap memory)
		.then( createEditor )
		.then( editor => {
			return collectMemoryStats().then( mem => {
				memoryAfterFirstStart = mem;

				return editor;
			} );
		} )
		.then( destroy )
		// Run create-wait-destroy multiple times. Multiple runs to grow memory significantly even on smaller leaks.
		.then( testAndDestroy ) // #2
		.then( testAndDestroy ) // #3
		.then( testAndDestroy ) // #4
		.then( testAndDestroy ) // #5
		.then( testAndDestroy ) // #6
		.then( testAndDestroy ) // #7
		.then( testAndDestroy ) // #8
		.then( testAndDestroy ) // #9
		.then( testAndDestroy ) // #10
		.then( () => {
			return new Promise( resolve => {
				collectMemoryStats().then( memory => {
					const memoryDifference = memory.usedJSHeapSize - memoryAfterFirstStart.usedJSHeapSize;

					expect( memoryDifference, 'used heap size should not grow' ).to.be.at.most( 0 );
					resolve();
				} );
			} );
		} );

	function testAndDestroy() {
		return Promise.resolve()
			.then( createEditor )
			.then( destroy );
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

function destroyEditorElement() {
	document.getElementById( 'mem-editor' ).remove();
}

function createAndDestroy( editorCreator ) {
	return () => editorCreator();
}

function destroy( editor ) {
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

// Will skip test suite if not in compatible browser.
// Currently on Google Chrome supports this method and must be run with proper flags:
//
// 		google-chrome -js-flags="--expose-gc"
//
function skipIfNoGarbageCollector() {
	before( function() {
		if ( !window.gc ) {
			this.skip();
		}
	} );
}
