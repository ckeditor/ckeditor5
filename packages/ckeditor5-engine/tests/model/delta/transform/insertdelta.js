/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import transformations from '../../../../src/model/delta/basic-transformations'; // eslint-disable-line no-unused-vars

import deltaTransform from '../../../../src/model/delta/transform';
const transform = deltaTransform.transform;

import Element from '../../../../src/model/element';
import Position from '../../../../src/model/position';
import Range from '../../../../src/model/range';

import InsertDelta from '../../../../src/model/delta/insertdelta';
import SplitDelta from '../../../../src/model/delta/splitdelta';

import InsertOperation from '../../../../src/model/operation/insertoperation';
import MoveOperation from '../../../../src/model/operation/moveoperation';
import ReinsertOperation from '../../../../src/model/operation/reinsertoperation';

import { getNodesAndText } from '../../../../tests/model/_utils/utils';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
	getInsertDelta,
	getMergeDelta
} from '../../../../tests/model/delta/transform/_utils/utils';

describe( 'transform', () => {
	let doc, root, gy, baseVersion, context;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot();
		gy = doc.graveyard;
		baseVersion = doc.version;
		context = {
			isStrong: false
		};
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
				const insertPositionB = new Position( root, [ 3, 1 ] );
				const insertDeltaB = getInsertDelta( insertPositionB, [ new Element( 'c' ), new Element( 'd' ) ], baseVersion );

				const transformed = transform( insertDelta, insertDeltaB, context );

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
				const mergeDelta = getMergeDelta( insertPosition, 4, 12, baseVersion );
				const transformed = transform( insertDelta, mergeDelta, context );

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
							baseVersion
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

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 6 ) );

				// Merge between X with "abcd" and P with "abcfoobarxyz" should be reversed and AB should be inserted between X and P.
				expect( nodesAndText ).to.equal( 'XXXXXabcdXAABBPabcfoobarxyzP' );
			} );

			it( 'merge in same position as insert - undo mode', () => {
				// In undo mode, default transformation algorithm should be used.
				const mergeDelta = getMergeDelta( insertPosition, 4, 12, baseVersion );

				context.bWasUndone = true;
				const transformed = transform( insertDelta, mergeDelta, context );

				baseVersion = mergeDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: InsertDelta,
					operations: [
						{
							type: InsertOperation,
							position: Position.createFromPosition( insertPosition ),
							nodes: [ nodeA, nodeB ],
							baseVersion
						}
					]
				} );
			} );

			it( 'merge the node that is parent of insert position (sticky move test)', () => {
				const mergeDelta = getMergeDelta( new Position( root, [ 3, 3 ] ), 1, 4, baseVersion );
				const transformed = transform( insertDelta, mergeDelta, context );

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
							baseVersion
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( mergeDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 2, 0 ] ), 7 ) );

				// Merge between X with "a" and DIV should be applied. AB should be inserted in new, correct position.
				expect( nodesAndText ).to.equal( 'aXXXXXabcdXAABBPabcfoobarxyzP' );
			} );

			it( 'merge at affected position but resolved by default OT', () => {
				const mergeDelta = getMergeDelta( new Position( root, [ 3 ] ), 1, 4, baseVersion );
				const transformed = transform( insertDelta, mergeDelta, context );

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
							baseVersion
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( mergeDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 2, 0 ] ), 5 ) );

				// Merge between X with "a" and DIV should be applied. AB should be inserted in new, correct position.
				expect( nodesAndText ).to.equal( 'aXXXXXaXDIVXXXXXabcdXAABBPabcfoobarxyzPDIV' );
			} );
		} );
	} );
} );
