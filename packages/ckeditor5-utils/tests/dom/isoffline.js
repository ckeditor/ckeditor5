/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
import { isOffline } from '../../src/dom/isoffline.js';

describe( 'isOffline()', () => {
	it( 'should return `false` when the browser reports a network connection', () => {
		vi.spyOn( window.navigator, 'onLine', 'get' ).mockReturnValue( true );

		expect( isOffline() ).toBe( false );
	} );

	it( 'should return `true` when the browser reports no network connection', () => {
		vi.spyOn( window.navigator, 'onLine', 'get' ).mockReturnValue( false );

		expect( isOffline() ).toBe( true );
	} );

	it( 'should read the current connection state on each call', () => {
		// The value must not be cached, as the connection may be lost (and regained) while a request is in flight.
		const onLineStub = vi.spyOn( window.navigator, 'onLine', 'get' ).mockReturnValue( true );

		expect( isOffline() ).toBe( false );

		onLineStub.mockReturnValue( false );

		expect( isOffline() ).toBe( true );

		onLineStub.mockReturnValue( true );

		expect( isOffline() ).toBe( false );
	} );

	it( 'should always return a boolean', () => {
		const onLineStub = vi.spyOn( window.navigator, 'onLine', 'get' ).mockReturnValue( undefined );

		expect( isOffline() ).toBe( true );

		onLineStub.mockReturnValue( 1 );

		expect( isOffline() ).toBe( false );
	} );
} );
