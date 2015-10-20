/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/element',
	'document/character',
	'document/position',
	'document/document',
	'ckeditorerror' );

describe( 'position', function() {
	var Element, Character, Document;

	var doc, root, p, ul, li1, li2, f, o, z, b, a, r;

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
		Document = modules[ 'document/document' ];

		doc = new Document();

		root = doc.root;

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

	it( 'should create a position with path and document', function() {
		var Position = modules[ 'document/position' ];

		var position = new Position( [ 0 ], doc.root );

		expect( position ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );
		expect( position ).to.have.property( 'root' ).that.equals( doc.root );
	} );

	it( 'should make positions form node and offset', function() {
		var Position = modules[ 'document/position' ];

		expect( Position.makePositionFromParentAndOffset( root, 0, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );
		expect( Position.makePositionFromParentAndOffset( root, 1, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1 ] );
		expect( Position.makePositionFromParentAndOffset( root, 2, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 2 ] );

		expect( Position.makePositionFromParentAndOffset( p, 0, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 0, 0 ] );

		expect( Position.makePositionFromParentAndOffset( ul, 0, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0 ] );
		expect( Position.makePositionFromParentAndOffset( ul, 1, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1 ] );
		expect( Position.makePositionFromParentAndOffset( ul, 2, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 2 ] );

		expect( Position.makePositionFromParentAndOffset( li1, 0, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 0 ] );
		expect( Position.makePositionFromParentAndOffset( li1, 1, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 1 ] );
		expect( Position.makePositionFromParentAndOffset( li1, 2, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 2 ] );
		expect( Position.makePositionFromParentAndOffset( li1, 3, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 3 ] );
	} );

	it( 'should make positions before elements', function() {
		var Position = modules[ 'document/position' ];

		expect( Position.makePositionBefore( p, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );

		expect( Position.makePositionBefore( ul, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1 ] );

		expect( Position.makePositionBefore( li1, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0 ] );

		expect( Position.makePositionBefore( f, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 0 ] );
		expect( Position.makePositionBefore( o, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 1 ] );
		expect( Position.makePositionBefore( z, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 2 ] );

		expect( Position.makePositionBefore( li2, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1 ] );

		expect( Position.makePositionBefore( b, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 0 ] );
		expect( Position.makePositionBefore( a, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 1 ] );
		expect( Position.makePositionBefore( r, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 2 ] );
	} );

	it( 'should throw error if one try to make positions before root', function() {
		var Position = modules[ 'document/position' ];
		var CKEditorError = modules.ckeditorerror;

		expect( function() {
			Position.makePositionBefore( root, doc.root );
		} ).to.throw( CKEditorError, /position-before-root/ );
	} );

	it( 'should make positions after elements', function() {
		var Position = modules[ 'document/position' ];

		expect( Position.makePositionAfter( p, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1 ] );

		expect( Position.makePositionAfter( ul, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 2 ] );

		expect( Position.makePositionAfter( li1, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1 ] );

		expect( Position.makePositionAfter( f, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 1 ] );
		expect( Position.makePositionAfter( o, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 2 ] );
		expect( Position.makePositionAfter( z, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 3 ] );

		expect( Position.makePositionAfter( li2, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 2 ] );

		expect( Position.makePositionAfter( b, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 1 ] );
		expect( Position.makePositionAfter( a, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 2 ] );
		expect( Position.makePositionAfter( r, doc.root ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 3 ] );
	} );

	it( 'should throw error if one try to make positions after root', function() {
		var Position = modules[ 'document/position' ];
		var CKEditorError = modules.ckeditorerror;

		expect( function() {
			Position.makePositionAfter( root, doc.root );
		} ).to.throw( CKEditorError, /position-after-root/ );
	} );

	it( 'should have parent', function() {
		var Position = modules[ 'document/position' ];

		expect( new Position( [ 0 ], doc.root ) ).to.have.property( 'parent' ).that.equals( root );
		expect( new Position( [ 1 ], doc.root ) ).to.have.property( 'parent' ).that.equals( root );
		expect( new Position( [ 2 ], doc.root ) ).to.have.property( 'parent' ).that.equals( root );

		expect( new Position( [ 0, 0 ], doc.root ) ).to.have.property( 'parent' ).that.equals( p );

		expect( new Position( [ 1, 0 ], doc.root ) ).to.have.property( 'parent' ).that.equals( ul );
		expect( new Position( [ 1, 1 ], doc.root ) ).to.have.property( 'parent' ).that.equals( ul );
		expect( new Position( [ 1, 2 ], doc.root ) ).to.have.property( 'parent' ).that.equals( ul );

		expect( new Position( [ 1, 0, 0 ], doc.root ) ).to.have.property( 'parent' ).that.equals( li1 );
		expect( new Position( [ 1, 0, 1 ], doc.root ) ).to.have.property( 'parent' ).that.equals( li1 );
		expect( new Position( [ 1, 0, 2 ], doc.root ) ).to.have.property( 'parent' ).that.equals( li1 );
		expect( new Position( [ 1, 0, 3 ], doc.root ) ).to.have.property( 'parent' ).that.equals( li1 );
	} );

	it( 'should have offset', function() {
		var Position = modules[ 'document/position' ];

		expect( new Position( [ 0 ], doc.root ) ).to.have.property( 'offset' ).that.equals( 0 );
		expect( new Position( [ 1 ], doc.root ) ).to.have.property( 'offset' ).that.equals( 1 );
		expect( new Position( [ 2 ], doc.root ) ).to.have.property( 'offset' ).that.equals( 2 );

		expect( new Position( [ 0, 0 ], doc.root ) ).to.have.property( 'offset' ).that.equals( 0 );

		expect( new Position( [ 1, 0 ], doc.root ) ).to.have.property( 'offset' ).that.equals( 0 );
		expect( new Position( [ 1, 1 ], doc.root ) ).to.have.property( 'offset' ).that.equals( 1 );
		expect( new Position( [ 1, 2 ], doc.root ) ).to.have.property( 'offset' ).that.equals( 2 );

		expect( new Position( [ 1, 0, 0 ], doc.root ) ).to.have.property( 'offset' ).that.equals( 0 );
		expect( new Position( [ 1, 0, 1 ], doc.root ) ).to.have.property( 'offset' ).that.equals( 1 );
		expect( new Position( [ 1, 0, 2 ], doc.root ) ).to.have.property( 'offset' ).that.equals( 2 );
		expect( new Position( [ 1, 0, 3 ], doc.root ) ).to.have.property( 'offset' ).that.equals( 3 );
	} );

	it( 'should have nodeBefore', function() {
		var Position = modules[ 'document/position' ];

		expect( new Position( [ 0 ], doc.root ) ).to.have.property( 'nodeBefore' ).that.is.null;
		expect( new Position( [ 1 ], doc.root ) ).to.have.property( 'nodeBefore' ).that.equals( p );
		expect( new Position( [ 2 ], doc.root ) ).to.have.property( 'nodeBefore' ).that.equals( ul );

		expect( new Position( [ 0, 0 ], doc.root ) ).to.have.property( 'nodeBefore' ).that.is.null;

		expect( new Position( [ 1, 0 ], doc.root ) ).to.have.property( 'nodeBefore' ).that.is.null;
		expect( new Position( [ 1, 1 ], doc.root ) ).to.have.property( 'nodeBefore' ).that.equals( li1 );
		expect( new Position( [ 1, 2 ], doc.root ) ).to.have.property( 'nodeBefore' ).that.equals( li2 );

		expect( new Position( [ 1, 0, 0 ], doc.root ) ).to.have.property( 'nodeBefore' ).that.is.null;
		expect( new Position( [ 1, 0, 1 ], doc.root ) ).to.have.property( 'nodeBefore' ).that.equals( f );
		expect( new Position( [ 1, 0, 2 ], doc.root ) ).to.have.property( 'nodeBefore' ).that.equals( o );
		expect( new Position( [ 1, 0, 3 ], doc.root ) ).to.have.property( 'nodeBefore' ).that.equals( z );
	} );

	it( 'should have nodeAfter', function() {
		var Position = modules[ 'document/position' ];

		expect( new Position( [ 0 ], doc.root ) ).to.have.property( 'nodeAfter' ).that.equals( p );
		expect( new Position( [ 1 ], doc.root ) ).to.have.property( 'nodeAfter' ).that.equals( ul );
		expect( new Position( [ 2 ], doc.root ) ).to.have.property( 'nodeAfter' ).that.is.null;

		expect( new Position( [ 0, 0 ], doc.root ) ).to.have.property( 'nodeAfter' ).that.is.null;

		expect( new Position( [ 1, 0 ], doc.root ) ).to.have.property( 'nodeAfter' ).that.equals( li1 );
		expect( new Position( [ 1, 1 ], doc.root ) ).to.have.property( 'nodeAfter' ).that.equals( li2 );
		expect( new Position( [ 1, 2 ], doc.root ) ).to.have.property( 'nodeAfter' ).that.is.null;

		expect( new Position( [ 1, 0, 0 ], doc.root ) ).to.have.property( 'nodeAfter' ).that.equals( f );
		expect( new Position( [ 1, 0, 1 ], doc.root ) ).to.have.property( 'nodeAfter' ).that.equals( o );
		expect( new Position( [ 1, 0, 2 ], doc.root ) ).to.have.property( 'nodeAfter' ).that.equals( z );
		expect( new Position( [ 1, 0, 3 ], doc.root ) ).to.have.property( 'nodeAfter' ).that.is.null;
	} );

	it( 'should equals another position with the same path', function() {
		var Position = modules[ 'document/position' ];

		var position = new Position( [ 1, 1, 2 ], doc.root );
		var samePosition = new Position( [ 1, 1, 2 ], doc.root );

		expect( position.isEqual( samePosition ) ).to.be.true;
	} );

	it( 'should not equals another position with the different path', function() {
		var Position = modules[ 'document/position' ];

		var position = new Position( [ 1, 1, 1 ], doc.root );
		var differentNode = new Position( [ 1, 2, 2 ], doc.root );

		expect( position.isEqual( differentNode ) ).to.be.false;
	} );
} );