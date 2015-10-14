/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require( 'document/operation', 'document/character' );

describe( 'uncompress', function() {
	it( 'should change array of strings into a set of nodes', function() {
		var Operation = modules[ 'document/operation' ];
		var Character = modules[ 'document/character' ];

		var uncompressed = Operation.uncompress( [ 'foo', new Character( null, 'x' ), 'bar' ] );

		expect( uncompressed.length ).to.be.equal( 7 );
		expect( uncompressed[ 0 ].character ).to.be.equal( 'f' );
		expect( uncompressed[ 1 ].character ).to.be.equal( 'o' );
		expect( uncompressed[ 2 ].character ).to.be.equal( 'o' );
		expect( uncompressed[ 3 ].character ).to.be.equal( 'x' );
		expect( uncompressed[ 4 ].character ).to.be.equal( 'b' );
		expect( uncompressed[ 5 ].character ).to.be.equal( 'a' );
		expect( uncompressed[ 6 ].character ).to.be.equal( 'r' );
	} );

	it( 'should change string into a set of nodes', function() {
		var Operation = modules[ 'document/operation' ];

		var uncompressed = Operation.uncompress( 'foo' );

		expect( uncompressed.length ).to.be.equal( 3 );
		expect( uncompressed[ 0 ].character ).to.be.equal( 'f' );
		expect( uncompressed[ 1 ].character ).to.be.equal( 'o' );
		expect( uncompressed[ 2 ].character ).to.be.equal( 'o' );
	} );

	it( 'should change node into a set of nodes', function() {
		var Operation = modules[ 'document/operation' ];
		var Character = modules[ 'document/character' ];

		var uncompressed = Operation.uncompress( new Character( null, 'x' ) );

		expect( uncompressed.length ).to.be.equal( 1 );
		expect( uncompressed[ 0 ].character ).to.be.equal( 'x' );
	} );
} );