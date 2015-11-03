/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

var modules = bender.amd.require( 'utils', 'utils-lodash' );

describe( 'utils', function() {
	var utils;

	before( function() {
		utils = modules.utils;
	} );

	describe( 'extend()', function() {
		// Properties of the subsequent objects should override properties of the preceding objects. This is critical for
		// CKEditor so we keep this test to ensure that Lo-Dash (or whatever) implements it in the way we need it.
		it( 'should extend by several params in the correct order', function() {
			var target = {
				a: 0,
				b: 0
			};

			var ext1 = {
				b: 1,
				c: 1
			};

			var ext2 = {
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

	describe( 'spy', function() {
		it( 'should not have `called` after creation', function() {
			var spy = utils.spy();

			expect( spy.called ).to.not.be.true();
		} );

		it( 'should register calls', function() {
			var fn1 = utils.spy();
			var fn2 = utils.spy();

			fn1();

			expect( fn1.called ).to.be.true();
			expect( fn2.called ).to.not.be.true();
		} );
	} );

	describe( 'uid', function() {
		it( 'should return different ids', function() {
			var id1 = utils.uid();
			var id2 = utils.uid();
			var id3 = utils.uid();

			expect( id1 ).to.be.a( 'number' );
			expect( id2 ).to.be.a( 'number' ).to.not.equal( id1 ).to.not.equal( id3 );
			expect( id3 ).to.be.a( 'number' ).to.not.equal( id1 ).to.not.equal( id2 );
		} );
	} );

	describe( 'isIterable', function() {
		it( 'should be true for string', function() {
			var string = 'foo';

			expect( utils.isIterable( string ) ).to.be.true;
		} );

		it( 'should be true for arrays', function() {
			var array = [ 1, 2, 3 ];

			expect( utils.isIterable( array ) ).to.be.true;
		} );

		it( 'should be true for iterable classes', function() {
			class IterableClass {
				constructor() {
					this.array = [ 1, 2, 3 ];
				}

				[ Symbol.iterator ]() {
					return this.array[ Symbol.iterator ]();
				}
			}

			var instance = new IterableClass();

			expect( utils.isIterable( instance ) ).to.be.true;
		} );

		it( 'should be false for not iterable objects', function() {
			var notIterable = { foo: 'bar' };

			expect( utils.isIterable( notIterable ) ).to.be.false;
		} );

		it( 'should be false for undefined', function() {
			expect( utils.isIterable() ).to.be.false;
		} );
	} );

	describe( 'compareArrays', function() {
		it( 'should return SAME flag, when arrays are same', function() {
			var a = [ 'abc', 0, 3 ];
			var b = [ 'abc', 0, 3 ];

			var result = utils.compareArrays( a, b );

			expect( result ).to.equal( utils.compareArrays.SAME );
		} );

		it( 'should return PREFIX flag, when all n elements of first array are same as n first elements of the second array', function() {
			var a = [ 'abc', 0 ];
			var b = [ 'abc', 0, 3 ];

			var result = utils.compareArrays( a, b );

			expect( result ).to.equal( utils.compareArrays.PREFIX );
		} );

		it( 'should return EXTENSION flag, when n first elements of first array are same as all elements of the second array', function() {
			var a = [ 'abc', 0, 3 ];
			var b = [ 'abc', 0 ];

			var result = utils.compareArrays( a, b );

			expect( result ).to.equal( utils.compareArrays.EXTENSION );
		} );

		it( 'should return DIFFERENT flag, when arrays are not same', function() {
			var a = [ 'abc', 0, 3 ];
			var b = [ 'abc', 1, 3 ];

			var result = utils.compareArrays( a, b );

			expect( result ).to.equal( utils.compareArrays.DIFFERENT );
		} );
	} );

	describe( 'Lo-Dash extensions', function() {
		// Ensures that the required Lo-Dash extensions are available in `utils`.
		it( 'should be exposed in utils', function() {
			var utils = modules.utils;
			var extensions = modules[ 'utils-lodash' ];

			extensions.forEach( function( extension ) {
				expect( utils ).to.have.property( extension ).to.not.be.undefined();
			} );
		} );
	} );
} );
