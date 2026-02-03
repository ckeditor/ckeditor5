/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Provides an interface to launch and control a Puppeteer browser instance tailored for memory testing.
 *
 * Notable implementation details:
 * - Launches Chromium with specific flags (`--expose-gc`, `--enable-precise-memory-info`) to allow
 *   manual garbage collection and high-resolution memory measurements.
 * - Uses `--enable-blink-features=ForceEagerMeasureMemory` to skip the artificial 20-second delay
 *   in `performance.measureUserAgentSpecificMemory()`, significantly speeding up the test run.
 * - Uses `BrowserContext` isolation for each test run to ensure a clean state (no shared caches/cookies).
 * - Disables background throttling and networking to minimize noise during memory sampling.
 */

import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import puppeteer from 'puppeteer';

export async function startBrowser() {
	return puppeteer.launch( {
		headless: 'new',
		args: [
			'--js-flags=--expose-gc',
			'--enable-precise-memory-info',
			'--enable-blink-features=ForceEagerMeasureMemory',
			'--disable-background-timer-throttling',
			'--disable-renderer-backgrounding',
			'--disable-background-networking',
			'--no-first-run',
			'--no-default-browser-check'
		]
	} );
}

export async function runTestInPage( {
	browser,
	url,
	editorName,
	editorData,
	timeout
} ) {
	const context = await browser.createBrowserContext();
	const page = await context.newPage();

	page.setDefaultTimeout( timeout );
	page.on( 'pageerror', error => console.error( `Browser error: ${ error }` ) );
	// Uncomment to see browser console logs.
	// page.on( 'console', msg => console.log( `Browser log: ${ msg.text() }` ) );

	const memoryTestSource = await readFile( join( import.meta.dirname, 'page-test.js' ), 'utf8' );

	await page.goto( url, { waitUntil: 'networkidle0' } );
	await page.addScriptTag( { content: memoryTestSource, type: 'module' } );
	await page.waitForFunction( () => globalThis.memoryTestReady === true );

	const result = await page.evaluate( async ( editorName, editorData, timeoutMs ) => {
		return globalThis.runMemoryTestWithTimeout( {
			editorName,
			editorData,
			timeoutMs
		} );
	}, editorName, editorData, timeout );

	await context.close();

	return result;
}
