/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';

import { getVisualViewportOffset } from '../../src/dom/getvisualviewportoffset.js';
import { env } from '../../src/env.js';

describe( 'getVisualViewportOffset()', () => {
	it( 'should return 0 offsets if there is no window.visualViewport', () => {
		vi.spyOn( window, 'visualViewport', 'get' ).mockReturnValue( null );

		expect( getVisualViewportOffset() ).toEqual( { left: 0, top: 0 } );
	} );

	it( 'should return 0 offsets on non Safari', () => {
		vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( false );
		vi.spyOn( env, 'isSafari', 'get' ).mockReturnValue( false );
		vi.spyOn( window.visualViewport, 'offsetLeft', 'get' ).mockReturnValue( 14 );
		vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockReturnValue( 234 );

		expect( getVisualViewportOffset() ).toEqual( { left: 0, top: 0 } );
	} );

	it( 'should return offsets on iOS', () => {
		vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );
		vi.spyOn( window.visualViewport, 'offsetLeft', 'get' ).mockReturnValue( 14 );
		vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockReturnValue( 234 );

		expect( getVisualViewportOffset() ).toEqual( { left: 14, top: 234 } );
	} );

	it( 'should return offsets in Safari', () => {
		vi.spyOn( env, 'isSafari', 'get' ).mockReturnValue( true );
		vi.spyOn( window.visualViewport, 'offsetLeft', 'get' ).mockReturnValue( 14 );
		vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockReturnValue( 234 );

		expect( getVisualViewportOffset() ).toEqual( { left: 14, top: 234 } );
	} );

	it( 'should return round offsets', () => {
		vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );
		vi.spyOn( window.visualViewport, 'offsetLeft', 'get' ).mockReturnValue( 14.3 );
		vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockReturnValue( 233.7 );

		expect( getVisualViewportOffset() ).toEqual( { left: 14, top: 234 } );
	} );

	it( 'should not return negative offset left', () => {
		vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );
		vi.spyOn( window.visualViewport, 'offsetLeft', 'get' ).mockReturnValue( -14 );
		vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockReturnValue( 234 );

		expect( getVisualViewportOffset() ).toEqual( { left: 0, top: 234 } );
	} );

	it( 'should not return negative offset top', () => {
		vi.spyOn( env, 'isiOS', 'get' ).mockReturnValue( true );
		vi.spyOn( window.visualViewport, 'offsetLeft', 'get' ).mockReturnValue( 14 );
		vi.spyOn( window.visualViewport, 'offsetTop', 'get' ).mockReturnValue( -234 );

		expect( getVisualViewportOffset() ).toEqual( { left: 14, top: 0 } );
	} );
} );
