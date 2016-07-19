/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import isIterable from '/ckeditor5/utils/isiterable.js';

describe( 'utils', () => {
	describe( 'isIterable', () => {
		it( 'should be true for string', () => {
			let string = 'foo';

			expect( isIterable( string ) ).to.be.true;
		} );

		it( 'should be true for arrays', () => {
			let array = [ 1, 2, 3 ];

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

			let instance = new IterableClass();

			expect( isIterable( instance ) ).to.be.true;
		} );

		it( 'should be false for not iterable objects', () => {
			let notIterable = { foo: 'bar' };

			expect( isIterable( notIterable ) ).to.be.false;
		} );

		it( 'should be false for undefined', () => {
			expect( isIterable() ).to.be.false;
		} );
	} );
} );
