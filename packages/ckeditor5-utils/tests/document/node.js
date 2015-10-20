/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/element',
	'document/character',
	'document/attribute' );

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

	it( 'should have proper positionInParent', function() {
		expect( root ).to.have.property( 'positionInParent' ).that.is.null;

		expect( one ).to.have.property( 'positionInParent' ).that.equals( 0 );
		expect( two ).to.have.property( 'positionInParent' ).that.equals( 1 );
		expect( three ).to.have.property( 'positionInParent' ).that.equals( 2 );

		expect( charB ).to.have.property( 'positionInParent' ).that.equals( 0 );
		expect( charA ).to.have.property( 'positionInParent' ).that.equals( 1 );
		expect( img ).to.have.property( 'positionInParent' ).that.equals( 2 );
		expect( charR ).to.have.property( 'positionInParent' ).that.equals( 3 );
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

describe( 'getAttr', function() {
	it( 'should be possible to get attribute by key', function() {
		var Element = modules[ 'document/element' ];
		var Attribute = modules[ 'document/attribute' ];

		var fooAttr = new Attribute( 'foo', true );
		var element = new Element( null, 'foo', [ fooAttr ] );

		expect( element.getAttr( 'foo' ).isEqual( fooAttr ) ).to.be.true;
	} );

	it( 'should return null if attribute was not found by key', function() {
		var Element = modules[ 'document/element' ];
		var Attribute = modules[ 'document/attribute' ];

		var fooAttr = new Attribute( 'foo', true );
		var element = new Element( null, 'foo', [ fooAttr ] );

		expect( element.getAttr( 'bar' ) ).to.be.null;
	} );

	it( 'should be possible to get attribute by object', function() {
		var Element = modules[ 'document/element' ];
		var Attribute = modules[ 'document/attribute' ];

		var fooAttr = new Attribute( 'foo', true );
		var foo2Attr = new Attribute( 'foo', true );
		var element = new Element( null, 'foo', [ fooAttr ] );

		expect( element.getAttr( foo2Attr ).isEqual( fooAttr ) ).to.be.true;
	} );

	it( 'should return null if attribute was not found by object', function() {
		var Element = modules[ 'document/element' ];
		var Attribute = modules[ 'document/attribute' ];

		var fooAttr = new Attribute( 'foo', true );
		var element = new Element( null, 'foo' );

		expect( element.getAttr( fooAttr ) ).to.be.null;
	} );
} );

describe( 'hasAttr', function() {
	it( 'should check attribute by key', function() {
		var Element = modules[ 'document/element' ];
		var Attribute = modules[ 'document/attribute' ];

		var fooAttr = new Attribute( 'foo', true );
		var element = new Element( null, 'foo', [ fooAttr ] );

		expect( element.hasAttr( 'foo' ) ).to.be.true;
	} );

	it( 'should return false if attribute was not found by key', function() {
		var Element = modules[ 'document/element' ];
		var Attribute = modules[ 'document/attribute' ];

		var fooAttr = new Attribute( 'foo', true );
		var element = new Element( null, 'foo', [ fooAttr ] );

		expect( element.hasAttr( 'bar' ) ).to.be.false;
	} );

	it( 'should check attribute by object', function() {
		var Element = modules[ 'document/element' ];
		var Attribute = modules[ 'document/attribute' ];

		var fooAttr = new Attribute( 'foo', true );
		var foo2Attr = new Attribute( 'foo', true );
		var element = new Element( null, 'foo', [ fooAttr ] );

		expect( element.hasAttr( foo2Attr ) ).to.be.true;
	} );

	it( 'should return false if attribute was not found by object', function() {
		var Element = modules[ 'document/element' ];
		var Attribute = modules[ 'document/attribute' ];

		var fooAttr = new Attribute( 'foo', true );
		var element = new Element( null, 'foo' );

		expect( element.hasAttr( fooAttr ) ).to.be.false;
	} );

	it( 'should create proper JSON string using toJSON method', function() {
		var Element = modules[ 'document/element' ];
		var Character = modules[ 'document/character' ];

		var foo = new Element( null, 'foo' );
		var b = new Character( foo, 'b' );
		foo.children.push( b );

		var parsedFoo = JSON.parse( JSON.stringify( foo ) );
		var parsedBar = JSON.parse( JSON.stringify( b ) );

		expect( parsedFoo ).to.be.deep.equals( {
			name: 'foo',
			parent: null,
			attrs: [],
			children: [ parsedBar ]
		} );

		expect( parsedBar ).to.be.deep.equals( {
			character: 'b',
			parent: 'foo',
			attrs: []
		} );
	} );
} );