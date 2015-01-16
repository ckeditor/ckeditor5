/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect */

'use strict';

describe( 'utils', function() {
	it( 'extend() should extend and override', function( done ) {
		CKEDITOR.require( [ 'utils' ], function( utils ) {
			var target = {
				a: 1,
				b: 2
			};

			var extensions = {
				a: 'A',
				c: 3,

				// Extend by reference (no deep-copy).
				obj: {
					a: 1
				},

				// Extend by reference (no deep-copy).
				arr: [ 1, 2 ],

				// Extend by reference.
				fn: function() {}
			};

			var ret = utils.extend( target, extensions );

			expect( target.a ).equal( 'A' );
			expect( target.b ).equal( 2 );
			expect( target ).to.have.property( 'c' ).equal( 3 );

			expect( target ).to.have.property( 'obj' ).equal( extensions.obj );
			expect( target ).to.have.property( 'arr' ).equal( extensions.arr );
			expect( target ).to.have.property( 'fn' ).equal( extensions.fn );

			// "target" should be the return value.
			expect( ret ).to.equal( target );

			done();
		} );
	} );

	it( 'extend() should not be touched by non-objects', function( done ) {
		CKEDITOR.require( [ 'utils' ], function( utils ) {
			var target = {
				a: 1
			};

			expect( utils.extend( target, function() {} ) ).equal( target );
			expect( utils.extend( target, 1 ) ).equal( target );
			expect( utils.extend( target, 'a' ) ).equal( target );
			expect( utils.extend( target, true ) ).equal( target );
			expect( utils.extend( target, undefined ) ).equal( target );
			expect( utils.extend( target, [] ) ).equal( target );
			expect( utils.extend( target, Date.now() ) ).equal( target );
			expect( utils.extend( target ) ).equal( target );

			// None of the above calls should have touched "target".
			expect( target ).to.have.property( 'a' ).equal( 1 );
			expect( Object.getOwnPropertyNames( target ).length ).equal( 1 );

			done();
		} );
	} );

	it( 'extend() should extend by several params in order', function( done ) {
		CKEDITOR.require( [ 'utils' ], function( utils ) {
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

			expect( target ).to.have.property( 'a' ).equal( 0 );
			expect( target ).to.have.property( 'b' ).equal( 1 );
			expect( target ).to.have.property( 'c' ).equal( 2 );
			expect( target ).to.have.property( 'd' ).equal( 2 );

			done();
		} );
	} );

	it( 'isFunction() should be true for functions only', function( done ) {
		CKEDITOR.require( [ 'utils' ], function( utils ) {
			var f1 = function() {
			};

			/* jshint -W054 */	// The Function constructor is a form of eval
			var f2 = new Function( '' );
			/* jshint +W054 */

			expect( utils.isFunction( f1 ) ).to.be.true();
			expect( utils.isFunction( f2 ) ).to.be.true();

			expect( utils.isFunction( 1 ) ).to.be.false();
			expect( utils.isFunction( 'a' ) ).to.be.false();
			expect( utils.isFunction( true ) ).to.be.false();
			expect( utils.isFunction( undefined ) ).to.be.false();
			expect( utils.isFunction( [] ) ).to.be.false();
			expect( utils.isFunction( {} ) ).to.be.false();
			expect( utils.isFunction( Date.now() ) ).to.be.false();

			done();
		} );
	} );

	it( 'isObject() should be true for pure objects only', function( done ) {
		CKEDITOR.require( [ 'utils' ], function( utils ) {
			var f1 = function() {
			};

			/* jshint -W054 */	// The Function constructor is a form of eval
			var f2 = new Function( '' );
			/* jshint +W054 */

			expect( utils.isObject( {} ) ).to.be.true();
			expect( utils.isObject( [] ) ).to.be.true();

			expect( utils.isObject( 1 ) ).to.be.false();
			expect( utils.isObject( 'a' ) ).to.be.false();
			expect( utils.isObject( true ) ).to.be.false();
			expect( utils.isObject( undefined ) ).to.be.false();
			expect( utils.isObject( Date.now() ) ).to.be.false();
			expect( utils.isObject( f1 ) ).to.be.false();
			expect( utils.isObject( f2 ) ).to.be.false();

			done();
		} );
	} );
} );
