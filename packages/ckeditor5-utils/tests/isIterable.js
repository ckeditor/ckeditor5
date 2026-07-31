/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { isIterable } from '../src/isiterable.js';

describe( 'utils', () => {
	describe( 'isIterable', () => {
		it( 'should be true for string', () => {
			const string = 'foo';

			expect( isIterable( string ) ).toBe( true );
		} );

		it( 'should be true for arrays', () => {
			const array = [ 1, 2, 3 ];

			expect( isIterable( array ) ).toBe( true );
		} );

		it( 'should be true for iterable classes', () => {
			class IterableClass {
				constructor() {
					this.array = [ 1, 2, 3 ];
				}

				[ Symbol.iterator ]() {
					return this.array[ Symbol.iterator ]();
				}
			}

			const instance = new IterableClass();

			expect( isIterable( instance ) ).toBe( true );
		} );

		it( 'should be false for not iterable objects', () => {
			const notIterable = { foo: 'bar' };

			expect( isIterable( notIterable ) ).toBe( false );
		} );

		it( 'should be false for undefined', () => {
			expect( isIterable() ).toBe( false );
		} );
	} );
} );
