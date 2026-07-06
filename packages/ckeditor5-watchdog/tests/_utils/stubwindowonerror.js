/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { vi, onTestFinished } from 'vitest';

/**
 * Replaces `window.onerror` with a spy, so tests can throw uncaught errors on purpose (to be caught by
 * the watchdog's own `window` listeners) and assert the errors that reached `window.onerror`.
 *
 * `CKEditorError` errors — the ones watchdog tests throw on purpose — are swallowed silently. Any other
 * error caught by the stub, including one thrown while the test cleans up (for example during
 * `watchdog.destroy()`), is re-thrown when the test finishes and fails the test, so the stub does not
 * hide unexpected failures. The test runner alone would only log such errors without failing anything,
 * as its error tracker mutes itself while the watchdog `error` listeners are registered. Tests that
 * throw non-`CKEditorError` values on purpose can opt out with `{ swallowAllErrors: true }`.
 *
 * Call it at the beginning of a test or in `beforeEach()`. The original handler is re-registered
 * automatically when the test finishes.
 *
 * Note: `vi.stubGlobal()` cannot be used here. `window.onerror` is a native accessor, so the spy must be
 * installed through the native setter (a `defineProperty()`-based stub would never be called by the
 * browser), and the automatic `unstubGlobals` cleanup only restores the property shape — it would leave
 * the spy registered as the actual error handler for subsequent tests.
 *
 * @param {Object} [options]
 * @param {Boolean} [options.swallowAllErrors=false] Whether the stub should swallow all uncaught errors
 * instead of only `CKEditorError` instances.
 * @returns {Object} The spy installed as `window.onerror`.
 */
export function stubWindowOnError( { swallowAllErrors = false } = {} ) {
	const originalHandler = window.onerror;
	const unexpectedErrors = [];

	const spy = vi.fn( ( ...args ) => {
		const error = args[ 4 ];

		// Calls without an error object (for example ResizeObserver loop notifications) are ignored,
		// mirroring the test runner's own error tracker.
		if ( swallowAllErrors || !error || error.name === 'CKEditorError' ) {
			return;
		}

		unexpectedErrors.push( error );
	} );

	window.onerror = spy;

	onTestFinished( () => {
		window.onerror = originalHandler;

		if ( unexpectedErrors.length ) {
			throw unexpectedErrors[ 0 ];
		}
	} );

	return spy;
}
