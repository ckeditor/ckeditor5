/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { isWindow } from '../../src/dom/iswindow.js';

describe( 'isWindow()', () => {
	it( 'detects DOM Window in browsers', () => {
		expect( isWindow( window ) ).toBe( true );
		expect( isWindow( {} ) ).toBe( false );
		expect( isWindow( null ) ).toBe( false );
		expect( isWindow( undefined ) ).toBe( false );
		expect( isWindow( new Date() ) ).toBe( false );
		expect( isWindow( 42 ) ).toBe( false );
	} );

	it( 'detects DOM Window in the Electron environment', () => {
		const global = {
			get [ Symbol.toStringTag ]() {
				return 'global';
			}
		};

		expect( isWindow( global ) ).toBe( true );
	} );
} );
