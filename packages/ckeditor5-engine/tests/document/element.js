/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint expr: true */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/node',
	'document/nodelist',
	'document/element',
	'document/attribute'
);

describe( 'Element', function() {
	var Element, Node, NodeList, Attribute;

	before( function() {
		Element = modules[ 'document/element' ];
		Node = modules[ 'document/node' ];
		NodeList = modules[ 'document/nodelist' ];
		Attribute = modules[ 'document/attribute' ];
	} );

	describe( 'constructor', function() {
		it( 'should create element without attributes', function() {
			var element = new Element( 'elem' );
			var parent = new Element( 'parent', [], [ element ] );

			expect( element ).to.be.an.instanceof( Node );
			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element ).to.have.property( 'parent' ).that.equals( parent );
			expect( element._getAttrCount() ).to.equal( 0 );
		} );

		it( 'should create element with attributes', function() {
			var attr = new Attribute( 'foo', 'bar' );

			var element = new Element( 'elem', [ attr ] );
			var parent = new Element( 'parent', [], [ element ] );

			expect( element ).to.be.an.instanceof( Node );
			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element ).to.have.property( 'parent' ).that.equals( parent );
			expect( element._getAttrCount() ).to.equal( 1 );
			expect( element.getAttr( attr.key ) ).to.equal( attr.value );
		} );

		it( 'should create element with children', function() {
			var element = new Element( 'elem', [], 'foo' );

			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element.getChildCount() ).to.equal( 3 );
			expect( element.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'f' );
			expect( element.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( element.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'o' );
		} );
	} );

	describe( 'insertChildren', function() {
		it( 'should add children to the element', function() {
			var element = new Element( 'elem', [], [ 'xy' ] );
			element.insertChildren( 1, 'foo' );

			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
			expect( element.getChildCount() ).to.equal( 5 );
			expect( element.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'x' );
			expect( element.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'f' );
			expect( element.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( element.getChild( 3 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( element.getChild( 4 ) ).to.have.property( 'character' ).that.equals( 'y' );
		} );
	} );

	describe( 'removeChildren', function() {
		it( 'should remove children from the element and return them as a NodeList', function() {
			var element = new Element( 'elem', [], [ 'foobar' ] );
			var o = element.getChild( 2 );
			var b = element.getChild( 3 );
			var a = element.getChild( 4 );
			var removed = element.removeChildren( 2, 3 );

			expect( element.getChildCount() ).to.equal( 3 );
			expect( element.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'f' );
			expect( element.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'o' );
			expect( element.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'r' );

			expect( o ).to.have.property( 'parent' ).that.is.null;
			expect( b ).to.have.property( 'parent' ).that.is.null;
			expect( a ).to.have.property( 'parent' ).that.is.null;

			expect( removed ).to.be.instanceof( NodeList );
			expect( removed.length ).to.equal( 3 );
			expect( removed.get( 0 ) ).to.equal( o );
			expect( removed.get( 1 ) ).to.equal( b );
			expect( removed.get( 2 ) ).to.equal( a );
		} );
	} );

	describe( 'getChildIndex', function() {
		it( 'should return child index', function() {
			var element = new Element( 'elem', [], [ 'bar' ] );
			var b = element.getChild( 0 );
			var a = element.getChild( 1 );
			var r = element.getChild( 2 );

			expect( element.getChildIndex( b ) ).to.equal( 0 );
			expect( element.getChildIndex( a ) ).to.equal( 1 );
			expect( element.getChildIndex( r ) ).to.equal( 2 );
		} );
	} );

	describe( 'getChildCount', function() {
		it( 'should return number of children', function() {
			var element = new Element( 'elem', [], [ 'bar' ] );

			expect( element.getChildCount() ).to.equal( 3 );
		} );
	} );
} );
