/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import NodeList from '/ckeditor5/core/treemodel/nodelist.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import Text from '/ckeditor5/core/treemodel/text.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';

describe( 'NodeList', () => {
	describe( 'constructor', () => {
		it( 'should change array of characters into a set of nodes', () => {
			let textFoo = new Text( 'foo' );
			let nodeList = new NodeList( [ 'foo', new Text( 'x' ), 'bar', textFoo.getTextNode() ] );

			expect( nodeList.length ).to.equal( 10 );
			expect( nodeList.get( 0 ).text ).to.equal( 'f' );
			expect( nodeList.get( 1 ).text ).to.equal( 'o' );
			expect( nodeList.get( 2 ).text ).to.equal( 'o' );
			expect( nodeList.get( 3 ).text ).to.equal( 'x' );
			expect( nodeList.get( 4 ).text ).to.equal( 'b' );
			expect( nodeList.get( 5 ).text ).to.equal( 'a' );
			expect( nodeList.get( 6 ).text ).to.equal( 'r' );
			expect( nodeList.get( 7 ).text ).to.equal( 'f' );
			expect( nodeList.get( 8 ).text ).to.equal( 'o' );
			expect( nodeList.get( 9 ).text ).to.equal( 'o' );
		} );

		it( 'should omit empty strings / texts', () => {
			let nodeList = new NodeList( [ 'fo', '', 'ob', new Text( '', [ new Attribute( 'foo', true ) ] ), 'ar' ] );

			expect( nodeList.length ).to.equal( 6 );
			expect( nodeList.get( 0 ).text ).to.equal( 'f' );
			expect( nodeList.get( 1 ).text ).to.equal( 'o' );
			expect( nodeList.get( 2 ).text ).to.equal( 'o' );
			expect( nodeList.get( 3 ).text ).to.equal( 'b' );
			expect( nodeList.get( 4 ).text ).to.equal( 'a' );
			expect( nodeList.get( 5 ).text ).to.equal( 'r' );

			expect( nodeList.get( 0 ).attrs.size ).to.equal( 0 );
			expect( nodeList.get( 1 ).attrs.size ).to.equal( 0 );
			expect( nodeList.get( 2 ).attrs.size ).to.equal( 0 );
			expect( nodeList.get( 3 ).attrs.size ).to.equal( 0 );
			expect( nodeList.get( 4 ).attrs.size ).to.equal( 0 );
			expect( nodeList.get( 5 ).attrs.size ).to.equal( 0 );
		} );

		it( 'should change string into a set of nodes', () => {
			let nodeList = new NodeList( 'foo' );

			expect( nodeList.length ).to.equal( 3 );
			expect( nodeList.get( 0 ).text ).to.equal( 'f' );
			expect( nodeList.get( 1 ).text ).to.equal( 'o' );
			expect( nodeList.get( 2 ).text ).to.equal( 'o' );
		} );

		it( 'should change node into a set of nodes', () => {
			let nodeList = new NodeList( new Text( 'x' ) );

			expect( nodeList.length ).to.equal( 1 );
			expect( nodeList.get( 0 ).text ).to.equal( 'x' );
		} );

		it( 'should change text with attribute into a set of nodes', () => {
			let attr = new Attribute( 'bold', true );
			let nodeList = new NodeList( new Text( 'foo', [ attr ] ) );

			expect( nodeList.length ).to.equal( 3 );
			expect( nodeList.get( 0 ).text ).to.equal( 'f' );
			expect( nodeList.get( 0 ).attrs.getValue( attr.key ) ).to.equal( attr.value );
			expect( nodeList.get( 1 ).text ).to.equal( 'o' );
			expect( nodeList.get( 1 ).attrs.getValue( attr.key ) ).to.equal( attr.value );
			expect( nodeList.get( 2 ).text ).to.equal( 'o' );
			expect( nodeList.get( 2 ).attrs.getValue( attr.key ) ).to.equal( attr.value );
		} );

		it( 'should merge strings and text objects if possible', () => {
			let attr = new Attribute( 'foo', 'bar' );
			let nodeList = new NodeList( [ 'fo', new Text( 'o' ), new Text( 'x', [ attr ] ), new Text( 'y', [ attr ] ), 'bar' ] );

			expect( nodeList.length ).to.equal( 8 );
			expect( nodeList.get( 0 ).text ).to.equal( 'f' );
			expect( nodeList.get( 1 ).text ).to.equal( 'o' );
			expect( nodeList.get( 2 ).text ).to.equal( 'o' );
			expect( nodeList.get( 3 ).text ).to.equal( 'x' );
			expect( nodeList.get( 4 ).text ).to.equal( 'y' );
			expect( nodeList.get( 5 ).text ).to.equal( 'b' );
			expect( nodeList.get( 6 ).text ).to.equal( 'a' );
			expect( nodeList.get( 7 ).text ).to.equal( 'r' );

			expect( nodeList._nodes.length ).to.equal( 3 );
			expect( nodeList._nodes[ 0 ].text ).to.equal( 'foo' );
			expect( nodeList._nodes[ 1 ].text ).to.equal( 'xy' );
			expect( nodeList._nodes[ 2 ].text ).to.equal( 'bar' );
		} );
	} );

	describe( 'insert', () => {
		it( 'should insert one node list into another', () => {
			let outerList = new NodeList( 'foo' );
			let innerList = new NodeList( 'xxx' );

			outerList.insert( 2, innerList );

			expect( outerList.length ).to.equal( 6 );
			expect( outerList.get( 0 ).text ).to.equal( 'f' );
			expect( outerList.get( 1 ).text ).to.equal( 'o' );
			expect( outerList.get( 2 ).text ).to.equal( 'x' );
			expect( outerList.get( 3 ).text ).to.equal( 'x' );
			expect( outerList.get( 4 ).text ).to.equal( 'x' );
			expect( outerList.get( 5 ).text ).to.equal( 'o' );
		} );

		it( 'should merge inserted text objects if possible', () => {
			let attr = new Attribute( 'foo', 'bar' );
			let outerList = new NodeList( [ 'foo', new Text( 'bar', [ attr ] ) ] );
			let innerList = new NodeList( [ 'x' , new Text( 'y', [ attr ] ) ] );

			outerList.insert( 3, innerList );

			expect( outerList._nodes.length ).to.equal( 2 );
			expect( outerList._nodes[ 0 ].text ).to.equal( 'foox' );
			expect( outerList._nodes[ 1 ].text ).to.equal( 'ybar' );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove part of the node list and return removed nodes as another node list', () => {
			let nodeList = new NodeList( 'foobar' );

			let removed = nodeList.remove( 2, 3 );

			expect( nodeList.length ).to.equal( 3 );
			expect( nodeList.get( 0 ).text ).to.equal( 'f' );
			expect( nodeList.get( 1 ).text ).to.equal( 'o' );
			expect( nodeList.get( 2 ).text ).to.equal( 'r' );

			expect( removed ).to.be.instanceof( NodeList );
			expect( removed.length ).to.equal( 3 );
			expect( removed.get( 0 ).text ).to.equal( 'o' );
			expect( removed.get( 1 ).text ).to.equal( 'b' );
			expect( removed.get( 2 ).text ).to.equal( 'a' );
		} );

		it( 'should merge text objects left in node list possible', () => {
			let attr = new Attribute( 'foo', 'bar' );
			let nodeList = new NodeList( [ 'foo', new Text( 'xxx', [ attr ] ), 'bar' ] );

			nodeList.remove( 2, 5 );

			expect( nodeList._nodes.length ).to.equal( 1 );
			expect( nodeList._nodes[ 0 ].text ).to.equal( 'foar' );
		} );

		it( 'should return empty node list and do nothing if node list removed from is also empty', () => {
			let nodeList = new NodeList();
			let result = nodeList.remove( 2, 3 );

			expect( result.length ).to.equal( 0 );
		} );
	} );

	describe( 'indexOf', () => {
		let nodeList, p;

		beforeEach( () => {
			p = new Element( 'p' );
			nodeList = new NodeList( [ 'abc', p, 'def' ] );
		} );

		it( 'should return index of specified element', () => {
			let index = nodeList.indexOf( p );

			expect( index ).to.equal( 3 );
		} );

		it( 'should return index of specified text node', () => {
			let textNode = nodeList.get( 5 );
			let index = nodeList.indexOf( textNode );

			expect( index ).to.equal( 5 );
		} );

		it( 'should return -1 if specified element is not a part of a node list', () => {
			expect( nodeList.indexOf( new Element( 'p' ) ) ).to.equal( -1 );
		} );

		it( 'should return -1 if specified text node is not a part of a node list', () => {
			let text = new Text( 'foobar' );
			let textNode = text.getTextNode( 2, 2 );

			expect( nodeList.indexOf( textNode ) ).to.equal( -1 );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over all elements in the collection', () => {
			let characters = 'foo';
			let nodeList = new NodeList( characters );
			let i = 0;

			for ( let node of nodeList ) {
				expect( node.text ).to.equal( characters[ i ] );
				i++;
			}

			expect( i ).to.equal( 3 );
		} );
	} );

	describe( '_splitNodeAt', () => {
		it( 'should split text object into two text objects', () => {
			let nodeList = new NodeList( 'abcd' );
			nodeList._splitNodeAt( 2 );

			expect( nodeList._nodes.length ).to.equal( 2 );
			expect( nodeList._nodes[ 0 ].text ).to.equal( 'ab' );
			expect( nodeList._nodes[ 1 ].text ).to.equal( 'cd' );
		} );

		it( 'should do nothing if node before and after index are different', () => {
			let nodeList = new NodeList( [ new Text( 'ab', [ new Attribute( 'foo', true ) ] ), 'cd' ] );
			nodeList._splitNodeAt( 2 );

			expect( nodeList._nodes.length ).to.equal( 2 );
			expect( nodeList._nodes[ 0 ].text ).to.equal( 'ab' );
			expect( nodeList._nodes[ 1 ].text ).to.equal( 'cd' );
		} );
	} );

	describe( '_mergeNodeAt', () => {
		it( 'should merge two text object if they have same attributes', () => {
			let attr = new Attribute( 'foo', true );
			let nodeList = new NodeList( [ 'ab', new Text( 'cd', [ attr ] ) ] );
			nodeList._nodes[ 1 ].attrs.delete( attr.key );

			expect( nodeList._nodes.length ).to.equal( 2 );

			nodeList._mergeNodeAt( 2 );

			expect( nodeList._nodes.length ).to.equal( 1 );
			expect( nodeList._nodes[ 0 ].text ).to.equal( 'abcd' );
		} );

		it( 'should do nothing if text objects has different attributes', () => {
			let nodeList = new NodeList( [ new Text( 'ab', [ new Attribute( 'foo', true ) ] ), 'cd' ] );
			nodeList._mergeNodeAt( 2 );

			expect( nodeList._nodes.length ).to.equal( 2 );
			expect( nodeList._nodes[ 0 ].text ).to.equal( 'ab' );
			expect( nodeList._nodes[ 1 ].text ).to.equal( 'cd' );
		} );
	} );

	describe( '_getCharIndex', () => {
		it( 'should return offset of given index from the beginning of the text node', () => {
			let nodeList = new NodeList( [ new Text( 'ab', [ new Attribute( 'foo', true ) ] ), 'cd' ] );
			let charIndexC = nodeList._getCharIndex( 2 );
			let charIndexD = nodeList._getCharIndex( 3 );

			expect( charIndexC ).to.equal( 0 );
			expect( charIndexD ).to.equal( 1 );
		} );
	} );
} );
