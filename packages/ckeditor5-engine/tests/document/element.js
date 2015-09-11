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

		var parent = new Element( null, 'parent' );

		var element = new Element( parent, 'elem' );

		expect( element ).to.be.an.instanceof( Node );
		expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
		expect( element ).to.have.property( 'parent' ).that.equals( parent );
		expect( element ).to.have.property( 'attrs' ).that.is.an( 'array' ).and.is.empty;
	} );

	it( 'should create element with attributes', function() {
		var Element = modules[ 'document/element' ];
		var Node = modules[ 'document/node' ];
		var Attribute = modules[ 'document/attribute' ];

		var parent = new Element( null, 'parent' );
		var attr = new Attribute( 'key', 'value' );

		var element = new Element( parent, 'elem', [ attr ] );

		expect( element ).to.be.an.instanceof( Node );
		expect( element ).to.have.property( 'name' ).that.equals( 'elem' );
		expect( element ).to.have.property( 'parent' ).that.equals( parent );
		expect( element ).to.have.property( 'attrs' ).that.is.an( 'array' ).with.length( 1 );
		expect( element.attrs[ 0 ] ).that.equals( attr );
	} );
} );