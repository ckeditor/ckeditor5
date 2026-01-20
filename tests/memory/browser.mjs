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

export async function runTestInPage( browser, url, editorName, timeout ) {
	const context = await browser.createBrowserContext();
	const page = await context.newPage();

	page.setDefaultTimeout( timeout );

	// Suppress verbose logs, only show errors or critical info if needed
	page.on( 'pageerror', error => {
		console.error( `[${ editorName }] Browser error: ${ error }` );
	} );

	await page.goto( url, { waitUntil: 'networkidle0' } );
	await page.waitForFunction( () => globalThis.__memoryTestReady === true );

	const result = await page.evaluate( async ( name, timeoutMs ) => {
		const { createEditorFactory, runMemoryTestWithTimeout } = globalThis.__memoryTest;
		return runMemoryTestWithTimeout( createEditorFactory( name ), timeoutMs, name );
	}, editorName, timeout );

	await context.close();

	return result;
}
