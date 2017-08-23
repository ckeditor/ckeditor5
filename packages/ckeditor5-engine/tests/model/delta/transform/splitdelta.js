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
import SplitDelta from '../../../../src/model/delta/splitdelta';
import AttributeDelta from '../../../../src/model/delta/attributedelta';
import RenameDelta from '../../../../src/model/delta/renamedelta';

import InsertOperation from '../../../../src/model/operation/insertoperation';
import AttributeOperation from '../../../../src/model/operation/attributeoperation';
import ReinsertOperation from '../../../../src/model/operation/reinsertoperation';
import MoveOperation from '../../../../src/model/operation/moveoperation';
import NoOperation from '../../../../src/model/operation/nooperation';
import RenameOperation from '../../../../src/model/operation/renameoperation';

import { getNodesAndText } from '../../../../tests/model/_utils/utils';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
	getSplitDelta,
	getWrapDelta,
	getUnwrapDelta,
	getRemoveDelta
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

	describe( 'SplitDelta by', () => {
		let splitDelta, splitPosition;

		beforeEach( () => {
			splitPosition = new Position( root, [ 3, 3, 3, 3 ] );
			splitDelta = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );
		} );

		describe( 'SplitDelta', () => {
			it( 'split in same parent and offset - isStrong = false', () => {
				const splitDeltaB = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );
				const transformed = transform( splitDelta, splitDeltaB, context );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 4 ] ),
							baseVersion
						},
						{
							type: NoOperation,
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( splitDeltaB, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 6 ) );

				expect( nodesAndText ).to.equal( 'XXXXXabcdXPabcPPPPfoobarxyzP' );
			} );

			it( 'split in same parent and offset - isStrong = true', () => {
				const splitDeltaB = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );

				context.isStrong = true;
				const transformed = transform( splitDelta, splitDeltaB, context );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 4 ] ),
							baseVersion
						},
						{
							type: NoOperation,
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( splitDeltaB, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 6 ) );

				expect( nodesAndText ).to.equal( 'XXXXXabcdXPabcPPPPfoobarxyzP' );
			} );

			it( 'should not change context.insertBefore if it was set', () => {
				// SplitDelta x SplitDelta transformation case sets `context.insertBefore` on its own if it is not set.
				// It is to achieve better transformation results from UX point of view.
				// However, if `context.insertBefore` was already set, it should not be changed. This might be important for undo.
				const splitDeltaB = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );
				const transformed = transform( splitDelta, splitDeltaB, {
					isStrong: false,
					insertBefore: true,
					bWasUndone: true // If `insertBefore` was set it means that delta `b` had to be undone.
				} );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							// If `context.insertBefore` would not be set, the offset would be 4. See an example above.
							position: new Position( root, [ 3, 3, 5 ] ),
							baseVersion
						},
						{
							type: NoOperation,
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );

			it( 'split in same parent, incoming delta splits closer', () => {
				const splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3, 5 ] ), new Element( 'p' ), 7, baseVersion );
				const transformed = transform( splitDelta, splitDeltaB, context );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 4 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 3 ] ),
							howMany: 2,
							targetPosition: new Position( root, [ 3, 3, 4, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( splitDeltaB, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 6 ) );

				// P element is correctly split, there are three P elements, letters in P elements are in correct order.
				expect( nodesAndText ).to.equal( 'XXXXXabcdXPabcPPfoPPobarxyzP' );
			} );

			it( 'split in same parent, incoming delta splits closer, split deltas have reinsert operations', () => {
				let reOp = new ReinsertOperation(
					new Position( gy, [ 1 ] ),
					1,
					Position.createFromPosition( splitDelta.operations[ 0 ].position ),
					splitDelta.operations[ 0 ].baseVersion
				);
				splitDelta.operations[ 0 ] = reOp;

				const splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3, 5 ] ), new Element( 'p' ), 7, baseVersion );
				reOp = new ReinsertOperation(
					new Position( gy, [ 0 ] ),
					1,
					Position.createFromPosition( splitDeltaB.operations[ 0 ].position ),
					splitDeltaB.operations[ 0 ].baseVersion
				);
				splitDeltaB.operations[ 0 ] = reOp;

				const transformed = transform( splitDelta, splitDeltaB, context );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: ReinsertOperation,
							sourcePosition: new Position( gy, [ 0 ] ),
							howMany: 1,
							targetPosition: new Position( root, [ 3, 3, 4 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 3 ] ),
							howMany: 2,
							targetPosition: new Position( root, [ 3, 3, 4, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );

			it( 'split in same parent, incoming delta splits further', () => {
				const splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3, 1 ] ), new Element( 'p' ), 11, baseVersion );
				const transformed = transform( splitDelta, splitDeltaB, context );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 5 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 4, 2 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 3, 5, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( splitDeltaB, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 6 ) );

				// P element is correctly split, there are three P elements, letters in P elements are in correct order.
				expect( nodesAndText ).to.equal( 'XXXXXabcdXPaPPbcPPfoobarxyzP' );
			} );

			it( 'split in same parent, incoming delta splits further, split deltas have reinsert operations', () => {
				let reOp = new ReinsertOperation(
					new Position( gy, [ 1 ] ),
					1,
					Position.createFromPosition( splitDelta.operations[ 0 ].position ),
					splitDelta.operations[ 0 ].baseVersion
				);
				splitDelta.operations[ 0 ] = reOp;

				const splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3, 1 ] ), new Element( 'p' ), 11, baseVersion );
				reOp = new ReinsertOperation(
					new Position( gy, [ 0 ] ),
					1,
					Position.createFromPosition( splitDeltaB.operations[ 0 ].position ),
					splitDeltaB.operations[ 0 ].baseVersion
				);
				splitDeltaB.operations[ 0 ] = reOp;

				const transformed = transform( splitDelta, splitDeltaB, context );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: ReinsertOperation,
							sourcePosition: new Position( gy, [ 0 ] ),
							howMany: 1,
							targetPosition: new Position( root, [ 3, 3, 5 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 4, 2 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 3, 5, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );

			it( 'split in split parent', () => {
				const splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3 ] ), new Element( 'div' ), 1, baseVersion );
				const transformed = transform( splitDelta, splitDeltaB, context );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 4, 1 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 4, 0, 3 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 4, 1, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( splitDeltaB, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 2 ) );

				// DIV and P elements are correctly split.
				expect( nodesAndText ).to.equal( 'DIVXXXXXabcdXDIVDIVPabcPPfoobarxyzPDIV' );
			} );

			it( 'should use default algorithm and not throw if transformed split delta has NoOperation', () => {
				splitDelta.operations[ 1 ] = new NoOperation( 1 );
				const splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3, 1 ] ), new Element( 'p' ), 11, baseVersion );

				const transformed = transform( splitDelta, splitDeltaB, context );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 5 ] ),
							baseVersion
						},
						{
							type: NoOperation,
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );

			it( 'should use default algorithm and not throw if split delta to transform by has NoOperation', () => {
				const splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3, 1 ] ), new Element( 'p' ), 11, baseVersion );
				splitDeltaB.operations[ 1 ] = new NoOperation( 1 );

				const transformed = transform( splitDelta, splitDeltaB, context );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 5 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 3 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 3, 5, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );
		} );

		describe( 'UnwrapDelta', () => {
			it( 'split position directly in unwrapped node', () => {
				const unwrapDelta = getUnwrapDelta( new Position( root, [ 3, 3, 3 ] ), 12, baseVersion );
				const transformed = transform( splitDelta, unwrapDelta, context );

				baseVersion = unwrapDelta.operations.length;

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
				applyDelta( unwrapDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 1 ) );

				// UnwrapDelta is applied. SplitDelta is discarded.
				expect( nodesAndText ).to.equal( 'DIVXXXXXabcdXabcfoobarxyzDIV' );
			} );

			it( 'split position indirectly in unwrapped node', () => {
				const unwrapDelta = getUnwrapDelta( new Position( root, [ 3, 3 ] ), 4, baseVersion );

				const transformed = transform( splitDelta, unwrapDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = unwrapDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 7 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 6, 3 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 7, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( unwrapDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3 ] ), 1 ) );

				// UnwrapDelta and SplitDelta are correctly applied.
				expect( nodesAndText ).to.equal( 'DIVXXXXXaXXXXXXabcdXPabcPPfoobarxyzPDIV' );
			} );

			it( 'should use default algorithm and not throw if split delta has NoOperation', () => {
				splitDelta.operations[ 1 ] = new NoOperation( 1 );

				const unwrapDelta = getUnwrapDelta( new Position( root, [ 3, 3 ] ), 4, baseVersion );

				const transformed = transform( splitDelta, unwrapDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = unwrapDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 7 ] ),
							baseVersion
						},
						{
							type: NoOperation,
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );
		} );

		describe( 'WrapDelta', () => {
			it( 'split position is between wrapped nodes', () => {
				const wrapRange = new Range( new Position( root, [ 3, 3, 3, 1 ] ), new Position( root, [ 3, 3, 3, 5 ] ) );
				const wrapElement = new Element( 'E' );
				const wrapDelta = getWrapDelta( wrapRange, wrapElement, baseVersion );

				const transformed = transform( splitDelta, wrapDelta, context );

				baseVersion = wrapDelta.operations.length;

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
				applyDelta( wrapDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 3 ] ), 1 ) );

				// WrapDelta is applied. SplitDelta is discarded.
				expect( nodesAndText ).to.equal( 'PaEbcfoEobarxyzP' );
			} );

			it( 'split position is before wrapped nodes', () => {
				const wrapRange = new Range( new Position( root, [ 3, 3, 3, 5 ] ), new Position( root, [ 3, 3, 3, 7 ] ) );
				const wrapElement = new Element( 'E' );
				const wrapDelta = getWrapDelta( wrapRange, wrapElement, baseVersion );

				const transformed = transform( splitDelta, wrapDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = wrapDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 4 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 3 ] ),
							howMany: 8,
							targetPosition: new Position( root, [ 3, 3, 4, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( wrapDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 3 ] ), 2 ) );

				// WrapDelta and SplitDelta are correctly applied.
				expect( nodesAndText ).to.equal( 'PabcPPfoEobEarxyzP' );
			} );

			it( 'split position is inside wrapped node', () => {
				const wrapRange = new Range( new Position( root, [ 3, 3, 2 ] ), new Position( root, [ 3, 3, 4 ] ) );
				const wrapElement = new Element( 'E' );
				const wrapDelta = getWrapDelta( wrapRange, wrapElement, baseVersion );

				const transformed = transform( splitDelta, wrapDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = wrapDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 2, 2 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 2, 1, 3 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 3, 2, 2, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( wrapDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 2 ] ), 1 ) );

				// WrapDelta and SplitDelta are correctly applied.
				expect( nodesAndText ).to.equal( 'EXabcdXPabcPPfoobarxyzPE' );
			} );

			it( 'should use default algorithm and not throw if split delta has NoOperation', () => {
				splitDelta.operations[ 1 ] = new NoOperation( 1 );

				const wrapRange = new Range( new Position( root, [ 3, 3, 2 ] ), new Position( root, [ 3, 3, 4 ] ) );
				const wrapElement = new Element( 'E' );
				const wrapDelta = getWrapDelta( wrapRange, wrapElement, baseVersion );

				const transformed = transform( splitDelta, wrapDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = wrapDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 3 ] ),
							baseVersion
						},
						{
							type: NoOperation,
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );
		} );

		describe( 'AttributeDelta', () => {
			it( 'attribute changed on split element', () => {
				const attributeDelta = new AttributeDelta();

				attributeDelta.addOperation( new AttributeOperation(
					Range.createFromParentsAndOffsets( root, 0, root, 2 ), 'key', 'oldValue', 'newValue', baseVersion
				) );

				attributeDelta.addOperation( new AttributeOperation(
					Range.createFromPositionAndShift( new Position( root, [ 3, 3, 2 ] ), 3 ), 'key', null, 'newValue', baseVersion + 1
				) );

				const transformed = transform( splitDelta, attributeDelta, context );

				baseVersion = attributeDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 4 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 3 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 3, 4, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				expect( transformed[ 0 ].operations[ 0 ].nodes.getNode( 0 ).getAttribute( 'key' ) ).to.equal( 'newValue' );
			} );

			it( 'attribute removed from split element', () => {
				splitDelta.operations[ 0 ].nodes.getNode( 0 ).setAttribute( 'key', 'oldValue' );
				const attributeDelta = new AttributeDelta();

				attributeDelta.addOperation( new AttributeOperation(
					Range.createFromParentsAndOffsets( root, 0, root, 2 ), 'key', 'otherValue', null, baseVersion
				) );

				attributeDelta.addOperation( new AttributeOperation(
					Range.createFromPositionAndShift( new Position( root, [ 3, 3, 2 ] ), 3 ), 'key', 'oldValue', null, baseVersion + 1
				) );

				const transformed = transform( splitDelta, attributeDelta, context );

				baseVersion = attributeDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 4 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 3 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 3, 4, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				expect( transformed[ 0 ].operations[ 0 ].nodes.getNode( 0 ).hasAttribute( 'key' ) ).to.be.false;
			} );

			it( 'attribute changed on split element that is reinserted from graveyard', () => {
				splitDelta.operations[ 0 ] = new ReinsertOperation(
					new Position( gy, [ 1 ] ),
					1,
					new Position( root, [ 3, 3, 4 ] ),
					baseVersion
				);

				const attributeDelta = new AttributeDelta();

				attributeDelta.addOperation( new AttributeOperation(
					Range.createFromParentsAndOffsets( root, 0, root, 4 ), 'key', 'oldValue', 'newValue', baseVersion
				) );

				const transformed = transform( splitDelta, attributeDelta, context );

				baseVersion = attributeDelta.operations.length;
				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: ReinsertOperation,
							sourcePosition: new Position( gy, [ 1 ] ),
							howMany: 1,
							targetPosition: new Position( root, [ 3, 3, 4 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 3 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 3, 4, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );

			it( 'should use default algorithm and not throw if split delta has NoOperation', () => {
				splitDelta.operations[ 1 ] = new NoOperation( 1 );

				const attributeDelta = new AttributeDelta();
				attributeDelta.addOperation( new AttributeOperation(
					Range.createFromParentsAndOffsets( root, 0, root, 4 ), 'key', 'oldValue', 'newValue', baseVersion
				) );

				const transformed = transform( splitDelta, attributeDelta, context );

				baseVersion = attributeDelta.operations.length;
				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 4 ] ),
							baseVersion
						},
						{
							type: NoOperation,
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );
		} );

		describe( 'RenameDelta', () => {
			it( 'renamed split element', () => {
				const renameDelta = new RenameDelta();
				renameDelta.addOperation( new RenameOperation(
					new Position( root, [ 3, 3, 3 ] ), 'h2', 'li', baseVersion
				) );

				const transformed = transform( splitDelta, renameDelta, context );

				baseVersion = renameDelta.operations.length;

				expect( transformed.length ).to.equal( 2 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 4 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 3 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 3, 4, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				expectDelta( transformed[ 1 ], {
					type: RenameDelta,
					operations: [
						{
							type: RenameOperation,
							position: new Position( root, [ 3, 3, 4 ] ),
							oldName: 'p', // `oldName` taken from SplitDelta.
							newName: 'li',
							baseVersion: baseVersion + 2
						}
					]
				} );
			} );

			it( 'split element is different than renamed element', () => {
				const renameDelta = new RenameDelta();
				renameDelta.addOperation( new RenameOperation(
					new Position( root, [ 4 ] ), 'p', 'li', baseVersion
				) );

				const transformed = transform( splitDelta, renameDelta, context );

				baseVersion = renameDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 4 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 3 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 3, 4, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );

			it( 'renamed split element that is reinserted from graveyard', () => {
				splitDelta.operations[ 0 ] = new ReinsertOperation(
					new Position( gy, [ 1 ] ),
					1,
					new Position( root, [ 3, 3, 4 ] ),
					baseVersion
				);

				const renameDelta = new RenameDelta();
				renameDelta.addOperation( new RenameOperation(
					new Position( root, [ 3, 3, 3 ] ), 'p', 'li', baseVersion
				) );

				context.aWasUndone = true;
				const transformed = transform( splitDelta, renameDelta, context );

				baseVersion = renameDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: ReinsertOperation,
							sourcePosition: new Position( gy, [ 1 ] ),
							howMany: 1,
							targetPosition: new Position( root, [ 3, 3, 4 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 3 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 3, 4, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );

			it( 'should not throw if clone operation is NoOperation and use default transformation in that case', () => {
				const noOpSplitDelta = new SplitDelta();
				noOpSplitDelta.addOperation( new NoOperation( 0 ) );
				noOpSplitDelta.addOperation( new MoveOperation( new Position( root, [ 1, 2 ] ), 3, new Position( root, [ 2, 0 ] ), 1 ) );

				const renameDelta = new RenameDelta();
				renameDelta.addOperation( new RenameOperation(
					new Position( root, [ 1 ] ),
					'p',
					'li',
					baseVersion
				) );

				const transformed = transform( noOpSplitDelta, renameDelta, context );

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: NoOperation,
							baseVersion: 1
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 1, 2 ] ),
							howMany: 3,
							targetPosition: new Position( root, [ 2, 0 ] ),
							baseVersion: 2
						}
					]
				} );
			} );
		} );

		describe( 'RemoveDelta', () => {
			it( 'node inside the removed range was a node that has been split', () => {
				splitPosition = new Position( root, [ 3, 3, 2, 2 ] );
				splitDelta = getSplitDelta( splitPosition, new Element( 'x' ), 2, baseVersion );

				const removePosition = new Position( root, [ 3, 3, 1 ] );
				const removeDelta = getRemoveDelta( removePosition, 3, baseVersion );
				const removeOperation = removeDelta.operations[ 0 ];

				const transformed = transform( splitDelta, removeDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = removeDelta.operations.length;

				const newInsertPosition = removeOperation.targetPosition.getShiftedBy( 2 );
				const newMoveSourcePosition = removeOperation.targetPosition.getShiftedBy( 1 );
				newMoveSourcePosition.path.push( 2 );
				const newMoveTargetPosition = Position.createAt( newInsertPosition );
				newMoveTargetPosition.path.push( 0 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: newInsertPosition,
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: newMoveSourcePosition,
							howMany: 2,
							targetPosition: newMoveTargetPosition,
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );

			it( 'last node in the removed range was a node that has been split', () => {
				const removePosition = new Position( root, [ 3, 3, 2 ] );
				const removeDelta = getRemoveDelta( removePosition, 2, baseVersion );
				const removeOperation = removeDelta.operations[ 0 ];

				const transformed = transform( splitDelta, removeDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = removeDelta.operations.length;

				const newInsertPosition = removeOperation.targetPosition.getShiftedBy( 2 );
				const newMoveSourcePosition = removeOperation.targetPosition.getShiftedBy( 1 );
				newMoveSourcePosition.path.push( 3 );
				const newMoveTargetPosition = Position.createAt( newInsertPosition );
				newMoveTargetPosition.path.push( 0 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: newInsertPosition,
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: newMoveSourcePosition,
							howMany: 9,
							targetPosition: newMoveTargetPosition,
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );

			it( 'split node has been removed - undo context', () => {
				const removePosition = new Position( root, [ 3, 3, 3 ] );
				const removeDelta = getRemoveDelta( removePosition, 1, baseVersion );

				context.bWasUndone = true;

				const transformed = transform( splitDelta, removeDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = removeDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: splitDelta.operations[ 0 ].position.getShiftedBy( -1 ),
							baseVersion
						},
						{
							type: ReinsertOperation,
							sourcePosition: new Position( gy, [ 0, 3 ] ),
							howMany: splitDelta.operations[ 1 ].howMany,
							targetPosition: new Position( root, [ 3, 3, 3, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );

			it( 'should not throw if clone operation is NoOperation and use default transformation in that case', () => {
				const noOpSplitDelta = new SplitDelta();
				noOpSplitDelta.addOperation( new NoOperation( 0 ) );
				noOpSplitDelta.addOperation( new MoveOperation( new Position( root, [ 1, 2 ] ), 3, new Position( root, [ 2, 0 ] ), 1 ) );

				const removeDelta = getRemoveDelta( new Position( root, [ 0 ] ), 1, 0 );

				const transformed = transform( noOpSplitDelta, removeDelta, context );

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: NoOperation,
							baseVersion: 1
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 0, 2 ] ),
							howMany: 3,
							targetPosition: new Position( root, [ 1, 0 ] ),
							baseVersion: 2
						}
					]
				} );
			} );
		} );
	} );
} );
