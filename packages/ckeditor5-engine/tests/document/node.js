/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/element',
	'document/character' );

describe( 'tree', function() {
	var Element, Character;

	var root;
	var one, two, three;
	var charB, charA, charR, img;

	before( function() {
		Element = modules[ 'document/element' ];
		Character = modules[ 'document/character' ];

		root = new Element();

		one = new Element( root );
		two = new Element( root );
		three = new Element( root );

		charB = new Character( two, 'b' );
		charA = new Character( two, 'a' );
		img = new Element( two, 'img' );
		charR = new Character( two, 'r' );

		two.children.push( charB );
		two.children.push( charA );
		two.children.push( img );
		two.children.push( charR );

		root.children.push( one );
		root.children.push( two );
		root.children.push( three );
	} );

	it( 'should have proper depth', function() {
		expect( root ).to.have.property( 'depth' ).that.equals( 0 );

		expect( one ).to.have.property( 'depth' ).that.equals( 1 );
		expect( two ).to.have.property( 'depth' ).that.equals( 1 );
		expect( three ).to.have.property( 'depth' ).that.equals( 1 );

		expect( charB ).to.have.property( 'depth' ).that.equals( 2 );
		expect( charA ).to.have.property( 'depth' ).that.equals( 2 );
		expect( img ).to.have.property( 'depth' ).that.equals( 2 );
		expect( charR ).to.have.property( 'depth' ).that.equals( 2 );
	} );

	it( 'should have proper nextSibling', function() {
		expect( root ).to.have.property( 'nextSibling' ).that.is.null;

		expect( one ).to.have.property( 'nextSibling' ).that.equals( two );
		expect( two ).to.have.property( 'nextSibling' ).that.equals( three );
		expect( three ).to.have.property( 'nextSibling' ).that.is.null;

		expect( charB ).to.have.property( 'nextSibling' ).that.equals( charA );
		expect( charA ).to.have.property( 'nextSibling' ).that.equals( img );
		expect( img ).to.have.property( 'nextSibling' ).that.equals( charR );
		expect( charR ).to.have.property( 'nextSibling' ).that.is.null;
	} );

	it( 'should have proper previousSibling', function() {
		expect( root ).to.have.property( 'previousSibling' ).that.is.expect;

		expect( one ).to.have.property( 'previousSibling' ).that.is.null;
		expect( two ).to.have.property( 'previousSibling' ).that.equals( one );
		expect( three ).to.have.property( 'previousSibling' ).that.equals( two );

		expect( charB ).to.have.property( 'previousSibling' ).that.is.null;
		expect( charA ).to.have.property( 'previousSibling' ).that.equals( charB );
		expect( img ).to.have.property( 'previousSibling' ).that.equals( charA );
		expect( charR ).to.have.property( 'previousSibling' ).that.equals( img );
	} );
} );