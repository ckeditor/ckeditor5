/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */

'use strict';

import transformations from '/ckeditor5/engine/treemodel/delta/basic-transformations.js';
/*jshint unused: false*/

import transform from '/ckeditor5/engine/treemodel/delta/transform.js';

import Element from '/ckeditor5/engine/treemodel/element.js';
import Position from '/ckeditor5/engine/treemodel/position.js';
import Range from '/ckeditor5/engine/treemodel/range.js';

import InsertDelta from '/ckeditor5/engine/treemodel/delta/insertdelta.js';
import SplitDelta from '/ckeditor5/engine/treemodel/delta/splitdelta.js';

import InsertOperation from '/ckeditor5/engine/treemodel/operation/insertoperation.js';
import MoveOperation from '/ckeditor5/engine/treemodel/operation/moveoperation.js';
import ReinsertOperation from '/ckeditor5/engine/treemodel/operation/reinsertoperation.js';

import { getNodesAndText, jsonParseStringify } from '/tests/engine/treemodel/_utils/utils.js';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
	getInsertDelta,
	getMergeDelta
} from '/tests/engine/treemodel/delta/transform/_utils/utils.js';

describe( 'transform', () => {
	let doc, root, gy, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot( 'root' );
		gy = doc.graveyard;
		baseVersion = doc.version;
	} );

	describe( 'InsertDelta by', () => {
		let insertDelta, insertPosition, nodeA, nodeB;

		beforeEach( () => {
			nodeA = new Element( 'a' );
			nodeB = new Element( 'b' );

			insertPosition = new Position( root, [ 3, 3, 3 ] );
			insertDelta = getInsertDelta( insertPosition, [ nodeA, nodeB ], baseVersion );
		} );

		describe( 'InsertDelta', () => {
			it( 'should be resolved in a same way as two insert operations', () => {
				let insertPositionB = new Position( root, [ 3, 1 ] );
				let insertDeltaB = getInsertDelta( insertPositionB, [ new Element( 'c' ), new Element( 'd' ) ], baseVersion );

				let transformed = transform( insertDelta, insertDeltaB );

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: InsertDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 5, 3 ] ),
							nodes: [ nodeA, nodeB ],
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );
		} );

		describe( 'MergeDelta', () => {
			it( 'merge in same position as insert', () => {
				let mergeDelta = getMergeDelta( insertPosition, 4, 12, baseVersion );
				let transformed = transform( insertDelta, mergeDelta );

				baseVersion = mergeDelta.operations.length;

				// Expected: MergeOperation gets reversed (by special case of SplitDelta that has ReinsertOperation
				// instead of InsertOperation. Then InsertDelta is applied as is.

				expect( transformed.length ).to.equal( 2 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: ReinsertOperation,
							sourcePosition: new Position( gy, [ 0 ] ),
							howMany: 1,
							targetPosition: new Position( root, [ 3, 3, 3 ] ),
							baseVersion: baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 2, 4 ] ),
							howMany: 12,
							targetPosition: new Position( root, [ 3, 3, 3, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				expectDelta( transformed[ 1 ], {
					type: InsertDelta,
					operations: [
						{
							type: InsertOperation,
							position: Position.createFromPosition( insertPosition ),
							nodes: [ nodeA, nodeB ],
							baseVersion: baseVersion + 2
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( mergeDelta, doc );
				applyDelta( transformed[ 0 ], doc );
				applyDelta( transformed[ 1 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 6 ) );

				// Merge between X with "abcd" and P with "abcfoobarxyz" should be reversed and AB should be inserted between X and P.
				expect( nodesAndText ).to.equal( 'XXXXXabcdXAABBPabcfoobarxyzP' );
			} );

			it( 'merge the node that is parent of insert position (sticky move test)', () => {
				let mergeDelta = getMergeDelta( new Position( root, [ 3, 3 ] ), 1, 4, baseVersion );
				let transformed = transform( insertDelta, mergeDelta );

				baseVersion = mergeDelta.operations.length;

				// Expected: InsertOperation in InsertDelta has it's path updated.

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: InsertDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 2, 4 ] ),
							nodes: [ nodeA, nodeB ],
							baseVersion: baseVersion
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( mergeDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 2, 0 ] ), 7 ) );

				// Merge between X with "a" and DIV should be applied. AB should be inserted in new, correct position.
				expect( nodesAndText ).to.equal( 'aXXXXXabcdXAABBPabcfoobarxyzP' );
			} );

			it( 'merge at affected position but resolved by default OT', () => {
				let mergeDelta = getMergeDelta( new Position( root, [ 3 ] ), 1, 4, baseVersion );
				let transformed = transform( insertDelta, mergeDelta );

				baseVersion = mergeDelta.operations.length;

				// Expected: InsertOperation in InsertDelta has it's path updated.

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: InsertDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 2, 4, 3 ] ),
							nodes: [ nodeA, nodeB ],
							baseVersion: baseVersion
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( mergeDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 2, 0 ] ), 5 ) );

				// Merge between X with "a" and DIV should be applied. AB should be inserted in new, correct position.
				expect( nodesAndText ).to.equal( 'aXXXXXaXDIVXXXXXabcdXAABBPabcfoobarxyzPDIV' );
			} );
		} );
	} );
} );
