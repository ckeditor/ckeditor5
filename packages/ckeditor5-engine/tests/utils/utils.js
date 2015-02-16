/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect */

'use strict';

var modules = bender.amd.require( 'utils', 'utils-lodash' );

describe( 'extend()', function() {
	// Properties of the subsequent objects should override properties of the preceding objects. This is critical for
	// CKEditor so we keep this test to ensure that Lo-Dash (or whatever) implements it in the way we need it.
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
