/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
import { global } from '../../src/dom/global.js';

describe( 'global', () => {
	describe( 'global', () => {
		describe( 'window', () => {
			it( 'equals native DOM window', () => {
				expect( global.window ).toBe( window );
			} );

			it( 'stubs', () => {
				vi.spyOn( global, 'window', 'get' ).mockReturnValue( {
					scrollX: 100
				} );

				expect( global.window ).toEqual( {
					scrollX: 100
				} );
			} );
		} );

		describe( 'document', () => {
			it( 'equals native DOM document', () => {
				expect( global.document ).toBe( document );
			} );

			it( 'stubs', () => {
				vi.spyOn( global, 'document', 'get' ).mockReturnValue( {
					foo: 'abc'
				} );

				expect( global.document ).toEqual( {
					foo: 'abc'
				} );
			} );
		} );
	} );
} );
