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

	it( 'should create positions before elements', function() {
		var Position = modules[ 'document/position' ];

		expect( new Position( root, Position.BEFORE ) ).to.have.property( 'position' ).that.deep.equals( [] );

		expect( new Position( p, Position.BEFORE ) ).to.have.property( 'position' ).that.deep.equals( [ 0 ] );

		expect( new Position( ul, Position.BEFORE ) ).to.have.property( 'position' ).that.deep.equals( [ 1 ] );

		expect( new Position( li1, Position.BEFORE ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 0 ] );

		expect( new Position( f, Position.BEFORE ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 0, 0 ] );
		expect( new Position( o, Position.BEFORE ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 0, 1 ] );
		expect( new Position( z, Position.BEFORE ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 0, 2 ] );

		expect( new Position( li2, Position.BEFORE ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 1 ] );

		expect( new Position( b, Position.BEFORE ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 1, 0 ] );
		expect( new Position( a, Position.BEFORE ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 1, 1 ] );
		expect( new Position( r, Position.BEFORE ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 1, 2 ] );
	} );

	it( 'should create positions after elements', function() {
		var Position = modules[ 'document/position' ];

		expect( new Position( root, Position.AFTER ) ).to.have.property( 'position' ).that.deep.equals( [] );

		expect( new Position( p, Position.AFTER ) ).to.have.property( 'position' ).that.deep.equals( [ 1 ] );

		expect( new Position( ul, Position.AFTER ) ).to.have.property( 'position' ).that.deep.equals( [ 2 ] );

		expect( new Position( li1, Position.AFTER ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 1 ] );

		expect( new Position( f, Position.AFTER ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 0, 1 ] );
		expect( new Position( o, Position.AFTER ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 0, 2 ] );
		expect( new Position( z, Position.AFTER ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 0, 3 ] );

		expect( new Position( li2, Position.AFTER ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 2 ] );

		expect( new Position( b, Position.AFTER ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 1, 1 ] );
		expect( new Position( a, Position.AFTER ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 1, 2 ] );
		expect( new Position( r, Position.AFTER ) ).to.have.property( 'position' ).that.deep.equals( [ 1, 1, 3 ] );
	} );
} );