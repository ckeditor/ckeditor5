/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/element',
	'document/character',
	'document/position' );

describe( 'position', function() {
	var Element, Character;

	var root, p, ul, li1, li2, f, o, z, b, a, r;

	// root
	//  |- p         Before: [ 0 ]       After: [ 1 ]
	//  |- ul        Before: [ 1 ]       After: [ 2 ]
	//     |- li     Before: [ 1, 0 ]    After: [ 1, 1 ]
	//     |  |- f   Before: [ 1, 0, 0 ] After: [ 1, 0, 1 ]
	//     |  |- o   Before: [ 1, 0, 1 ] After: [ 1, 0, 2 ]
	//     |  |- z   Before: [ 1, 0, 2 ] After: [ 1, 0, 3 ]
	//     |- li     Before: [ 1, 1 ]    After: [ 1, 2 ]
	//        |- b   Before: [ 1, 1, 0 ] After: [ 1, 1, 1 ]
	//        |- a   Before: [ 1, 1, 1 ] After: [ 1, 1, 2 ]
	//        |- r   Before: [ 1, 1, 2 ] After: [ 1, 1, 3 ]
	before( function() {
		Element = modules[ 'document/element' ];
		Character = modules[ 'document/character' ];

		root = new Element();

		p = new Element( root, 'p' );

		ul = new Element( root, 'ul' );

		li1 = new Element( ul, 'li' );

		f = new Character( li1, 'f' );
		o = new Character( li1, 'o' );
		z = new Character( li1, 'z' );

		li2 = new Element( ul, 'li' );

		b = new Character( li2, 'b' );
		a = new Character( li2, 'a' );
		r = new Character( li2, 'r' );

		root.children.push( p );
		root.children.push( ul );

		ul.children.push( li1 );
		ul.children.push( li2 );

		li1.children.push( f );
		li1.children.push( o );
		li1.children.push( z );

		li2.children.push( b );
		li2.children.push( a );
		li2.children.push( r );
	} );

	it( 'should have path', function() {
		var Position = modules[ 'document/position' ];

		expect( new Position( root, 0 ) ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );
		expect( new Position( root, 1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1 ] );
		expect( new Position( root, 2 ) ).to.have.property( 'path' ).that.deep.equals( [ 2 ] );

		expect( new Position( p, 0 ) ).to.have.property( 'path' ).that.deep.equals( [ 0, 0 ] );

		expect( new Position( ul, 0 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0 ] );
		expect( new Position( ul, 1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1 ] );
		expect( new Position( ul, 2 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 2 ] );

		expect( new Position( li1, 0 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 0 ] );
		expect( new Position( li1, 1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 1 ] );
		expect( new Position( li1, 2 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 2 ] );
		expect( new Position( li1, 3 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 3 ] );
	} );

	it( 'should have nodeBefore', function() {
		var Position = modules[ 'document/position' ];

		expect( new Position( root, 0 ) ).to.have.property( 'nodeBefore' ).that.is.null;
		expect( new Position( root, 1 ) ).to.have.property( 'nodeBefore' ).that.equals( p );
		expect( new Position( root, 2 ) ).to.have.property( 'nodeBefore' ).that.equals( ul );

		expect( new Position( p, 0 ) ).to.have.property( 'nodeBefore' ).that.is.null;

		expect( new Position( ul, 0 ) ).to.have.property( 'nodeBefore' ).that.is.null;
		expect( new Position( ul, 1 ) ).to.have.property( 'nodeBefore' ).that.equals( li1 );
		expect( new Position( ul, 2 ) ).to.have.property( 'nodeBefore' ).that.equals( li2 );

		expect( new Position( li1, 0 ) ).to.have.property( 'nodeBefore' ).that.is.null;
		expect( new Position( li1, 1 ) ).to.have.property( 'nodeBefore' ).that.equals( f );
		expect( new Position( li1, 2 ) ).to.have.property( 'nodeBefore' ).that.equals( o );
		expect( new Position( li1, 3 ) ).to.have.property( 'nodeBefore' ).that.equals( z );
	} );

	it( 'should have nodeAfter', function() {
		var Position = modules[ 'document/position' ];

		expect( new Position( root, 0 ) ).to.have.property( 'nodeAfter' ).that.equals( p );
		expect( new Position( root, 1 ) ).to.have.property( 'nodeAfter' ).that.equals( ul );
		expect( new Position( root, 2 ) ).to.have.property( 'nodeAfter' ).that.is.null;

		expect( new Position( p, 0 ) ).to.have.property( 'nodeAfter' ).that.is.null;

		expect( new Position( ul, 0 ) ).to.have.property( 'nodeAfter' ).that.equals( li1 );
		expect( new Position( ul, 1 ) ).to.have.property( 'nodeAfter' ).that.equals( li2 );
		expect( new Position( ul, 2 ) ).to.have.property( 'nodeAfter' ).that.is.null;

		expect( new Position( li1, 0 ) ).to.have.property( 'nodeAfter' ).that.equals( f );
		expect( new Position( li1, 1 ) ).to.have.property( 'nodeAfter' ).that.equals( o );
		expect( new Position( li1, 2 ) ).to.have.property( 'nodeAfter' ).that.equals( z );
		expect( new Position( li1, 3 ) ).to.have.property( 'nodeAfter' ).that.is.null;
	} );

	it( 'should equals another position with the same offset and node', function() {
		var Position = modules[ 'document/position' ];

		var position = new Position( root, 0 );
		var samePosition = new Position( root, 0 );

		expect( position.equals( samePosition ) ).to.be.true;
	} );

	it( 'should not equals another position with the different offset', function() {
		var Position = modules[ 'document/position' ];

		var position = new Position( root, 0 );
		var differentOffset = new Position( root, 1 );

		expect( position.equals( differentOffset ) ).to.be.false;
	} );

	it( 'should not equals another position with the different node', function() {
		var Position = modules[ 'document/position' ];

		var position = new Position( root, 0 );
		var differentNode = new Position( p, 0 );

		expect( position.equals( differentNode ) ).to.be.false;
	} );
} );