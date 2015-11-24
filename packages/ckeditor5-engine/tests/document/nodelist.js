/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/nodelist',
	'document/character',
	'document/text',
	'document/attribute'
);

describe( 'NodeList', () => {
	let NodeList, Character, Text, Attribute;

	before( () => {
		NodeList = modules[ 'document/nodelist' ];
		Character = modules[ 'document/character' ];
		Text = modules[ 'document/text' ];
		Attribute = modules[ 'document/attribute' ];
	} );

	describe( 'constructor', () => {
		it( 'should change array of strings into a set of nodes', () => {
			let nodeList = new NodeList( [ 'foo', new Character( 'x' ), 'bar' ] );

			expect( nodeList.length ).to.equal( 7 );
			expect( nodeList.get( 0 ).character ).to.equal( 'f' );
			expect( nodeList.get( 1 ).character ).to.equal( 'o' );
			expect( nodeList.get( 2 ).character ).to.equal( 'o' );
			expect( nodeList.get( 3 ).character ).to.equal( 'x' );
			expect( nodeList.get( 4 ).character ).to.equal( 'b' );
			expect( nodeList.get( 5 ).character ).to.equal( 'a' );
			expect( nodeList.get( 6 ).character ).to.equal( 'r' );
		} );

		it( 'should change string into a set of nodes', () => {
			let nodeList = new NodeList( 'foo' );

			expect( nodeList.length ).to.equal( 3 );
			expect( nodeList.get( 0 ).character ).to.equal( 'f' );
			expect( nodeList.get( 1 ).character ).to.equal( 'o' );
			expect( nodeList.get( 2 ).character ).to.equal( 'o' );
		} );

		it( 'should change node into a set of nodes', () => {
			let nodeList = new NodeList( new Character( 'x' ) );

			expect( nodeList.length ).to.equal( 1 );
			expect( nodeList.get( 0 ).character ).to.equal( 'x' );
		} );

		it( 'should change text with attribute into a set of nodes', () => {
			let attr = new Attribute( 'bold', true );
			let nodeList = new NodeList( new Text( 'foo', [ attr ] ) );

			expect( nodeList.length ).to.equal( 3 );
			expect( nodeList.get( 0 ).character ).to.equal( 'f' );
			expect( nodeList.get( 0 ).getAttr( attr.key ) ).to.equal( attr.value );
			expect( nodeList.get( 1 ).character ).to.equal( 'o' );
			expect( nodeList.get( 1 ).getAttr( attr.key ) ).to.equal( attr.value );
			expect( nodeList.get( 2 ).character ).to.equal( 'o' );
			expect( nodeList.get( 2 ).getAttr( attr.key ) ).to.equal( attr.value );
		} );
	} );

	describe( 'insert', () => {
		it( 'should insert one nodelist into another', () => {
			let outerList = new NodeList( 'foo' );
			let innerList = new NodeList( 'xxx' );

			outerList.insert( 2, innerList );

			expect( outerList.length ).to.equal( 6 );
			expect( outerList.get( 0 ).character ).to.equal( 'f' );
			expect( outerList.get( 1 ).character ).to.equal( 'o' );
			expect( outerList.get( 2 ).character ).to.equal( 'x' );
			expect( outerList.get( 3 ).character ).to.equal( 'x' );
			expect( outerList.get( 4 ).character ).to.equal( 'x' );
			expect( outerList.get( 5 ).character ).to.equal( 'o' );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove part of the nodelist', () => {
			let nodeList = new NodeList( 'foobar' );

			nodeList.remove( 2, 3 );

			expect( nodeList.length ).to.equal( 3 );
			expect( nodeList.get( 0 ).character ).to.equal( 'f' );
			expect( nodeList.get( 1 ).character ).to.equal( 'o' );
			expect( nodeList.get( 2 ).character ).to.equal( 'r' );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over all elements in the collection', () => {
			let characters = 'foo';
			let nodeList = new NodeList( characters );
			let i = 0;

			for ( let node of nodeList ) {
				expect( node.character ).to.equal( characters[ i ] );
				i++;
			}

			expect( i ).to.equal( 3 );
		} );
	} );
} );
