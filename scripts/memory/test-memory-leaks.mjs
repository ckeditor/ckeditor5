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

const EDITOR_NAMES = [
	'BalloonEditor',
	'ClassicEditor',
	'DecoupledEditor',
	'InlineEditor',
	'MultiRootEditor'
];

const TEST_TIMEOUT = 300_000;
const MEMORY_THRESHOLD = 2 * 1024 * 1024; // 2 MB

const bytesToMiB = bytes => Math.round( ( bytes / 1024 / 1024 ) * 100 ) / 100;

async function main() {
	const server = await startServer();
	const port = server.address().port;
	const baseUrl = `http://127.0.0.1:${ port }`;

	let browser;
	const results = [];
	let hasFailure = false;

	try {
		browser = await startBrowser();

		for ( const editorName of EDITOR_NAMES ) {
			console.log( `Testing ${ editorName }... ` );

			try {
				const result = await runTestInPage( browser, `${ baseUrl }/index.html`, editorName, TEST_TIMEOUT );
				const exceedsThreshold = result.memoryDifference > MEMORY_THRESHOLD || result.tailGrowth > MEMORY_THRESHOLD;

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
	console.log( styleText( 'dim', `Threshold: ${ bytesToMiB( MEMORY_THRESHOLD ) } MB` ) );
	console.table( results );

	if ( hasFailure ) {
		process.exit( 1 );
	}
}

main().catch( error => {
	console.error( error );
	process.exit( 1 );
} );
