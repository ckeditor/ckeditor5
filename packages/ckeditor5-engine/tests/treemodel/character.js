/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */
/* bender-include: ../_tools/tools.js */

'use strict';

const getIteratorCount = bender.tools.core.getIteratorCount;

const modules = bender.amd.require(
	'core/treemodel/character',
	'core/treemodel/node',
	'core/treemodel/element',
	'core/treemodel/attribute'
);

describe( 'Character', () => {
	let Element, Character, Node, Attribute;

	before( () => {
		Element = modules[ 'core/treemodel/element' ];
		Character = modules[ 'core/treemodel/character' ];
		Node = modules[ 'core/treemodel/node' ];
		Attribute = modules[ 'core/treemodel/attribute' ];
	} );

	describe( 'constructor', () => {
		it( 'should create character without attributes', () => {
			let character = new Character( 'f' );
			let parent = new Element( 'parent', [], character );

			expect( character ).to.be.an.instanceof( Node );
			expect( character ).to.have.property( 'character' ).that.equals( 'f' );
			expect( character ).to.have.property( 'parent' ).that.equals( parent );
			expect( getIteratorCount( character.getAttrs() ) ).to.equal( 0 );
		} );

		it( 'should create character with attributes', () => {
			let attr = new Attribute( 'foo', 'bar' );
			let character = new Character( 'f', [ attr ] );
			let parent = new Element( 'parent', [], character );

			expect( character ).to.be.an.instanceof( Node );
			expect( character ).to.have.property( 'character' ).that.equals( 'f' );
			expect( character ).to.have.property( 'parent' ).that.equals( parent );
			expect( getIteratorCount( character.getAttrs() ) ).to.equal( 1 );
			expect( character.getAttr( attr.key ) ).to.equal( attr.value );
		} );
	} );
} );
