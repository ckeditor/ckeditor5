/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint expr: true */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/character',
	'document/node' );

describe( 'constructor', function() {
	it( 'should create Character', function() {
		var Character = modules[ 'document/character' ];
		var Node = modules[ 'document/node' ];

		var character = new Character( null, 'f' );

		expect( character ).to.be.an.instanceof( Node );

		expect( character ).to.have.property( 'character' ).that.equals( 'f' );
		expect( character ).to.have.property( 'attrs' ).that.is.an( 'array' ).and.is.empty;
	} );
} );