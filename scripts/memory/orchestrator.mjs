/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Main orchestration script for memory leak tests.
 *
 * This script coordinates the test execution by:
 * 1. Starting a local HTTP server with COOP/COEP headers (required for precise memory measurement).
 * 2. Launching a Puppeteer browser with memory-tracking flags.
 * 3. Running each editor type in a fresh, isolated browser context, up to `concurrency` at a time.
 *    Browser contexts never share renderer processes, and `performance.measureUserAgentSpecificMemory()`
 *    only measures the page's own process, so concurrent runs do not affect each other's measurements.
 * 4. Calculating and reporting results (Baseline, Growth, Tail Growth) in a formatted table.
 * 5. Exiting with a non-zero code if any leaks or errors are detected.
 */

import { styleText } from 'node:util';
import { startServer } from './server.mjs';
import { startBrowser, runTestInPage } from './browser.mjs';

const bytesToMiB = bytes => Math.round( ( bytes / 1024 / 1024 ) * 100 ) / 100;

export async function startMemoryTest( {
	assetsDir,
	html,
	timeout,
	memoryThreshold,
	editorNames,
	editorData,
	concurrency = editorNames.length
} ) {
	if ( !Number.isInteger( concurrency ) || concurrency < 1 ) {
		throw new Error( `Invalid "concurrency" value: ${ concurrency }. Expected a positive integer.` );
	}

	const server = await startServer( assetsDir );
	const port = server.address().port;

	let browser;
	const results = new Array( editorNames.length );
	let hasFailure = false;

	try {
		browser = await startBrowser();

		const runSingleTest = async index => {
			const editorName = editorNames[ index ];

			console.log( `Testing ${ editorName }... ` );

			try {
				const result = await runTestInPage( {
					browser,
					url: `http://127.0.0.1:${ port }/${ html }`,
					editorName,
					editorData: typeof editorData === 'function' ? editorData( editorName ) : editorData,
					timeout
				} );

				const exceedsThreshold = result.memoryDifference > memoryThreshold || result.tailGrowth > memoryThreshold;

				if ( exceedsThreshold ) {
					hasFailure = true;
				}

				results[ index ] = {
					Editor: editorName,
					'Baseline (MB)': bytesToMiB( result.baseline ),
					'Growth (MB)': bytesToMiB( result.memoryDifference ),
					'Tail Growth (MB)': bytesToMiB( result.tailGrowth ),
					Status: exceedsThreshold ? 'Exceeds threshold' : 'OK'
				};
			} catch ( error ) {
				hasFailure = true;

				results[ index ] = {
					Editor: editorName,
					'Baseline (MB)': '-',
					'Growth (MB)': '-',
					'Tail Growth (MB)': '-',
					Status: 'Error'
				};

				console.error( `${ editorName }: ${ error.message }` );
			}
		};

		let nextIndex = 0;
		const workerCount = Math.max( 1, Math.min( concurrency, editorNames.length ) );

		await Promise.all( Array.from( { length: workerCount }, async () => {
			while ( nextIndex < editorNames.length ) {
				await runSingleTest( nextIndex++ );
			}
		} ) );
	} finally {
		if ( browser ) {
			await browser.close();
		}

		server.close();
	}

	console.log( '\n' + styleText( 'bold', 'Memory Test Results:' ) );
	console.log( styleText( 'bold', '* Baseline: ' ) + 'Initial memory after warmup.' );
	console.log( styleText( 'bold', '* Growth: ' ) + 'Total growth from baseline to end.' );
	console.log( styleText( 'bold', '* Tail Growth: ' ) + 'Difference in the last few samples (indicates if memory has stabilized).' );
	console.log( styleText( 'dim', `Threshold: ${ bytesToMiB( memoryThreshold ) } MB` ) );
	console.table( results );

	if ( hasFailure ) {
		process.exit( 1 );
	}
}
