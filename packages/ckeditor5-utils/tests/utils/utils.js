/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect */

'use strict';

var modules = bender.amd.require( 'utils' );

describe( 'extend()', function() {
	it( 'should extend and override', function() {
		var utils = modules.utils;

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

		expect( target.a ).to.equal( 'A' );
		expect( target.b ).to.equal( 2 );
		expect( target ).to.have.property( 'c' ).to.equal( 3 );

		expect( target ).to.have.property( 'obj' ).to.equal( extensions.obj );
		expect( target ).to.have.property( 'arr' ).to.equal( extensions.arr );
		expect( target ).to.have.property( 'fn' ).to.equal( extensions.fn );

		// "target" should be the return value.
		expect( ret ).to.equal( target );
	} );

	it( 'should not be touched by non-objects', function() {
		var utils = modules.utils;

		var target = {
			a: 1
		};

		expect( utils.extend( target, function() {} ) ).to.equal( target );
		expect( utils.extend( target, 1 ) ).to.equal( target );
		expect( utils.extend( target, 'a' ) ).to.equal( target );
		expect( utils.extend( target, true ) ).to.equal( target );
		expect( utils.extend( target, undefined ) ).to.equal( target );
		expect( utils.extend( target, [] ) ).to.equal( target );
		expect( utils.extend( target, new Date() ) ).to.equal( target );
		expect( utils.extend( target ) ).to.equal( target );

		// None of the above calls should have touched "target".
		expect( target ).to.have.property( 'a' ).to.equal( 1 );
		expect( Object.getOwnPropertyNames( target ).length ).to.equal( 1 );
	} );

	// properties of the subsequent objects should override properties of the preceding objects
	it( 'should extend by several params in the correct order', function() {
		var utils = modules.utils;

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

describe( 'isFunction()', function() {
	it( 'should be true for functions only', function() {
		var utils = modules.utils;

		var f1 = function() {};

		/* jshint -W054 */ // The Function constructor is a form of eval
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
		expect( utils.isFunction( new Date() ) ).to.be.false();
	} );
} );

describe( 'isObject()', function() {
	it( 'should be true for pure objects only', function() {
		var utils = modules.utils;

		var f1 = function() {};

		/* jshint -W054 */ // The Function constructor is a form of eval
		var f2 = new Function( '' );
		/* jshint +W054 */

		expect( utils.isObject( {} ) ).to.be.true();
		expect( utils.isObject( [] ) ).to.be.true();

		expect( utils.isObject( 1 ) ).to.be.false();
		expect( utils.isObject( 'a' ) ).to.be.false();
		expect( utils.isObject( true ) ).to.be.false();
		expect( utils.isObject( undefined ) ).to.be.false();
		expect( utils.isObject( f1 ) ).to.be.false();
		expect( utils.isObject( f2 ) ).to.be.false();
		expect( utils.isObject( null ) ).to.be.false();
	} );
} );
