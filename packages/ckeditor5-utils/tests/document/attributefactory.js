/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, bender */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require( 'document/attributefactory' );

describe( 'create', function() {
	it( 'should create the same instance', function() {
		var AttributeFactory = modules[ 'document/attributefactory' ];

		var factory = new AttributeFactory();

		var attr1 = factory.create( 'foo', 'bar' );
		var attr2 = factory.create( 'foo', 'bar' );

		expect( attr1 ).to.equals( attr2 );
		expect( attr1 ).to.have.property( 'key' ).that.equals( 'foo' );
		expect( attr1 ).to.have.property( 'value' ).that.equals( 'bar' );
	} );

	it( 'should create the same instance even if object has different order', function() {
		var AttributeFactory = modules[ 'document/attributefactory' ];

		var factory = new AttributeFactory();

		var attr1 = factory.create( 'foo', { a: 1, b: 2 } );
		var attr2 = factory.create( 'foo', { b: 2, a: 1 } );

		expect( attr1 ).to.equals( attr2 );
		expect( attr1 ).to.have.property( 'key' ).that.equals( 'foo' );
		expect( attr1 ).to.have.property( 'value' ).that.deep.equals( { a: 1, b: 2 } );
	} );

	it( 'should create different objects', function() {
		var AttributeFactory = modules[ 'document/attributefactory' ];

		var factory = new AttributeFactory();

		var attr1 = factory.create( 'foo', 'bar' );
		var attr2 = factory.create( 'foo', 'baz' );

		expect( attr1 ).to.not.equals( attr2 );

		expect( attr1 ).to.have.property( 'key' ).that.equals( 'foo' );
		expect( attr1 ).to.have.property( 'value' ).that.equals( 'bar' );

		expect( attr1 ).to.have.property( 'key' ).that.equals( 'foo' );
		expect( attr2 ).to.have.property( 'value' ).that.equals( 'baz' );
	} );
} );