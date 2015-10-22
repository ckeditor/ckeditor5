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
		expect( element ).to.have.property( 'attrs' ).that.is.an( 'array' ).and.is.empty;
	} );

	it( 'should create element with attributes', function() {
		var Element = modules[ 'document/element' ];
		var Node = modules[ 'document/node' ];
		var Attribute = modules[ 'document/attribute' ];

		var attr = new Attribute( 'key', 'value' );

		var element = new Element( 'elem', [ attr ] );

		var parent = new Element( 'parent', [], [ element ] );

		expect( element ).to.be.an.instanceof( Node );
		expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
		expect( element ).to.have.property( 'parent' ).that.equals( parent );
		expect( element ).to.have.property( 'attrs' ).that.is.an( 'array' ).with.length( 1 );
		expect( element.attrs[ 0 ] ).that.equals( attr );
	} );

	it( 'should create element with children', function() {
		var Element = modules[ 'document/element' ];

		var element = new Element( 'elem', [], 'foo' );

		expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
		expect( element ).to.have.property( 'children' ).with.length( 3 );
		expect( element.children.get( 0 ) ).to.have.property( 'character' ).that.equals( 'f' );
		expect( element.children.get( 1 ) ).to.have.property( 'character' ).that.equals( 'o' );
		expect( element.children.get( 2 ) ).to.have.property( 'character' ).that.equals( 'o' );
	} );
} );

describe( 'insertChildren', function() {
	it( 'should add children to the element', function() {
		var Element = modules[ 'document/element' ];

		var element = new Element( 'elem', [], [ 'xy' ] );
		element.insertChildren( 1, 'foo' );

		expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
		expect( element ).to.have.property( 'children' ).with.length( 5 );
		expect( element.children.get( 0 ) ).to.have.property( 'character' ).that.equals( 'x' );
		expect( element.children.get( 1 ) ).to.have.property( 'character' ).that.equals( 'f' );
		expect( element.children.get( 2 ) ).to.have.property( 'character' ).that.equals( 'o' );
		expect( element.children.get( 3 ) ).to.have.property( 'character' ).that.equals( 'o' );
		expect( element.children.get( 4 ) ).to.have.property( 'character' ).that.equals( 'y' );
	} );
} );