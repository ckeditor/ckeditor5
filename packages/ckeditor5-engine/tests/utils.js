/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import utils from '/ckeditor5/core/utils.js';

describe( 'utils', () => {
	describe( 'spy', () => {
		it( 'should not have `called` after creation', () => {
			let spy = utils.spy();

			expect( spy.called ).to.not.be.true();
		} );

		it( 'should register calls', () => {
			let fn1 = utils.spy();
			let fn2 = utils.spy();

			fn1();

			expect( fn1.called ).to.be.true();
			expect( fn2.called ).to.not.be.true();
		} );
	} );

	describe( 'uid', () => {
		it( 'should return different ids', () => {
			let id1 = utils.uid();
			let id2 = utils.uid();
			let id3 = utils.uid();

			expect( id1 ).to.be.a( 'number' );
			expect( id2 ).to.be.a( 'number' ).to.not.equal( id1 ).to.not.equal( id3 );
			expect( id3 ).to.be.a( 'number' ).to.not.equal( id1 ).to.not.equal( id2 );
		} );
	} );

	describe( 'isIterable', () => {
		it( 'should be true for string', () => {
			let string = 'foo';

			expect( utils.isIterable( string ) ).to.be.true;
		} );

		it( 'should be true for arrays', () => {
			let array = [ 1, 2, 3 ];

			expect( utils.isIterable( array ) ).to.be.true;
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

			expect( utils.isIterable( instance ) ).to.be.true;
		} );

		it( 'should be false for not iterable objects', () => {
			let notIterable = { foo: 'bar' };

			expect( utils.isIterable( notIterable ) ).to.be.false;
		} );

		it( 'should be false for undefined', () => {
			expect( utils.isIterable() ).to.be.false;
		} );
	} );

	describe( 'compareArrays', () => {
		it( 'should return SAME flag, when arrays are same', () => {
			let a = [ 'abc', 0, 3 ];
			let b = [ 'abc', 0, 3 ];

			let result = utils.compareArrays( a, b );

			expect( result ).to.equal( utils.compareArrays.SAME );
		} );

		it( 'should return PREFIX flag, when all n elements of first array are same as n first elements of the second array', () => {
			let a = [ 'abc', 0 ];
			let b = [ 'abc', 0, 3 ];

			let result = utils.compareArrays( a, b );

			expect( result ).to.equal( utils.compareArrays.PREFIX );
		} );

		it( 'should return EXTENSION flag, when n first elements of first array are same as all elements of the second array', () => {
			let a = [ 'abc', 0, 3 ];
			let b = [ 'abc', 0 ];

			let result = utils.compareArrays( a, b );

			expect( result ).to.equal( utils.compareArrays.EXTENSION );
		} );

		it( 'should return index on which arrays differ, when arrays are not the same', () => {
			let a = [ 'abc', 0, 3 ];
			let b = [ 'abc', 1, 3 ];

			let result = utils.compareArrays( a, b );

			expect( result ).to.equal( 1 );
		} );
	} );

	describe( 'nth', () => {
		it( 'should return 0th item', () => {
			expect( utils.nth( 0, getIterator() ) ).to.equal( 11 );
		} );

		it( 'should return the last item', () => {
			expect( utils.nth( 2, getIterator() ) ).to.equal( 33 );
		} );

		it( 'should return null if out of range (bottom)', () => {
			expect( utils.nth( -1, getIterator() ) ).to.be.null;
		} );

		it( 'should return null if out of range (top)', () => {
			expect( utils.nth( 3, getIterator() ) ).to.be.null;
		} );

		it( 'should return null if iterator is empty', () => {
			expect( utils.nth( 0, [] ) ).to.be.null;
		} );

		function *getIterator() {
			yield 11;
			yield 22;
			yield 33;
		}
	} );
} );
