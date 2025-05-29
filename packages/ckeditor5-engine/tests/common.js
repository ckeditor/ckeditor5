/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// eslint-disable-next-line mocha/no-top-level-hooks
before( () => {
	// This is a temporary special handling for https://github.com/ckeditor/ckeditor5/issues/8263
	// The goal is to show which test case(s) exactly causes the "Selection change observer detected an infinite rendering loop." warn
	// and reduced engine code coverage.
	const originalWarn = console.warn;

	console.warn = function( ...args ) {
		if ( args[ 0 ].endsWith( 'Selection change observer detected an infinite rendering loop.' ) ) {
			throw new Error( 'Detected unwelcome "Selection change observer detected an infinite rendering loop." warning.' );
		}

		return originalWarn.apply( args );
	};
} );
