/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, afterEach } from 'vitest';

import { toPrecision, toggleResizingCursor } from '../../src/utils/resize.js';

describe( 'table resize utils', () => {
	describe( 'toPrecision()', () => {
		it( 'should properly round numbers to defined precision', () => {
			expect( toPrecision( 1 ) ).toEqual( 1 );
			expect( toPrecision( 10000 ) ).toEqual( 10000 );
			expect( toPrecision( 1.1 ) ).toEqual( 1.1 );
			expect( toPrecision( 1.12 ) ).toEqual( 1.12 );
			expect( toPrecision( 1.123 ) ).toEqual( 1.12 );
			expect( toPrecision( 1.125 ) ).toEqual( 1.13 );
			expect( toPrecision( 0.99 ) ).toEqual( 0.99 );
			expect( toPrecision( 0.999 ) ).toEqual( 1 );
		} );
	} );

	describe( 'toggleResizingCursor()', () => {
		const CLASS_NAME = 'ck-test-resizing-cursor';

		afterEach( () => {
			document.body.classList.remove( CLASS_NAME );
		} );

		it( 'should toggle the class on the body', () => {
			toggleResizingCursor( CLASS_NAME, 'row-resize', true );

			expect( document.body.classList.contains( CLASS_NAME ) ).toBe( true );

			toggleResizingCursor( CLASS_NAME, 'row-resize', false );

			expect( document.body.classList.contains( CLASS_NAME ) ).toBe( false );
		} );

		it( 'should style the body with a rule adopted into the document, so it works without a light DOM stylesheet', () => {
			toggleResizingCursor( CLASS_NAME, 'row-resize', true );

			expect( window.getComputedStyle( document.body ).cursor ).toBe( 'row-resize' );

			toggleResizingCursor( CLASS_NAME, 'row-resize', false );

			expect( window.getComputedStyle( document.body ).cursor ).not.toBe( 'row-resize' );
		} );

		it( 'should set the cursor inside a shadow root too', () => {
			const host = document.createElement( 'div' );
			const content = document.createElement( 'p' );

			host.attachShadow( { mode: 'open' } ).appendChild( content );
			document.body.appendChild( host );

			toggleResizingCursor( CLASS_NAME, 'row-resize', true );

			expect( window.getComputedStyle( content ).cursor ).toBe( 'row-resize' );

			toggleResizingCursor( CLASS_NAME, 'row-resize', false );

			expect( window.getComputedStyle( content ).cursor ).not.toBe( 'row-resize' );

			host.remove();
		} );
	} );
} );
