/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, bender */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require( 'document/document', 'document/element' );

describe( 'constructor', function() {
	it( 'should create Document with no data', function() {
		var Document = modules[ 'document/document' ];
		var Element = modules[ 'document/element' ];

		var document = new Document();

		expect( document ).to.have.property( 'root' ).that.is.instanceof( Element );
		expect( document.root ).to.have.property( 'name' ).that.equal( 'root' );
	} );
} );