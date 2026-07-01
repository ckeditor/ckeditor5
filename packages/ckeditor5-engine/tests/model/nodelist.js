/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModelNodeList } from '../../src/model/nodelist.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelText } from '../../src/model/text.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'NodeList', () => {
	let nodes, p, foo, img;

	beforeEach( () => {
		p = new ModelElement( 'p' );
		foo = new ModelText( 'foo' );
		img = new ModelElement( 'imageBlock' );
		nodes = new ModelNodeList( [ p, foo, img ] );
	} );

	describe( 'constructor()', () => {
		it( 'should create empty node list', () => {
			expect( new ModelNodeList().length ).toBe( 0 );
		} );

		it( 'should create node list with passed nodes', () => {
			expect( nodes.length ).toBe( 3 );
			expect( nodes.getNode( 0 ) ).toBe( p );
			expect( nodes.getNode( 1 ) ).toBe( foo );
			expect( nodes.getNode( 2 ) ).toBe( img );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over all nodes from node list', () => {
			expect( Array.from( nodes ) ).toEqual( [ p, foo, img ] );
		} );
	} );

	describe( 'getMaxOffset', () => {
		it( 'should be equal to the sum of offsetSize of all nodes in node list', () => {
			expect( nodes.maxOffset ).toBe( 5 );
		} );
	} );

	describe( 'getNode', () => {
		it( 'should return null for wrong index', () => {
			expect( nodes.getNode( -1 ) ).toBeNull();
			expect( nodes.getNode( 3 ) ).toBeNull();
		} );
	} );

	describe( 'getNodeAtOffset', () => {
		it( 'should return node at given offset', () => {
			expect( nodes.getNodeAtOffset( 0 ) ).toBe( p );
			expect( nodes.getNodeAtOffset( 1 ) ).toBe( foo );
			expect( nodes.getNodeAtOffset( 2 ) ).toBe( foo );
			expect( nodes.getNodeAtOffset( 3 ) ).toBe( foo );
			expect( nodes.getNodeAtOffset( 4 ) ).toBe( img );
		} );

		it( 'should return null for wrong offset', () => {
			expect( nodes.getNodeAtOffset( -1 ) ).toBeNull();
			expect( nodes.getNodeAtOffset( 5 ) ).toBeNull();
		} );
	} );

	describe( 'getNodeIndex', () => {
		it( 'should return an index at which given node is stored', () => {
			expect( nodes.getNodeIndex( p ) ).toBe( 0 );
			expect( nodes.getNodeIndex( foo ) ).toBe( 1 );
			expect( nodes.getNodeIndex( img ) ).toBe( 2 );
		} );

		it( 'should return null if node is not in the node list', () => {
			expect( nodes.getNodeIndex( new ModelElement( 'p' ) ) ).toBeNull();
		} );
	} );

	describe( 'getNodeStartOffset', () => {
		it( 'should return offset at which given node starts', () => {
			expect( nodes.getNodeStartOffset( p ) ).toBe( 0 );
			expect( nodes.getNodeStartOffset( foo ) ).toBe( 1 );
			expect( nodes.getNodeStartOffset( img ) ).toBe( 4 );
		} );

		it( 'should return null if node is not in the node list', () => {
			expect( nodes.getNodeStartOffset( new ModelElement( 'p' ) ) ).toBeNull();
		} );
	} );

	describe( 'indexToOffset', () => {
		it( 'should return starting offset of a node stored at given index', () => {
			expect( nodes.indexToOffset( 0 ) ).toBe( 0 );
			expect( nodes.indexToOffset( 1 ) ).toBe( 1 );
			expect( nodes.indexToOffset( 2 ) ).toBe( 4 );
		} );

		it( 'should throw if given offset is too high or too low', () => {
			expectToThrowCKEditorError( () => {
				nodes.indexToOffset( -1 );
			}, /model-nodelist-index-out-of-bounds/, nodes );

			expectToThrowCKEditorError( () => {
				nodes.indexToOffset( 99 );
			}, /model-nodelist-index-out-of-bounds/, nodes );
		} );

		it( 'should return length if given offset is equal to maxOffset', () => {
			expect( nodes.indexToOffset( 3 ) ).toBe( 5 );
		} );
	} );

	describe( 'offsetToIndex', () => {
		it( 'should return index of a node that occupies given offset', () => {
			expect( nodes.offsetToIndex( 0 ) ).toBe( 0 );
			expect( nodes.offsetToIndex( 1 ) ).toBe( 1 );
			expect( nodes.offsetToIndex( 2 ) ).toBe( 1 );
			expect( nodes.offsetToIndex( 3 ) ).toBe( 1 );
			expect( nodes.offsetToIndex( 4 ) ).toBe( 2 );
		} );

		it( 'should throw if given offset is too high or too low', () => {
			expectToThrowCKEditorError( () => {
				nodes.offsetToIndex( -1 );
			}, /nodelist-offset-out-of-bounds/, nodes );

			expectToThrowCKEditorError( () => {
				nodes.offsetToIndex( 55 );
			}, /nodelist-offset-out-of-bounds/, nodes );
		} );

		it( 'should return length if given offset is equal to maxOffset', () => {
			expect( nodes.offsetToIndex( 5 ) ).toBe( 3 );
		} );
	} );

	describe( '_insertNodes', () => {
		it( 'should insert nodes at given index and refresh its nodes index and startOffset values', () => {
			const newImg = new ModelElement( 'imageBlock' );
			const bar = new ModelText( 'bar', { bold: true } );
			const xyz = new ModelText( 'xyz' );

			expect( newImg.index ).toBeNull();
			expect( bar.index ).toBeNull();
			expect( xyz.index ).toBeNull();

			nodes._insertNodes( 1, [ newImg ] );
			nodes._insertNodes( 4, [ bar, xyz ] );

			expect( nodes.length ).toBe( 6 );
			expect( nodes.maxOffset ).toBe( 12 );

			expect( Array.from( nodes ) ).toEqual( [ p, newImg, foo, img, bar, xyz ] );

			expect( nodes.getNode( 0 ) ).toBe( p );
			expect( nodes.getNode( 1 ) ).toBe( newImg );
			expect( nodes.getNode( 2 ) ).toBe( foo );
			expect( nodes.getNode( 3 ) ).toBe( img );
			expect( nodes.getNode( 4 ) ).toBe( bar );
			expect( nodes.getNode( 5 ) ).toBe( xyz );

			expect( nodes.getNodeIndex( p ) ).toBe( 0 );
			expect( nodes.getNodeIndex( newImg ) ).toBe( 1 );
			expect( nodes.getNodeIndex( foo ) ).toBe( 2 );
			expect( nodes.getNodeIndex( img ) ).toBe( 3 );
			expect( nodes.getNodeIndex( bar ) ).toBe( 4 );
			expect( nodes.getNodeIndex( xyz ) ).toBe( 5 );

			expect( nodes.getNodeStartOffset( p ) ).toBe( 0 );
			expect( nodes.getNodeStartOffset( newImg ) ).toBe( 1 );
			expect( nodes.getNodeStartOffset( foo ) ).toBe( 2 );
			expect( nodes.getNodeStartOffset( img ) ).toBe( 5 );
			expect( nodes.getNodeStartOffset( bar ) ).toBe( 6 );
			expect( nodes.getNodeStartOffset( xyz ) ).toBe( 9 );

			expect( p.index ).toBe( 0 );
			expect( newImg.index ).toBe( 1 );
			expect( foo.index ).toBe( 2 );
			expect( img.index ).toBe( 3 );
			expect( bar.index ).toBe( 4 );
			expect( xyz.index ).toBe( 5 );

			expect( p.startOffset ).toBe( 0 );
			expect( newImg.startOffset ).toBe( 1 );
			expect( foo.startOffset ).toBe( 2 );
			expect( img.startOffset ).toBe( 5 );
			expect( bar.startOffset ).toBe( 6 );
			expect( xyz.startOffset ).toBe( 9 );
		} );

		it( 'should throw if not a Node is inserted', () => {
			expectToThrowCKEditorError( () => {
				nodes._insertNodes( 0, [ 'foo' ] );
			}, 'nodelist-insertnodes-not-node', nodes );
		} );

		it( 'should insert large number of nodes (250 000) without throwing an error', () => {
			const numberOfNodes = 250000;
			const largeArray = 'a'.repeat( numberOfNodes ).split( '' ).map( el => new ModelText( el ) );
			const expectedLength = nodes.length + largeArray.length;

			nodes._insertNodes( 0, largeArray );

			expect( nodes.length ).toBe( expectedLength );
		} );
	} );

	describe( '_removeNodes', () => {
		it( 'should remove and return one or more nodes from given index and refresh index and startOffset values', () => {
			const removedNodes = nodes._removeNodes( 0, 2 );

			expect( removedNodes ).toEqual( [ p, foo ] );
			expect( p.index ).toBeNull();
			expect( foo.index ).toBeNull();
			expect( p.startOffset ).toBeNull();
			expect( foo.startOffset ).toBeNull();

			expect( nodes.length ).toBe( 1 );
			expect( nodes.maxOffset ).toBe( 1 );

			expect( nodes.getNode( 0 ) ).toBe( img );
			expect( nodes.getNodeIndex( img ) ).toBe( 0 );
			expect( nodes.getNodeStartOffset( img ) ).toBe( 0 );

			expect( img.index ).toBe( 0 );
			expect( img.startOffset ).toBe( 0 );
		} );

		it( 'should remove one node if howMany parameter was not specified', () => {
			const removedNodes = nodes._removeNodes( 1 );

			expect( removedNodes ).toEqual( [ foo ] );
			expect( foo.index ).toBeNull();
			expect( foo.startOffset ).toBeNull();

			expect( nodes.length ).toBe( 2 );
			expect( nodes.maxOffset ).toBe( 2 );

			expect( nodes.getNode( 0 ) ).toBe( p );
			expect( nodes.getNode( 1 ) ).toBe( img );

			expect( nodes.getNodeIndex( p ) ).toBe( 0 );
			expect( nodes.getNodeIndex( img ) ).toBe( 1 );
			expect( p.index ).toBe( 0 );
			expect( img.index ).toBe( 1 );

			expect( nodes.getNodeStartOffset( p ) ).toBe( 0 );
			expect( nodes.getNodeStartOffset( img ) ).toBe( 1 );
			expect( p.startOffset ).toBe( 0 );
			expect( img.startOffset ).toBe( 1 );
		} );
	} );

	describe( '_removeNodesArray', () => {
		it( 'should remove nodes from given index and refresh index and startOffset values', () => {
			nodes._removeNodesArray( [ foo ] );

			expect( foo.index ).toBeNull();
			expect( foo.startOffset ).toBeNull();

			expect( nodes.length ).toBe( 2 );
			expect( nodes.maxOffset ).toBe( 2 );

			expect( nodes.getNode( 0 ) ).toBe( p );
			expect( nodes.getNode( 1 ) ).toBe( img );

			expect( nodes.getNodeIndex( p ) ).toBe( 0 );
			expect( nodes.getNodeIndex( img ) ).toBe( 1 );
			expect( p.index ).toBe( 0 );
			expect( img.index ).toBe( 1 );

			expect( nodes.getNodeStartOffset( p ) ).toBe( 0 );
			expect( nodes.getNodeStartOffset( img ) ).toBe( 1 );
			expect( p.startOffset ).toBe( 0 );
			expect( img.startOffset ).toBe( 1 );
		} );

		it( 'should early exit when array is empty', () => {
			nodes._removeNodesArray( [] );

			expect( nodes.length ).toBe( 3 );
			expect( nodes.maxOffset ).toBe( 5 );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should serialize empty node list', () => {
			expect( ( new ModelNodeList() ).toJSON() ).toEqual( [] );
		} );

		it( 'should serialize node list with nodes', () => {
			expect( nodes.toJSON() ).toEqual( [
				{ name: 'p' },
				{ data: 'foo' },
				{ name: 'imageBlock' }
			] );
		} );
	} );
} );
