#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { resolve } from 'node:path';
import { styleText } from 'node:util';
import { build, preview } from 'vite';
import { DEFAULT_CONCURRENCY, DEFAULT_TIMEOUT, runCrawler } from '@ckeditor/ckeditor5-dev-web-crawler';

// The Vite config is resolved from the current working directory so the script adapts to the repository it is run from.
const configFile = resolve( process.cwd(), 'vite.manual.mts' );

try {
	console.log( styleText( [ 'bold', 'green' ], 'Building manual tests using Vite...' ) );

	await build( { configFile } );

	console.log( styleText( [ 'bold', 'green' ], 'Starting the Vite manual test preview server...' ) );

	// The preview server runs inside this process (not a spawned child), and `runCrawler()` ends the
	// process itself via `process.exit()` once crawling finishes. So the server is always torn down
	// with the process - there is nothing to close explicitly and no background server left to hang on.
	const server = await preview( { configFile } );
	const url = server.resolvedUrls.local[ 0 ];

	console.log( styleText( [ 'bold', 'green' ], `Verifying manual tests at ${ url }` ) );

	await runCrawler( {
		url,
		depth: 1,
		exclusions: [],
		concurrency: Math.min( DEFAULT_CONCURRENCY, 12 ),
		timeout: DEFAULT_TIMEOUT,
		silent: false,
		ignoreHTTPSErrors: true
	} );
} catch ( error ) {
	console.error( styleText( [ 'bold', 'red' ], 'Verifying manual tests failed:' ) );
	console.error( error );

	// Force the exit because the in-process preview server would otherwise keep the event loop alive.
	// Exiting also tears the server down, so no port is left occupied.
	process.exit( 1 );
}
