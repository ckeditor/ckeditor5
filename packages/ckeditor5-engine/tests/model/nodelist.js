/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

'use strict';

import NodeList from '/ckeditor5/engine/model/nodelist.js';
import Element from '/ckeditor5/engine/model/element.js';
import Text from '/ckeditor5/engine/model/text.js';
import { jsonParseStringify } from '/tests/engine/model/_utils/utils.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'NodeList', () => {
	let nodes, p, foo, img;

	beforeEach( () => {
		p = new Element( 'p' );
		foo = new Text( 'foo' );
		img = new Element( 'image' );
		nodes = new NodeList( [ p, foo, img ] );
	} );

	describe( 'constructor', () => {
		it( 'should create empty node list', () => {
			expect( new NodeList().length ).to.equal( 0 );
		} );

		it( 'should create node list with passed nodes', () => {
			expect( nodes.length ).to.equal( 3 );
			expect( nodes.getNode( 0 ) ).to.equal( p );
			expect( nodes.getNode( 1 ) ).to.equal( foo );
			expect( nodes.getNode( 2 ) ).to.equal( img );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over all nodes from node list', () => {
			expect( Array.from( nodes ) ).to.deep.equal( [ p, foo, img ] );
		} );
	} );

	describe( 'totalOffset', () => {
		it( 'should be equal to the sum of offsetSize of all nodes in node list', () => {
			expect( nodes.totalOffset ).to.equal( 5 );
		} );
	} );

	describe( 'getNode', () => {
		it( 'should return null for wrong index', () => {
			expect( nodes.getNode( -1 ) ).to.be.null;
			expect( nodes.getNode( 3 ) ).to.be.null;
		} );
	} );

	describe( 'getNodeIndex', () => {
		it( 'should return an index at which given node is stored', () => {
			expect( nodes.getNodeIndex( p ) ).to.equal( 0 );
			expect( nodes.getNodeIndex( foo ) ).to.equal( 1 );
			expect( nodes.getNodeIndex( img ) ).to.equal( 2 );
		} );

		it( 'should return null if node is not in the node list', () => {
			expect( nodes.getNodeIndex( new Element( 'p' ) ) ).to.be.null;
		} );
	} );

	describe( 'getNodeStartOffset', () => {
		it( 'should return offset at which given node starts', () => {
			expect( nodes.getNodeStartOffset( p ) ).to.equal( 0 );
			expect( nodes.getNodeStartOffset( foo ) ).to.equal( 1 );
			expect( nodes.getNodeStartOffset( img ) ).to.equal( 4 );
		} );

		it( 'should return null if node is not in the node list', () => {
			expect( nodes.getNodeStartOffset( new Element( 'p' ) ) ).to.be.null;
		} );
	} );

	describe( 'indexToOffset', () => {
		it( 'should return starting offset of a node stored at given index', () => {
			expect( nodes.indexToOffset( 0 ) ).to.equal( 0 );
			expect( nodes.indexToOffset( 1 ) ).to.equal( 1 );
			expect( nodes.indexToOffset( 2 ) ).to.equal( 4 );
		} );

		it( 'should return 0 if given index was lower than 0', () => {
			expect( nodes.indexToOffset( -1 ) ).to.equal( 0 );
		} );

		it( 'should return totalOffset if given index was too high', () => {
			expect( nodes.indexToOffset( 3 ) ).to.equal( 5 );
			expect( nodes.indexToOffset( 99 ) ).to.equal( 5 );
		} );
	} );

	describe( 'offsetToIndex', () => {
		it( 'should return index of a node that occupies given offset', () => {
			expect( nodes.offsetToIndex( 0 ) ).to.equal( 0 );
			expect( nodes.offsetToIndex( 1 ) ).to.equal( 1 );
			expect( nodes.offsetToIndex( 2 ) ).to.equal( 1 );
			expect( nodes.offsetToIndex( 3 ) ).to.equal( 1 );
			expect( nodes.offsetToIndex( 4 ) ).to.equal( 2 );
		} );

		it( 'should return 0 if given offset was lower than 0', () => {
			expect( nodes.offsetToIndex( -1 ) ).to.equal( 0 );
		} );

		it( 'should return length if given offset was too high', () => {
			expect( nodes.offsetToIndex( 5 ) ).to.equal( 3 );
			expect( nodes.offsetToIndex( 99 ) ).to.equal( 3 );
		} );
	} );

	describe( 'insertNodes', () => {
		it( 'should insert nodes at given index', () => {
			let newImg = new Element( 'image' );
			nodes.insertNodes( 1, [ newImg ]  );

			let bar = new Text( 'bar', { bold: true } );
			let xyz = new Text( 'xyz' );
			nodes.insertNodes( 4, [ bar, xyz ] );

			expect( nodes.length ).to.equal( 6 );
			expect( nodes.totalOffset ).to.equal( 12 );

			expect( Array.from( nodes ) ).to.deep.equal( [ p, newImg, foo, img, bar, xyz ] );

			expect( nodes.getNode( 0 ) ).to.equal( p );
			expect( nodes.getNode( 1 ) ).to.equal( newImg );
			expect( nodes.getNode( 2 ) ).to.equal( foo );
			expect( nodes.getNode( 3 ) ).to.equal( img );
			expect( nodes.getNode( 4 ) ).to.equal( bar );
			expect( nodes.getNode( 5 ) ).to.equal( xyz );

			expect( nodes.getNodeIndex( p ) ).to.equal( 0 );
			expect( nodes.getNodeIndex( newImg ) ).to.equal( 1 );
			expect( nodes.getNodeIndex( foo ) ).to.equal( 2 );
			expect( nodes.getNodeIndex( img ) ).to.equal( 3 );
			expect( nodes.getNodeIndex( bar ) ).to.equal( 4 );
			expect( nodes.getNodeIndex( xyz ) ).to.equal( 5 );

			expect( nodes.getNodeStartOffset( p ) ).to.equal( 0 );
			expect( nodes.getNodeStartOffset( newImg ) ).to.equal( 1 );
			expect( nodes.getNodeStartOffset( foo ) ).to.equal( 2 );
			expect( nodes.getNodeStartOffset( img ) ).to.equal( 5 );
			expect( nodes.getNodeStartOffset( bar ) ).to.equal( 6 );
			expect( nodes.getNodeStartOffset( xyz ) ).to.equal( 9 );
		} );

		it( 'should throw if not a Node is inserted', () => {
			expect( () => {
				nodes.insertNodes( 0, [ 'foo' ] );
			} ).to.throw( CKEditorError, /nodelist-insertNodes-not-node/ );
		} );
	} );

	describe( 'removeNodes', () => {
		it( 'should remove one or more nodes from given index', () => {
			nodes.removeNodes( 0, 2 );

			expect( nodes.length ).to.equal( 1 );
			expect( nodes.totalOffset ).to.equal( 1 );

			expect( nodes.getNode( 0 ) ).to.equal( img );
			expect( nodes.getNodeIndex( img ) ).to.equal( 0 );
			expect( nodes.getNodeStartOffset( img ) ).to.equal( 0 );
		} );

		it( 'should remove one node if howMany parameter was not specified', () => {
			nodes.removeNodes( 1 );

			expect( nodes.length ).to.equal( 2 );
			expect( nodes.totalOffset ).to.equal( 2 );

			expect( nodes.getNode( 0 ) ).to.equal( p );
			expect( nodes.getNode( 1 ) ).to.equal( img );

			expect( nodes.getNodeIndex( p ) ).to.equal( 0 );
			expect( nodes.getNodeIndex( img ) ).to.equal( 1 );

			expect( nodes.getNodeStartOffset( p ) ).to.equal( 0 );
			expect( nodes.getNodeStartOffset( img ) ).to.equal( 1 );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should serialize empty node list', () => {
			expect( jsonParseStringify( new NodeList() ) ).to.deep.equal( [] );
		} );

		it( 'should serialize node list with nodes', () => {
			expect( jsonParseStringify( nodes ) ).to.deep.equal( [
				{ name: 'p' },
				{ data: 'foo' },
				{ name: 'image' }
			] );
		} );
	} );
} );
