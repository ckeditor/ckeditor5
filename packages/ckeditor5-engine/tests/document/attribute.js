/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, bender */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require( 'document/attribute' );

describe( 'constructor', function() {
	it( 'should create attribute', function() {
		var Attribute = modules[ 'document/attribute' ];

		var attr = new Attribute( 'foo', 'bar' );

		expect( attr ).to.have.property( 'key' ).that.equals( 'foo' );
		expect( attr ).to.have.property( 'value' ).that.equals( 'bar' );
	} );
} );