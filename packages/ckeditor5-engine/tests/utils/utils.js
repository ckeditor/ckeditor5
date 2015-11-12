/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'utils', 'utils-lodash' );

describe( 'utils', () => {
	let utils;

	before( () => {
		utils = modules.utils;
	} );

	describe( 'extend()', () => {
		// Properties of the subsequent objects should override properties of the preceding objects. This is critical for
		// CKEditor so we keep this test to ensure that Lo-Dash (or whatever) implements it in the way we need it.
		it( 'should extend by several params in the correct order', () => {
			let target = {
				a: 0,
				b: 0
			};

			let ext1 = {
				b: 1,
				c: 1
			};

			let ext2 = {
				c: 2,
				d: 2
			};

			utils.extend( target, ext1, ext2 );

			expect( target ).to.have.property( 'a' ).to.equal( 0 );
			expect( target ).to.have.property( 'b' ).to.equal( 1 );
			expect( target ).to.have.property( 'c' ).to.equal( 2 );
			expect( target ).to.have.property( 'd' ).to.equal( 2 );
		} );
	} );

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

		it( 'should return DIFFERENT flag, when arrays are not same', () => {
			let a = [ 'abc', 0, 3 ];
			let b = [ 'abc', 1, 3 ];

			let result = utils.compareArrays( a, b );

			expect( result ).to.equal( utils.compareArrays.DIFFERENT );
		} );
	} );

	describe( 'Lo-Dash extensions', () => {
		// Ensures that the required Lo-Dash extensions are available in `utils`.
		it( 'should be exposed in utils', () => {
			let utils = modules.utils;
			let extensions = modules[ 'utils-lodash' ];

			extensions.forEach( ( extension ) => {
				expect( utils ).to.have.property( extension ).to.not.be.undefined();
			} );
		} );
	} );
} );
