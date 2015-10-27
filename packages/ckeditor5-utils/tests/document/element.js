/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint expr: true */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/node',
	'document/element',
	'document/attribute' );

describe( 'constructor', function() {
	it( 'should create element without attributes', function() {
		var Element = modules[ 'document/element' ];
		var Node = modules[ 'document/node' ];

		var element = new Element( 'elem' );
		var parent = new Element( 'parent', [], [ element ] );

		expect( element ).to.be.an.instanceof( Node );
		expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
		expect( element ).to.have.property( 'parent' ).that.equals( parent );
		expect( element._getAttrCount() ).to.equals( 0 );
	} );

	it( 'should create element with attributes', function() {
		var Element = modules[ 'document/element' ];
		var Node = modules[ 'document/node' ];
		var Attribute = modules[ 'document/attribute' ];

		var attr = new Attribute( 'foo', 'bar' );

		var element = new Element( 'elem', [ attr ] );

		var parent = new Element( 'parent', [], [ element ] );

		expect( element ).to.be.an.instanceof( Node );
		expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
		expect( element ).to.have.property( 'parent' ).that.equals( parent );
		expect( element._getAttrCount() ).to.equals( 1 );
		expect( element.getAttr( attr.key ) ).to.equals( attr.value );
	} );

	it( 'should create element with children', function() {
		var Element = modules[ 'document/element' ];

		var element = new Element( 'elem', [], 'foo' );

		expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
		expect( element.getChildCount() ).to.be.equals( 3 );
		expect( element.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'f' );
		expect( element.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'o' );
		expect( element.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'o' );
	} );
} );

describe( 'insertChildren', function() {
	it( 'should add children to the element', function() {
		var Element = modules[ 'document/element' ];

		var element = new Element( 'elem', [], [ 'xy' ] );
		element.insertChildren( 1, 'foo' );

		expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
		expect( element.getChildCount() ).to.be.equals( 5 );
		expect( element.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'x' );
		expect( element.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'f' );
		expect( element.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'o' );
		expect( element.getChild( 3 ) ).to.have.property( 'character' ).that.equals( 'o' );
		expect( element.getChild( 4 ) ).to.have.property( 'character' ).that.equals( 'y' );
	} );
} );

describe( 'removeChildren', function() {
	it( 'should add children to the element', function() {
		var Element = modules[ 'document/element' ];

		var element = new Element( 'elem', [], [ 'foobar' ] );
		var o = element.getChild( 2 );
		var b = element.getChild( 3 );
		var a = element.getChild( 4 );
		element.removeChildren( 2, 3 );

		expect( element.getChildCount() ).to.be.equals( 3 );
		expect( element.getChild( 0 ) ).to.have.property( 'character' ).that.equals( 'f' );
		expect( element.getChild( 1 ) ).to.have.property( 'character' ).that.equals( 'o' );
		expect( element.getChild( 2 ) ).to.have.property( 'character' ).that.equals( 'r' );

		expect( o ).to.have.property( 'parent' ).that.is.null;
		expect( b ).to.have.property( 'parent' ).that.is.null;
		expect( a ).to.have.property( 'parent' ).that.is.null;
	} );
} );

describe( 'getChildIndex', function() {
	it( 'should return child index', function() {
		var Element = modules[ 'document/element' ];

		var element = new Element( 'elem', [], [ 'bar' ] );
		var b = element.getChild( 0 );
		var a = element.getChild( 1 );
		var r = element.getChild( 2 );

		expect( element.getChildIndex( b ) ).to.equals( 0 );
		expect( element.getChildIndex( a ) ).to.equals( 1 );
		expect( element.getChildIndex( r ) ).to.equals( 2 );
	} );
} );

describe( 'getChildCount', function() {
	it( 'should return number of children', function() {
		var Element = modules[ 'document/element' ];

		var element = new Element( 'elem', [], [ 'bar' ] );

		expect( element.getChildCount() ).to.equals( 3 );
	} );
} );