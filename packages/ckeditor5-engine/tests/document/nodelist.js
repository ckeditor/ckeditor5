/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/nodelist',
	'document/character' );

describe( 'constructor', function() {
	it( 'should change array of strings into a set of nodes', function() {
		var NodeList = modules[ 'document/nodelist' ];
		var Character = modules[ 'document/character' ];

		var nodeList = new NodeList( [ 'foo', new Character( null, 'x' ), 'bar' ] );

		expect( nodeList.length ).to.be.equal( 7 );
		expect( nodeList.get( 0 ).character ).to.be.equal( 'f' );
		expect( nodeList.get( 1 ).character ).to.be.equal( 'o' );
		expect( nodeList.get( 2 ).character ).to.be.equal( 'o' );
		expect( nodeList.get( 3 ).character ).to.be.equal( 'x' );
		expect( nodeList.get( 4 ).character ).to.be.equal( 'b' );
		expect( nodeList.get( 5 ).character ).to.be.equal( 'a' );
		expect( nodeList.get( 6 ).character ).to.be.equal( 'r' );
	} );

	it( 'should change string into a set of nodes', function() {
		var NodeList = modules[ 'document/nodelist' ];

		var nodeList = new NodeList( 'foo' );

		expect( nodeList.length ).to.be.equal( 3 );
		expect( nodeList.get( 0 ).character ).to.be.equal( 'f' );
		expect( nodeList.get( 1 ).character ).to.be.equal( 'o' );
		expect( nodeList.get( 2 ).character ).to.be.equal( 'o' );
	} );

	it( 'should change node into a set of nodes', function() {
		var NodeList = modules[ 'document/nodelist' ];
		var Character = modules[ 'document/character' ];

		var nodeList = new NodeList( new Character( null, 'x' ) );

		expect( nodeList.length ).to.be.equal( 1 );
		expect( nodeList.get( 0 ).character ).to.be.equal( 'x' );
	} );
} );

describe( 'insert', function() {
	it( 'should insert one nodelist into another', function() {
		var NodeList = modules[ 'document/nodelist' ];

		var outerList = new NodeList( 'foo' );
		var innerList = new NodeList( 'xxx' );

		outerList.insert( 2, innerList );

		expect( outerList.length ).to.be.equal( 6 );
		expect( outerList.get( 0 ).character ).to.be.equal( 'f' );
		expect( outerList.get( 1 ).character ).to.be.equal( 'o' );
		expect( outerList.get( 2 ).character ).to.be.equal( 'x' );
		expect( outerList.get( 3 ).character ).to.be.equal( 'x' );
		expect( outerList.get( 4 ).character ).to.be.equal( 'x' );
		expect( outerList.get( 5 ).character ).to.be.equal( 'o' );
	} );
} );

describe( 'remove', function() {
	it( 'should remove part of the nodelist', function() {
		var NodeList = modules[ 'document/nodelist' ];

		var nodeList = new NodeList( 'foobar' );

		nodeList.remove( 2, 3 );

		expect( nodeList.length ).to.be.equal( 3 );
		expect( nodeList.get( 0 ).character ).to.be.equal( 'f' );
		expect( nodeList.get( 1 ).character ).to.be.equal( 'o' );
		expect( nodeList.get( 2 ).character ).to.be.equal( 'r' );
	} );
} );