/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint expr: true */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/character',
	'document/node',
	'document/element',
	'document/attribute'
);

describe( 'Character', function() {
	let Element, Character, Node, Attribute;

	before( function() {
		Element = modules[ 'document/element' ];
		Character = modules[ 'document/character' ];
		Node = modules[ 'document/node' ];
		Attribute = modules[ 'document/attribute' ];
	} );

	describe( 'constructor', function() {
		it( 'should create character without attributes', function() {
			let character = new Character( 'f' );
			let parent = new Element( 'parent', [], character );

			expect( character ).to.be.an.instanceof( Node );
			expect( character ).to.have.property( 'character' ).that.equals( 'f' );
			expect( character ).to.have.property( 'parent' ).that.equals( parent );
			expect( character._getAttrCount() ).to.equal( 0 );
		} );

		it( 'should create character with attributes', function() {
			let attr = new Attribute( 'foo', 'bar' );
			let character = new Character( 'f', [ attr ] );
			let parent = new Element( 'parent', [], character );

			expect( character ).to.be.an.instanceof( Node );
			expect( character ).to.have.property( 'character' ).that.equals( 'f' );
			expect( character ).to.have.property( 'parent' ).that.equals( parent );
			expect( character._getAttrCount() ).to.equal( 1 );
			expect( character.getAttr( attr.key ) ).to.equal( attr.value );
		} );
	} );
} );
