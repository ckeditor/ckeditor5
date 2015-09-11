/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint expr: true */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/character',
	'document/node',
	'document/element',
	'document/attribute' );

describe( 'constructor', function() {
	it( 'should create character without attributes', function() {
		var Element = modules[ 'document/element' ];
		var Character = modules[ 'document/character' ];
		var Node = modules[ 'document/node' ];

		var parent = new Element( null, 'parent' );

		var character = new Character( parent, 'f' );

		expect( character ).to.be.an.instanceof( Node );
		expect( character ).to.have.property( 'character' ).that.equals( 'f' );
		expect( character ).to.have.property( 'parent' ).that.equals( parent );
		expect( character ).to.have.property( 'attrs' ).that.is.an( 'array' ).and.is.empty;
	} );

	it( 'should create character with attributes', function() {
		var Element = modules[ 'document/element' ];
		var Character = modules[ 'document/character' ];
		var Node = modules[ 'document/node' ];
		var Attribute = modules[ 'document/attribute' ];

		var parent = new Element( null, 'parent' );
		var attr = new Attribute( 'key', 'value' );

		var character = new Character( parent, 'f', [ attr ] );

		expect( character ).to.be.an.instanceof( Node );
		expect( character ).to.have.property( 'character' ).that.equals( 'f' );
		expect( character ).to.have.property( 'parent' ).that.equals( parent );
		expect( character ).to.have.property( 'attrs' ).that.is.an( 'array' ).with.length( 1 );
		expect( character.attrs[ 0 ] ).that.equals( attr );
	} );
} );