/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, afterEach } from 'vitest';

import { SelectionObserver } from '../src/view/observer/selectionobserver.js';

// Special handling for https://github.com/ckeditor/ckeditor5/issues/8263.
//
// The goal is to fail (and thereby identify) the exact test case that makes `SelectionObserver` detect
// an infinite rendering loop. The detection itself is silent outside debug builds (`_reportInfiniteLoop()`
// is a no-op unless the `CK_DEBUG` code is enabled), so without this hook a rendering loop triggered by
// a test would go unnoticed.
//
// The method is patched with a plain function instead of `vi.spyOn()` so that a `vi.restoreAllMocks()`
// call in a test does not silently remove the guard. Tests that spy on `_reportInfiniteLoop()` on an
// observer instance (like the `SelectionObserver` suite) shadow this prototype patch and are unaffected.
let infiniteLoopDetected = false;

// Reuse the already unwrapped method if this setup file is evaluated again in the same environment,
// so the patch never wraps itself.
const originalReportInfiniteLoop =
	SelectionObserver.prototype._reportInfiniteLoop.__ckOriginalReportInfiniteLoop ||
	SelectionObserver.prototype._reportInfiniteLoop;

SelectionObserver.prototype._reportInfiniteLoop = function( ...args ) {
	infiniteLoopDetected = true;

	return originalReportInfiniteLoop.apply( this, args );
};

SelectionObserver.prototype._reportInfiniteLoop.__ckOriginalReportInfiniteLoop = originalReportInfiniteLoop;

beforeEach( () => {
	infiniteLoopDetected = false;
} );

afterEach( () => {
	if ( infiniteLoopDetected ) {
		throw new Error(
			'This test made the selection change observer detect an infinite rendering loop. ' +
			'See https://github.com/ckeditor/ckeditor5/issues/8263.'
		);
	}
} );
