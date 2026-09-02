/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { nth } from '../src/nth.js';

describe( 'utils', () => {
	describe( 'nth', () => {
		it( 'should return 0th item', () => {
			expect( nth( 0, getGenerator() ) ).toEqual( 11 );
		} );

		it( 'should return the last item', () => {
			expect( nth( 2, getGenerator() ) ).toEqual( 33 );
		} );

		it( 'should return null if out of range (bottom)', () => {
			expect( nth( -1, getGenerator() ) ).toBeNull();
		} );

		it( 'should return null if out of range (top)', () => {
			expect( nth( 3, getGenerator() ) ).toBeNull();
		} );

		it( 'should return null if iterator is empty', () => {
			expect( nth( 0, [] ) ).toBeNull();
		} );

		it( 'should consume the given generator', () => {
			const generator = getGenerator();

			nth( 0, generator );

			expect( generator.next().done ).toEqual( true );
		} );

		it( 'should stop inside the given iterator', () => {
			const collection = [ 11, 22, 33 ];
			const iterator = collection[ Symbol.iterator ]();

			nth( 0, iterator );

			expect( iterator.next().value ).toEqual( 22 );
		} );

		function* getGenerator() {
			yield 11;
			yield 22;
			yield 33;
		}
	} );
} );
