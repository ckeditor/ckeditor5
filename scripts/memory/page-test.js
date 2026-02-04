/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Browser-side test logic for memory leak testing.
 *
 * This script runs inside the Puppeteer-controlled browser and performs the actual
 * editor create/destroy cycles while sampling memory usage.
 *
 * Notable implementation details:
 * - Performs `WARMUP_CYCLE_COUNT` cycles to fill initial module-level caches before taking a baseline.
 * - Samples memory `MEMORY_SAMPLES` times after each cycle, forcing GC and waiting for frames
 *   to ensure the measurement is stable and "clean".
 * - Returns raw memory data (baseline, final, and "tail" samples) to the Node.js runner for assertion.
 * - Uses `performance.measureUserAgentSpecificMemory()` as the primary measurement tool, which is
 *   more accurate and reliable than `performance.memory` for detecting leaks.
 */

const CYCLE_COUNT = 10;
const CYCLE_PAUSE = 100;
const MEMORY_SAMPLES = 3;
const WARMUP_CYCLE_COUNT = 5;
const PLATEAU_SAMPLE_COUNT = 3;
const GARBAGE_COLLECTOR_TIMEOUT = 100;

function timeout( ms ) {
	return new Promise( resolve => setTimeout( resolve, ms ) );
}

async function runMemoryTest( { editorName, editorData } ) {
	for ( let index = 0; index < WARMUP_CYCLE_COUNT; index++ ) {
		await createAndDestroy( editorName, editorData );
		await timeout( CYCLE_PAUSE );
	}

	const baseline = await collectMemoryStatsStable();
	const points = [];

	for ( let index = 0; index < CYCLE_COUNT; index++ ) {
		await createAndDestroy( editorName, editorData );
		await timeout( CYCLE_PAUSE );
		points.push( await collectMemoryStatsStable() );
	}

	const after = points.length ? points[ points.length - 1 ] : await collectMemoryStatsStable();
	const tail = points.slice( -PLATEAU_SAMPLE_COUNT );
	const tailGrowth = tail.length ? Math.max( ...tail ) - Math.min( ...tail ) : 0;
	const memoryDifference = after - baseline;

	return {
		baseline,
		after,
		memoryDifference,
		points,
		tailGrowth
	};
}

async function runMemoryTestWithTimeout( { editorName, editorData, timeoutMs } ) {
	return Promise.race( [
		runMemoryTest( { editorName, editorData } ),

		new Promise( ( _, reject ) => setTimeout( () => reject( new Error( `Memory test timed out (${ editorName }).` ) ), timeoutMs ) )
	] );
}

function nextFrame() {
	return new Promise( resolve => {
		requestAnimationFrame( () => requestAnimationFrame( resolve ) );
	} );
}

async function collectMemoryStatsStable( samples = MEMORY_SAMPLES ) {
	const values = [];

	for ( let i = 0; i < samples; i++ ) {
		window.gc();

		// Wait for a frame boundary so DOM/rendering work triggered by the previous step
		// can progress (rAF/layout/style/paint are typically coordinated around frames).
		await nextFrame();

		// Give the engine a short idle window for GC and deferred cleanup to run before sampling.
		// (GC isn't guaranteed, but this reduces measurement noise.)
		await timeout( GARBAGE_COLLECTOR_TIMEOUT );

		values.push( await readUsedMemory() );
	}

	return Math.min( ...values );
}

async function readUsedMemory() {
	if ( typeof performance.measureUserAgentSpecificMemory === 'function' ) {
		const result = await performance.measureUserAgentSpecificMemory();
		return result.bytes;
	}

	return performance.memory.usedJSHeapSize;
}

async function createAndDestroy( editorName, editorData ) {
	// Clone the editor fixture template.
	const host = document
		.getElementById( 'memory-test-fixture' )
		.content
		.children[ 0 ]
		.cloneNode( true );

	// Assign a unique ID to avoid collisions.
	host.id = 'test-instance-' + self.crypto.randomUUID();

	// Append the host to the document.
	document.body.appendChild( host );

	// Create the editor instance.
	const editor = await globalThis.createEditor( host.id, editorName, editorData );

	/*
	 * We use timeout here to avoid the following error:
	 *
	 * ```
	 * CKEditorCloudServicesError: CKEditorError: cloud-services-internal-error: Not connected.
	 * ```
	 *
	 * See https://github.com/cksource/cs/issues/27229 for more details.
	 */
	await timeout( 500 );

	// Destroy the editor.
	await editor.destroy();

	// Remove the host element.
	host.remove();

	// Flush the microtask queue (Promise callbacks) scheduled during destroy().
	// This helps run any "cleanup in then()" logic before we continue.
	await Promise.resolve();

	// Yield to the macrotask queue (setTimeout/message events). This lets any cleanup
	// scheduled via timers run (or get scheduled) before we take a measurement.
	await timeout( 0 );

	// Wait for a frame boundary. Many DOM-related follow-ups (layout/style recalcs,
	// rAF callbacks, painting) are coordinated around frames, so this helps the browser
	// settle after DOM mutations.
	await nextFrame();

	// Yield once more to catch cleanup that was scheduled by the previous macrotask/frame
	// (e.g. destroy() -> timer -> timer, or work queued from rAF).
	await timeout( 0 );
}

globalThis.runMemoryTestWithTimeout = runMemoryTestWithTimeout;
globalThis.memoryTestReady = true;
