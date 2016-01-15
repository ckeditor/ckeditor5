/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

const modules = bender.amd.require(
	'core/treemodel/node',
	'core/treemodel/element',
	'core/treemodel/text',
	'core/treemodel/attribute'
);

describe( 'CharacterProxy', () => {
	let Node, Element, Text, Attribute;
	let text, element, char;

	before( () => {
		Node = modules[ 'core/treemodel/node' ];
		Element = modules[ 'core/treemodel/element' ];
		Text = modules[ 'core/treemodel/text' ];
		Attribute = modules[ 'core/treemodel/attribute' ];

		text = new Text( 'abc', [ new Attribute( 'foo', true ) ] );
		element = new Element( 'div', [], [ new Element( 'p' ), text, new Element( 'p' ) ] );
	} );

	beforeEach( () => {
		char = element.getChild( 2 );
	} );

	it( 'should extend Node class', () => {
		expect( char ).to.be.instanceof( Node );
	} );

	it( 'should have correct character property', () => {
		expect( char ).to.have.property( 'character' ).that.equals( 'b' );
	} );

	it( 'should have correct parent property', () => {
		expect( char ).to.have.property( 'parent' ).that.equals( element );
	} );

	it( 'should have attributes list equal to passed to Text instance', () => {
		expect( char.attrs.isEqual( text.attrs ) ).to.be.true;
	} );

	it( 'should return correct index in parent node', () => {
		expect( char.getIndex() ).to.equal( 2 );
	} );
} );
