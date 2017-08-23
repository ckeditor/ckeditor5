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

import Delta from '../../../../src/model/delta/delta';
import MergeDelta from '../../../../src/model/delta/mergedelta';

import MoveOperation from '../../../../src/model/operation/moveoperation';
import RemoveOperation from '../../../../src/model/operation/removeoperation';
import NoOperation from '../../../../src/model/operation/nooperation';

import { getNodesAndText } from '../../../../tests/model/_utils/utils';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
	getInsertDelta,
	getMergeDelta,
	getMoveDelta
} from '../../../../tests/model/delta/transform/_utils/utils';

describe( 'transform', () => {
	let doc, root, gy, baseVersion, context;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot();
		gy = doc.graveyard;
		baseVersion = doc.version;
		context = { isStrong: false };
	} );

	describe( 'MergeDelta by', () => {
		let mergeDelta, mergePosition;

		beforeEach( () => {
			mergePosition = new Position( root, [ 3, 3, 3 ] );
			mergeDelta = getMergeDelta( mergePosition, 4, 12, baseVersion );
		} );

		describe( 'InsertDelta', () => {
			let nodeA, nodeB;

			beforeEach( () => {
				nodeA = new Element( 'a' );
				nodeB = new Element( 'b' );
			} );

			it( 'insert at same position as merge', () => {
				const insertDelta = getInsertDelta( mergePosition, [ nodeA, nodeB ], baseVersion );
				const transformed = transform( mergeDelta, insertDelta, context );

				// Expected: MergeDelta gets ignored and is not applied.

				baseVersion = insertDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: Delta,
					operations: [
						{
							type: NoOperation,
							baseVersion
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( insertDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 6 ) );

				// InsertDelta is applied. Merge between X and P is discarded.
				expect( nodesAndText ).to.equal( 'XXXXXabcdXAABBPabcfoobarxyzP' );
			} );

			it( 'insert at same position as merge - undo mode', () => {
				// In undo mode, default transformation algorithm should be used.
				const insertDelta = getInsertDelta( mergePosition, [ nodeA, nodeB ], baseVersion );

				context.bWasUndone = true;
				const transformed = transform( mergeDelta, insertDelta, context );

				baseVersion = insertDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: MergeDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 5, 0 ] ),
							howMany: mergeDelta.operations[ 0 ].howMany,
							targetPosition: mergeDelta.operations[ 0 ].targetPosition,
							baseVersion
						},
						{
							type: RemoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 5 ] ),
							howMany: 1,
							targetPosition: mergeDelta.operations[ 1 ].targetPosition,
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );

			it( 'insert inside merged node (sticky move test)', () => {
				const insertDelta = getInsertDelta( new Position( root, [ 3, 3, 3, 12 ] ), [ nodeA, nodeB ], baseVersion );
				const transformed = transform( mergeDelta, insertDelta, context );

				baseVersion = insertDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				// Expected: MoveOperation in MergeDelta has it's "range" expanded.

				expectDelta( transformed[ 0 ], {
					type: MergeDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 0 ] ),
							howMany: 14,
							targetPosition: new Position( root, [ 3, 3, 2, 4 ] ),
							baseVersion
						},
						{
							type: RemoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3 ] ),
							howMany: 1,
							targetPosition: new Position( gy, [ 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( insertDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 3 ) );

				// InsertDelta is applied. Merge between X and P is discarded.
				expect( nodesAndText ).to.equal( 'XXXXXabcdabcfoobarxyzAABBX' );
			} );
		} );

		describe( 'MoveDelta', () => {
			it( 'node on the right side of merge was moved', () => {
				const moveDelta = getMoveDelta( new Position( root, [ 3, 3, 3 ] ), 1, new Position( root, [ 3, 3, 0 ] ), baseVersion );
				const transformed = transform( mergeDelta, moveDelta, context );

				baseVersion = moveDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: Delta,
					operations: [
						{
							type: NoOperation,
							baseVersion
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( moveDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 1 ) );

				// MoveDelta is applied. MergeDelta is discarded.
				expect( nodesAndText ).to.equal( 'DIVPabcfoobarxyzPXXXXXabcdXDIV' );
			} );

			it( 'node on the left side of merge was moved', () => {
				const moveDelta = getMoveDelta( new Position( root, [ 3, 3, 2 ] ), 1, new Position( root, [ 3, 3, 0 ] ), baseVersion );
				const transformed = transform( mergeDelta, moveDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = moveDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: MergeDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 0 ] ),
							howMany: 12,
							targetPosition: new Position( root, [ 3, 3, 0, 4 ] ),
							baseVersion
						},
						{
							type: RemoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3 ] ),
							howMany: 1,
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( moveDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 1 ) );

				// MoveDelta is applied. MergeDelta is discarded.
				expect( nodesAndText ).to.equal( 'DIVXabcdabcfoobarxyzXXXXXDIV' );
			} );
		} );

		describe( 'MergeDelta', () => {
			it( 'merge two consecutive elements, transformed merge is after', () => {
				const mergeDeltaB = getMergeDelta( new Position( root, [ 3, 3, 2 ] ), 0, 4, baseVersion );
				const transformed = transform( mergeDelta, mergeDeltaB, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = mergeDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: MergeDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 2, 0 ] ),
							howMany: 12,
							targetPosition: new Position( root, [ 3, 3, 1, 4 ] ),
							baseVersion
						},
						{
							type: RemoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 2 ] ),
							howMany: 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( mergeDeltaB, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 2 ) );

				// Both merge deltas are applied and merged nodes children are together in one node.
				expect( nodesAndText ).to.equal( 'XXXabcdabcfoobarxyzX' );
			} );

			it( 'merge two consecutive elements, transformed merge is before', () => {
				mergeDelta = getMergeDelta( new Position( root, [ 3, 3, 2 ] ), 0, 4, baseVersion );
				const mergeDeltaB = getMergeDelta( new Position( root, [ 3, 3, 3 ] ), 4, 12, baseVersion );

				const transformed = transform( mergeDelta, mergeDeltaB, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = mergeDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: MergeDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 2, 0 ] ),
							howMany: 16,
							targetPosition: new Position( root, [ 3, 3, 1, 0 ] ),
							baseVersion
						},
						{
							type: RemoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 2 ] ),
							howMany: 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( mergeDeltaB, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 2 ) );

				// Both merge deltas are applied and merged nodes children are together in one node.
				expect( nodesAndText ).to.equal( 'XXXabcdabcfoobarxyzX' );
			} );
		} );
	} );
} );
