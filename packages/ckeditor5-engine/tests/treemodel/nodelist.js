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
		it( 'should change array of strings into a set of nodes', () => {
			let nodeList = new NodeList( [ 'foo', new Character( 'x' ), 'bar' ] );

			expect( nodeList.length ).to.equal( 7 );
			expect( nodeList.get( 0 ).text ).to.equal( 'f' );
			expect( nodeList.get( 1 ).text ).to.equal( 'o' );
			expect( nodeList.get( 2 ).text ).to.equal( 'o' );
			expect( nodeList.get( 3 ).text ).to.equal( 'x' );
			expect( nodeList.get( 4 ).text ).to.equal( 'b' );
			expect( nodeList.get( 5 ).text ).to.equal( 'a' );
			expect( nodeList.get( 6 ).text ).to.equal( 'r' );
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
} );
