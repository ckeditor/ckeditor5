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

describe( 'Character', function() {
	var Element, Character, Node, Attribute;

	before( function() {
		Element = modules[ 'document/element' ];
		Character = modules[ 'document/character' ];
		Node = modules[ 'document/node' ];
		Attribute = modules[ 'document/attribute' ];
	} );

	describe( 'constructor', function() {
		it( 'should create character without attributes', function() {
			var character = new Character( 'f' );
			var parent = new Element( 'parent', [], character );

			expect( character ).to.be.an.instanceof( Node );
			expect( character ).to.have.property( 'character' ).that.equals( 'f' );
			expect( character ).to.have.property( 'parent' ).that.equals( parent );
			expect( character._getAttrCount() ).to.equals( 0 );
		} );

		it( 'should create character with attributes', function() {
			var attr = new Attribute( 'foo', 'bar' );
			var character = new Character( 'f', [ attr ] );
			var parent = new Element( 'parent', [], character );

			expect( character ).to.be.an.instanceof( Node );
			expect( character ).to.have.property( 'character' ).that.equals( 'f' );
			expect( character ).to.have.property( 'parent' ).that.equals( parent );
			expect( character._getAttrCount() ).to.equals( 1 );
			expect( character.getAttr( attr.key ) ).to.equals( attr.value );
		} );
	} );
} );
