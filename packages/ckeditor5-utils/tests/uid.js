/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { uid } from '../src/uid.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe( 'utils', () => {
	describe( 'uid', () => {
		afterEach( () => {
			vi.restoreAllMocks();
		} );

		it( 'should return different ids', () => {
			const id1 = uid();
			const id2 = uid();
			const id3 = uid();

			expect( id1 ).toEqual( expect.any( String ) );
			expect( id2 ).toEqual( expect.any( String ) );
			expect( id3 ).toEqual( expect.any( String ) );
			expect( id2 ).not.toBe( id1 );
			expect( id2 ).not.toBe( id3 );
			expect( id3 ).not.toBe( id1 );
			expect( id3 ).not.toBe( id2 );

			const uuidRegex = /^e[a-f0-9]{32}$/;

			expect( id1 ).toMatch( uuidRegex );
			expect( id2 ).toMatch( uuidRegex );
			expect( id3 ).toMatch( uuidRegex );
		} );

		it( 'should not use Math.random()', () => {
			const spy = vi.spyOn( Math, 'random' );

			uid();

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );
} );
