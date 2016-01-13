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
	'core/treemodel/textnode',
	'core/treemodel/attribute',
	'core/treemodel/attributelist'
);

describe( 'TextNode', () => {
	let Node, Element, Text, TextNode, Attribute, AttributeList;
	let text, element, textNode;

	before( () => {
		Node = modules[ 'core/treemodel/node' ];
		Element = modules[ 'core/treemodel/element' ];
		Text = modules[ 'core/treemodel/text' ];
		TextNode = modules[ 'core/treemodel/textnode' ];
		Attribute = modules[ 'core/treemodel/attribute' ];
		AttributeList = modules[ 'core/treemodel/attribute' ];

		text = new Text( 'foobar', [ new Attribute( 'foo', true ) ] );
		element = new Element( 'div', [], [ new Element( 'p' ), 'abc', text, new Element( 'p' ) ] );
	} );

	beforeEach( () => {
		textNode = new TextNode( text, 2, 3 );
	} );

	it( 'should extend Node class', () => {
		expect( textNode ).to.be.instanceof( Node );
	} );

	it( 'should have text property basing on passed Text instance', () => {
		expect( textNode ).to.have.property( 'text' ).that.equals( 'oba' );
	} );

	it( 'should have parent property basing on passed Text instance', () => {
		expect( textNode ).to.have.property( 'parent' ).that.equals( element );
	} );

	it( 'should have attributes list equal to passed Text instance', () => {
		expect( textNode.attrs.isEqual( text.attrs ) ).to.be.true;
	} );

	it( 'should have correct start property', () => {
		expect( textNode._start ).to.equal( 2 );
	} );

	it( 'should not change original Text instance when changed', () => {
		textNode.text = 'ab';
		textNode._start = 0;
		textNode.parent = new Element( 'p' );
		textNode.attrs = new AttributeList();

		expect( text.text ).to.equal( 'foobar' );
		expect( text.parent ).to.equal( element );
		expect( text.attrs.size ).to.equal( 1 );
	} );

	it( 'getIndex should return value with text node offset in original Text instance', () => {
		expect( textNode.getIndex() ).to.equal( 6 );
	} );

	it( 'should have nextSibling property which is a node/character placed after the last character from text node', () => {
		expect( textNode ).to.have.property( 'nextSibling' );
		expect( textNode.nextSibling.text ).to.equal( 'r' );
	} );
} );
