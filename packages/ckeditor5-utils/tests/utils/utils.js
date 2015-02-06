/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, bender */

'use strict';

var modules = bender.amd.require( 'utils' );

describe( 'spy', function() {
	it( 'should register calls', function() {
		var utils = modules.utils;

		var fn1 = utils.spy();
		var fn2 = utils.spy();

		fn1();

		expect( fn1.called ).to.be.true();
		expect( fn2.called ).to.not.be.true();
	} );
} );

describe( 'uid', function() {
	it( 'should return different ids', function() {
		var utils = modules.utils;

		var id1 = utils.uid();
		var id2 = utils.uid();
		var id3 = utils.uid();

		expect( id1 ).to.be.a( 'number' );
		expect( id2 ).to.be.a( 'number' ).to.not.equal( id1 ).to.not.equal( id3 );
		expect( id3 ).to.be.a( 'number' ).to.not.equal( id1 ).to.not.equal( id2 );
	} );
} );
