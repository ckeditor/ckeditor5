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
 * 3. Iterating through different editor types, running each in a fresh, isolated browser context.
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
	editorData
} ) {
	const server = await startServer( assetsDir );
	const port = server.address().port;

	let browser;
	const results = [];
	let hasFailure = false;

	try {
		browser = await startBrowser();

		for ( const editorName of editorNames ) {
			console.log( `Testing ${ editorName }... ` );

			try {
				const result = await runTestInPage( {
					browser,
					url: `http://127.0.0.1:${ port }/${ html }`,
					editorName,
					editorData,
					timeout
				} );

				const exceedsThreshold = result.memoryDifference > memoryThreshold || result.tailGrowth > memoryThreshold;

				if ( exceedsThreshold ) {
					hasFailure = true;
				}

				results.push( {
					Editor: editorName,
					'Baseline (MB)': bytesToMiB( result.baseline ),
					'Growth (MB)': bytesToMiB( result.memoryDifference ),
					'Tail Growth (MB)': bytesToMiB( result.tailGrowth ),
					Status: exceedsThreshold ? 'Exceeds threshold' : 'OK'
				} );
			} catch ( error ) {
				hasFailure = true;

				results.push( {
					Editor: editorName,
					'Baseline (MB)': '-',
					'Growth (MB)': '-',
					'Tail Growth (MB)': '-',
					Status: 'Error'
				} );

				console.error( error.message );
			}
		}
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
