/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, document, setTimeout */

/**
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
 * @param {String} testName
 * @param {Function} editorCreator Callback which creates editor and returns it's `.create()` promise.
 */
export function testMemoryUsage( testName, editorCreator ) {
	it( testName, function() {
		this.timeout( 6000 );

		return runTest( editorCreator );
	} );
}

// Runs a single test case. This method will properly setup memory-leak test:
// - create editor
// - run garbage collector
// - record memory allocations
// - destroy the editor
// - create & destroy editor multiple times (6) - after each editor creation the test runner will be paused for ~200ms
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
		.then( testAndDestroy )
		.then( testAndDestroy )
		.then( testAndDestroy )
		.then( testAndDestroy )
		.then( testAndDestroy )
		.then( testAndDestroy )
		.then( testAndDestroy )
		.then( testAndDestroy )
		.then( testAndDestroy )
		.then( testAndDestroy )
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
		}, 500 );
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
