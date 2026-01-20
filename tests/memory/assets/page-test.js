/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Browser-side test logic for CKEditor 5 memory leak testing.
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

import * as CKEDITOR from 'ckeditor5';

const CYCLE_COUNT = 5;
const CYCLE_PAUSE = 1000;
const MEMORY_SAMPLES = 5;
const WARMUP_CYCLE_COUNT = 3;
const PLATEAU_SAMPLE_COUNT = 3;
const GARBAGE_COLLECTOR_TIMEOUT = 500;

const EDITOR_CONFIG = {
	licenseKey: 'GPL',
	plugins: [
		CKEDITOR.Essentials,
		CKEDITOR.Autoformat,
		CKEDITOR.BlockQuote,
		CKEDITOR.Bold,
		CKEDITOR.Heading,
		CKEDITOR.Image,
		CKEDITOR.ImageCaption,
		CKEDITOR.ImageStyle,
		CKEDITOR.ImageToolbar,
		CKEDITOR.Indent,
		CKEDITOR.Italic,
		CKEDITOR.Link,
		CKEDITOR.List,
		CKEDITOR.MediaEmbed,
		CKEDITOR.Paragraph,
		CKEDITOR.Table,
		CKEDITOR.TableToolbar
	],
	toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
	image: {
		toolbar: [ 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
	}
};

function timeout( ms ) {
	return new Promise( resolve => setTimeout( resolve, ms ) );
}

function createEditorFactory( editorName ) {
	const EditorClass = CKEDITOR[ editorName ];

	if ( editorName === 'MultiRootEditor' ) {
		return host => EditorClass.create( { foo: host }, EDITOR_CONFIG );
	}

	return host => EditorClass.create( host, EDITOR_CONFIG );
}

async function runMemoryTest( createEditor, label = 'editor' ) {
	for ( let index = 0; index < WARMUP_CYCLE_COUNT; index++ ) {
		await createAndDestroyWithTimeout( createEditor, label, 'warmup' );
		await timeout( CYCLE_PAUSE );
	}

	const baseline = await collectMemoryStatsStable();
	const points = [];

	for ( let index = 0; index < CYCLE_COUNT; index++ ) {
		await createAndDestroyWithTimeout( createEditor, label, `cycle-${ index + 1 }` );
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

async function runMemoryTestWithTimeout( createEditor, timeoutMs = 120000, label = 'editor' ) {
	return withTimeout( runMemoryTest( createEditor, label ), timeoutMs, `Memory test timed out (${ label }).` );
}

function nextFrame() {
	return new Promise( resolve => {
		requestAnimationFrame( () => requestAnimationFrame( resolve ) );
	} );
}

function withTimeout( promise, timeoutMs, message ) {
	return Promise.race( [
		promise,
		new Promise( ( _resolve, reject ) => {
			setTimeout( () => reject( new Error( message ) ), timeoutMs );
		} )
	] );
}

async function collectMemoryStatsStable( samples = MEMORY_SAMPLES ) {
	const values = [];

	for ( let i = 0; i < samples; i++ ) {
		window.gc?.();

		await nextFrame();
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

async function createAndDestroy( createEditor ) {
	const element = document.createElement( 'div' );
	element.id = 'mem-editor';
	element.innerHTML = '<h2>Editor 1</h2>\n<p>This is an editor instance.</p>';
	document.body.appendChild( element );

	const editor = await createEditor( element );
	await editor.destroy();

	await Promise.resolve();
	await timeout( 0 );
	await nextFrame();
	await timeout( 0 );

	element.remove();
}

async function createAndDestroyWithTimeout( createEditor, label, phase ) {
	return withTimeout(
		createAndDestroy( createEditor ),
		60000,
		`Editor lifecycle timed out (${ label }, ${ phase }).`
	);
}

globalThis.__memoryTest = {
	createEditorFactory,
	runMemoryTest,
	runMemoryTestWithTimeout
};

globalThis.__memoryTestReady = true;
