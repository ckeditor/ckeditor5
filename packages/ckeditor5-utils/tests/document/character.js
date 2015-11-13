/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint expr: true */

/* bender-tags: document */

/* bender-include: ../_tools/tools.js */

'use strict';

const getIteratorCount = bender.tools.core.getIteratorCount;

const modules = bender.amd.require(
	'document/character',
	'document/node',
	'document/element',
	'document/attribute'
);

describe( 'Character', () => {
	let Element, Character, Node, Attribute;

	before( () => {
		Element = modules[ 'document/element' ];
		Character = modules[ 'document/character' ];
		Node = modules[ 'document/node' ];
		Attribute = modules[ 'document/attribute' ];
	} );

	describe( 'constructor', () => {
		it( 'should create character without attributes', () => {
			let character = new Character( 'f' );
			let parent = new Element( 'parent', [], character );

			expect( character ).to.be.an.instanceof( Node );
			expect( character ).to.have.property( 'character' ).that.equals( 'f' );
			expect( character ).to.have.property( 'parent' ).that.equals( parent );
			expect( getIteratorCount( character.getAttrIterator() ) ).to.equal( 0 );
		} );

		it( 'should create character with attributes', () => {
			let attr = new Attribute( 'foo', 'bar' );
			let character = new Character( 'f', [ attr ] );
			let parent = new Element( 'parent', [], character );

			expect( character ).to.be.an.instanceof( Node );
			expect( character ).to.have.property( 'character' ).that.equals( 'f' );
			expect( character ).to.have.property( 'parent' ).that.equals( parent );
			expect( getIteratorCount( character.getAttrIterator() ) ).to.equal( 1 );
			expect( character.getAttr( attr.key ) ).to.equal( attr.value );
		} );
	} );
} );
