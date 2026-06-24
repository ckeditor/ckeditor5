/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// This is a temporary special handling for https://github.com/ckeditor/ckeditor5/issues/8263
// The goal is to show which test case(s) exactly causes the "Selection change observer detected an infinite rendering loop." warn
// and reduced engine code coverage.
//
// Guard prevents re-wrapping when this setup file is executed for each test file in the same worker.
if ( !console.warn.__ckEngineInfiniteLoopGuard ) {
	const originalWarn = console.warn;

	console.warn = function( ...args ) {
		if ( typeof args[ 0 ] === 'string' && args[ 0 ].endsWith( 'Selection change observer detected an infinite rendering loop.' ) ) {
			throw new Error( 'Detected unwelcome "Selection change observer detected an infinite rendering loop." warning.' );
		}

		return originalWarn.apply( console, args );
	};

	console.warn.__ckEngineInfiniteLoopGuard = true;
}
