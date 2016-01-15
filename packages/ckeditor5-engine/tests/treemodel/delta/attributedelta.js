/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import coreTestUtils from '/tests/core/_utils/utils.js';
import Document from '/ckeditor5/core/treemodel/document.js';
import Text from '/ckeditor5/core/treemodel/text.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';
import Range from '/ckeditor5/core/treemodel/range.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Element from '/ckeditor5/core/treemodel/element.js';

const getIteratorCount = coreTestUtils.getIteratorCount;

describe( 'Batch', () => {
	let doc, root, batch;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		batch = doc.batch();
	} );

	function getOperationsCount() {
		let count = 0;

		for ( let delta of batch.deltas ) {
			count += getIteratorCount( delta.operations );
		}

		return count;
	}

	describe( 'change attribute on node', () => {
		let node, text, char;

		beforeEach( () => {
			node = new Element( 'p', [ new Attribute( 'a', 1 ) ] );
			text = new Text( 'c', [ new Attribute( 'a', 1 ) ] );

			root.insertChildren( 0, [ node, text ] );

			char = root.getChild( 1 );
		} );

		describe( 'setAttr', () => {
			it( 'should create the attribute on element', () => {
				batch.setAttr( 'b', 2, node );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( node.attrs.getValue( 'b' ) ).to.equal( 2 );
			} );

			it( 'should change the attribute of element', () => {
				batch.setAttr( 'a', 2, node );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( node.attrs.getValue( 'a' ) ).to.equal( 2 );
			} );

			it( 'should create the attribute on text node', () => {
				batch.setAttr( 'b', 2, char );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( root.getChild( 1 ).attrs.getValue( 'b' ) ).to.equal( 2 );
			} );

			it( 'should change the attribute of text node', () => {
				batch.setAttr( 'a', 2, char );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( root.getChild( 1 ).attrs.getValue( 'a' ) ).to.equal( 2 );
			} );

			it( 'should do nothing if the attribute value is the same', () => {
				batch.setAttr( 'a', 1, node );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( node.attrs.getValue( 'a' ) ).to.equal( 1 );
			} );

			it( 'should be chainable', () => {
				const chain = batch.setAttr( 'b', 2, node );
				expect( chain ).to.equal( batch );
			} );
		} );

		describe( 'removeAttr', () => {
			it( 'should remove the attribute from element', () => {
				batch.removeAttr( 'a', node );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( node.attrs.getValue( 'a' ) ).to.be.null;
			} );

			it( 'should remove the attribute from character', () => {
				batch.removeAttr( 'a', char );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( root.getChild( 1 ).attrs.getValue( 'a' ) ).to.be.null;
			} );

			it( 'should do nothing if the attribute is not set', () => {
				batch.removeAttr( 'b', node );
				expect( getOperationsCount() ).to.equal( 0 );
			} );

			it( 'should be chainable', () => {
				const chain = batch.removeAttr( 'a', node );
				expect( chain ).to.equal( batch );
			} );
		} );
	} );

	describe( 'change attribute on range', () => {
		beforeEach( () => {
			root.insertChildren( 0, [
				new Text( 'xxx', [ new Attribute( 'a', 1 ) ] ),
				'xxx',
				new Text( 'xxx', [ new Attribute( 'a', 1 ) ] ),
				new Text( 'xxx', [ new Attribute( 'a', 2 ) ] ),
				'xxx',
				new Text( 'xxx', [ new Attribute( 'a', 1 ) ] ),
				new Element( 'e', [ new Attribute( 'a', 2 ) ], 'xxx' ),
				'xxx'
			] );
		} );

		function getRange( startIndex, endIndex ) {
			return new Range(
				Position.createFromParentAndOffset( root, startIndex ),
				Position.createFromParentAndOffset( root, endIndex )
			);
		}

		function getChangesAttrsCount() {
			let count = 0;

			for ( let delta of batch.deltas ) {
				for ( let operation of delta.operations ) {
					count += getIteratorCount( operation.range.getAllNodes() );
				}
			}

			return count;
		}

		function getCompressedAttrs() {
			// default: 111---111222---1112------
			const range = Range.createFromElement( root );

			return Array.from( range.getAllNodes() ).map( node => node.attrs.getValue( 'a' ) || '-' ).join( '' );
		}

		describe( 'setAttr', () => {
			it( 'should set the attribute on the range', () => {
				batch.setAttr( 'a', 3, getRange( 3, 6 ) );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 3 );
				expect( getCompressedAttrs() ).to.equal( '111333111222---1112------' );
			} );

			it( 'should split the operations if parts of the range have different attributes', () => {
				batch.setAttr( 'a', 3, getRange( 4, 14 ) );
				expect( getOperationsCount() ).to.equal( 4 );
				expect( getChangesAttrsCount() ).to.equal( 10 );
				expect( getCompressedAttrs() ).to.equal( '111-3333333333-1112------' );
			} );

			it( 'should split the operations if parts of the part of the range have the attribute', () => {
				batch.setAttr( 'a', 2, getRange( 4, 14 ) );
				expect( getOperationsCount() ).to.equal( 3 );
				expect( getChangesAttrsCount() ).to.equal( 7 );
				expect( getCompressedAttrs() ).to.equal( '111-2222222222-1112------' );
			} );

			it( 'should strip the range if the beginning have the attribute', () => {
				batch.setAttr( 'a', 1, getRange( 1, 5 ) );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 2 );
				expect( getCompressedAttrs() ).to.equal( '11111-111222---1112------' );
			} );

			it( 'should strip the range if the ending have the attribute', () => {
				batch.setAttr( 'a', 1, getRange( 13, 17 ) );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 2 );
				expect( getCompressedAttrs() ).to.equal( '111---111222-111112------' );
			} );

			it( 'should do nothing if the range has attribute', () => {
				batch.setAttr( 'a', 1, getRange( 0, 3 ) );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
			} );

			it( 'should not check range\'s start position node when creating operations', () => {
				let range = new Range(
					new Position( root, [ 18, 1 ] ),
					new Position( root, [ 19 ] )
				);

				batch.setAttr( 'a', 1, range );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 2 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112-11---' );
			} );

			it( 'should not change elements attribute if range contains closing tag', () => {
				let range = new Range(
					new Position( root, [ 18, 1 ] ),
					new Position( root, [ 21 ] )
				);

				batch.setAttr( 'a', 1, range );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 4 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112-1111-' );
			} );

			it( 'should not create an operation if the range contains only closing tag', () => {
				let range = new Range(
					new Position( root, [ 18, 3 ] ),
					new Position( root, [ 19 ] )
				);

				batch.setAttr( 'a', 3, range );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
			} );

			it( 'should not create an operation if is collapsed', () => {
				batch.setAttr( 'a', 1, getRange( 3, 3 ) );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
			} );

			it( 'should create a proper operations for the mixed range', () => {
				batch.setAttr( 'a', 1, getRange( 0, 20 ) );
				expect( getOperationsCount() ).to.equal( 5 );
				expect( getChangesAttrsCount() ).to.equal( 14 );
				expect( getCompressedAttrs() ).to.equal( '11111111111111111111111--' );
			} );

			it( 'should be chainable', () => {
				const chain = batch.setAttr( 'a', 3, getRange( 3, 6 ) );
				expect( chain ).to.equal( batch );
			} );
		} );

		describe( 'removeAttr', () => {
			it( 'should remove the attribute on the range', () => {
				batch.removeAttr( 'a', getRange( 0, 2 ) );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 2 );
				expect( getCompressedAttrs() ).to.equal( '--1---111222---1112------' );
			} );

			it( 'should split the operations if parts of the range have different attributes', () => {
				batch.removeAttr( 'a', getRange( 7, 11 ) );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 4 );
				expect( getCompressedAttrs() ).to.equal( '111---1----2---1112------' );
			} );

			it( 'should split the operations if parts of the part of the range have no attribute', () => {
				batch.removeAttr( 'a', getRange( 1, 7 ) );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 3 );
				expect( getCompressedAttrs() ).to.equal( '1------11222---1112------' );
			} );

			it( 'should strip the range if the beginning have no attribute', () => {
				batch.removeAttr( 'a', getRange( 4, 12 ) );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 6 );
				expect( getCompressedAttrs() ).to.equal( '111------------1112------' );
			} );

			it( 'should strip the range if the ending have no attribute', () => {
				batch.removeAttr( 'a', getRange( 7, 15 ) );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 5 );
				expect( getCompressedAttrs() ).to.equal( '111---1--------1112------' );
			} );

			it( 'should do nothing if the range has no attribute', () => {
				batch.removeAttr( 'a', getRange( 4, 5 ) );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
			} );

			it( 'should not check range\'s start position node when creating operations', () => {
				let range = new Range(
					new Position( root, [ 18, 3 ] ),
					new Position( root, [ 19 ] )
				);

				batch.removeAttr( 'a', range );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getChangesAttrsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
			} );

			it( 'should not apply operation twice in the range contains opening and closing tags', () => {
				batch.removeAttr( 'a', getRange( 18, 22 ) );
				expect( getOperationsCount() ).to.equal( 1 );
				expect( getChangesAttrsCount() ).to.equal( 1 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---111-------' );
			} );

			it( 'should not create an operation if range is collapsed', () => {
				batch.removeAttr( 'a', getRange( 3, 3 ) );
				expect( getOperationsCount() ).to.equal( 0 );
				expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
			} );

			it( 'should create a proper operations for the mixed range', () => {
				batch.removeAttr( 'a', getRange( 3, 15 ) );
				expect( getOperationsCount() ).to.equal( 2 );
				expect( getChangesAttrsCount() ).to.equal( 6 );
				expect( getCompressedAttrs() ).to.equal( '111------------1112------' );
			} );

			it( 'should be chainable', () => {
				const chain = batch.removeAttr( 'a', getRange( 0, 2 ) );
				expect( chain ).to.equal( batch );
			} );
		} );
	} );
} );
