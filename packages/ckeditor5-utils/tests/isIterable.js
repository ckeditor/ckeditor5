/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import isIterable from '../src/isiterable';

describe( 'utils', () => {
	describe( 'isIterable', () => {
		it( 'should be true for string', () => {
			const string = 'foo';

			expect( isIterable( string ) ).to.be.true;
		} );

		it( 'should be true for arrays', () => {
			const array = [ 1, 2, 3 ];

			expect( isIterable( array ) ).to.be.true;
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

			expect( isIterable( instance ) ).to.be.true;
		} );

		it( 'should be false for not iterable objects', () => {
			const notIterable = { foo: 'bar' };

			expect( isIterable( notIterable ) ).to.be.false;
		} );

		it( 'should be false for undefined', () => {
			expect( isIterable() ).to.be.false;
		} );
	} );
} );
