/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, document, setTimeout */

const MiB = 1024 * 1024;

/**
 * @param {Function} callback Callback with test suit body
 */
export function describeMemoryUsage( callback ) {
	describe( 'memory usage', () => {
		skipIfNoGarbageCollector();

		beforeEach( () => collectGarbageAndWait() );

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
		// This is a long-running test unfortunately.
		this.timeout( 8000 );

		// It happens from time to time that Browser will allocate additional resources and the test will fail slightly by ~100-200kB.
		// In such scenarios another run of test should pass.
		this.retries( 2 );

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
		// Wait for any delayed actions (after editor creation)
		.then( wait( 200 ) )
		.then( collectGarbageAndWait )
		.then( editor => {
			memoryAfterFirstStart = snapMemInfo();

			return editor;
		} )
		.then( destroy )
		// Run create-wait-destroy multiple times. Multiple runs to grow memory significantly even on smaller leaks.
		.then( testWaitAndDestroy )
		.then( testWaitAndDestroy )
		.then( testWaitAndDestroy )
		.then( testWaitAndDestroy )
		.then( testWaitAndDestroy )
		.then( testWaitAndDestroy )
		// Finally enforce garbage collection to ensure memory is freed before measuring heap size.
		.then( collectGarbageAndWait )
		.then( () => {
			const memory = snapMemInfo();

			const memoryDifference = memory.usedJSHeapSize - memoryAfterFirstStart.usedJSHeapSize;

			expect( memoryDifference, 'used heap size should not grow above 1 MB' ).to.be.below( MiB );
		} );

	function testWaitAndDestroy() {
		return Promise.resolve()
			.then( createEditor )
			.then( wait( 200 ) )
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

function snapMemInfo() {
	const memeInfo = window.performance.memory;

	return {
		totalJSHeapSize: memeInfo.totalJSHeapSize,
		usedJSHeapSize: memeInfo.usedJSHeapSize,
		jsHeapSizeLimit: memeInfo.jsHeapSizeLimit
	};
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

function collectGarbageAndWait( pass ) {
	window.gc();

	return Promise.resolve( pass ).then( wait( 500 ) );
}

// Simple method that returns a helper method that returns a promise which resolves after given timeout.
// The returned promise will pass the value from previus call (usually and editor instance).
function wait( ms ) {
	return editor => new Promise( resolve => setTimeout( () => resolve( editor ), ms ) );
}
