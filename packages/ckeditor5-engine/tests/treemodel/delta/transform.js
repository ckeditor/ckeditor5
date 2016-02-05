/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */

'use strict';

import transform from '/ckeditor5/core/treemodel/delta/transform.js';

import Document from '/ckeditor5/core/treemodel/document.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Range from '/ckeditor5/core/treemodel/range.js';

import Delta from '/ckeditor5/core/treemodel/delta/delta.js';
import InsertDelta from '/ckeditor5/core/treemodel/delta/insertdelta.js';
import MergeDelta from '/ckeditor5/core/treemodel/delta/mergedelta.js';
import SplitDelta from '/ckeditor5/core/treemodel/delta/splitdelta.js';

import InsertOperation from '/ckeditor5/core/treemodel/operation/insertoperation.js';
import MoveOperation from '/ckeditor5/core/treemodel/operation/moveoperation.js';
import RemoveOperation from '/ckeditor5/core/treemodel/operation/removeoperation.js';
import ReinsertOperation from '/ckeditor5/core/treemodel/operation/reinsertoperation.js';

import treeModelTestUtils from '/tests/core/treemodel/_utils/utils.js';
const getNodesAndText = treeModelTestUtils.getNodesAndText;

function getInsertDelta( position, nodes, version ) {
	let delta = new InsertDelta();
	delta.addOperation( new InsertOperation( position, nodes, version ) );

	return delta;
}

function getMergeDelta( position, howManyInPrev, howManyInNext, version ) {
	let delta = new MergeDelta();

	let sourcePosition = Position.createFromPosition( position );
	sourcePosition.path.push( 0 );

	let targetPosition = Position.createFromPosition( position );
	targetPosition.offset--;
	targetPosition.path.push( howManyInPrev );

	delta.addOperation( new MoveOperation( sourcePosition, howManyInNext, targetPosition, version ) );
	delta.addOperation( new RemoveOperation( position, 1, version + 1 ) );

	return delta;
}

function getSplitDelta( position, nodeCopy, howManyMove, version ) {
	let delta = new SplitDelta();

	let insertPosition = Position.createFromPosition( position );
	insertPosition.path = insertPosition.getParentPath();
	insertPosition.offset++;

	let targetPosition = Position.createFromPosition( insertPosition );
	targetPosition.path.push( 0 );

	delta.addOperation( new InsertOperation( insertPosition, [ nodeCopy ], version ) );
	delta.addOperation( new MoveOperation( position, howManyMove, targetPosition, version + 1 ) );

	return delta;
}

function expectDelta( delta, expected ) {
	expect( delta ).to.be.instanceof( expected.type );
	expect( delta.operations.length ).to.equal( expected.operations.length );

	for ( let i = 0; i < delta.operations.length; i++ ) {
		expectOperation( delta.operations[ i ], expected.operations[ i ] );
	}
}

function expectOperation( op, params ) {
	for ( let i in params ) {
		if ( params.hasOwnProperty( i ) ) {
			if ( i == 'type' ) {
				expect( op ).to.be.instanceof( params[ i ] );
			}
			else if ( i == 'nodes' ) {
				expect( op.nodeList._nodes ).to.deep.equal( params[ i ] );
			} else if ( params[ i ] instanceof Position || params[ i ] instanceof Range ) {
				expect( op[ i ].isEqual( params[ i ] ) ).to.be.true;
			} else {
				expect( op[ i ] ).to.equal( params[ i ] );
			}
		}
	}
}

function applyDelta( delta, document ) {
	for ( let op of delta.operations ) {
		document.applyOperation( op );
	}
}

describe( 'transform', () => {
	let doc, root, gy, baseVersion;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		root.insertChildren( 0, [
			new Element( 'x' ),
			new Element( 'x' ),
			new Element( 'x', [], 'a' ),
			new Element( 'div', [], [
				new Element( 'x' ),
				new Element( 'x' ),
				new Element( 'x', [], 'a' ),
				new Element( 'div', [], [
					new Element( 'x' ),
					new Element( 'x' ),
					new Element( 'x', [], 'abcd' ),
					new Element( 'p', [], 'abcfoobarxyz' )
				] )
			] )
		] );

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
				let insertDelta = getInsertDelta( mergePosition, [ nodeA, nodeB ], baseVersion );
				let transformed = transform( mergeDelta, insertDelta );

				// Expected: MergeDelta gets ignored and is not applied.

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: Delta,
					operations: []
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( insertDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 6 ) );

				// InsertDelta is applied. Merge between X and P is discarded.
				expect( nodesAndText ).to.equal( 'XXXXXabcdXAABBPabcfoobarxyzP' );
			} );

			it( 'insert inside merged node (sticky move test)', () => {
				let insertDelta = getInsertDelta( new Position( root, [ 3, 3, 3, 12 ] ), [ nodeA, nodeB ], baseVersion );
				let transformed = transform( mergeDelta, insertDelta );

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
							baseVersion: baseVersion
						},
						{
							// This is `MoveOperation` instead of `RemoveOperation` because during OT,
							// `RemoveOperation` may get converted to `MoveOperation`. Still, this expectation is
							// correct because `RemoveOperation` is deriving from `MoveOperation`. So we can expect
							// that something that was `RemoveOperation` is a `MoveOperation`.
							type: MoveOperation,
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

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 3 ) );

				// InsertDelta is applied. Merge between X and P is discarded.
				expect( nodesAndText ).to.equal( 'XXXXXabcdabcfoobarxyzAABBX' );
			} );
		} );
	} );

	describe( 'SplitDelta by', () => {
		let splitDeltaA, splitPosition;

		beforeEach( () => {
			splitPosition = new Position( root, [ 3, 3, 3, 3 ] );
			splitDeltaA = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );
		} );

		describe( 'SplitDelta', () => {
			it( 'split in same parent and offset', () => {
				let splitDeltaB = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );
				let transformed = transform( splitDeltaA, splitDeltaB );

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: Delta,
					operations: []
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( splitDeltaB, doc );
				applyDelta( transformed[ 0 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 5 ) );

				// Incoming split delta is discarded. Only one new element is created after applying both split deltas.
				// There are no empty P elements.
				expect( nodesAndText ).to.equal( 'XXXXXabcdXPabcPPfoobarxyzP' );
			} );

			it( 'split in same parent, incoming delta splits closer', () => {
				let splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3, 5 ] ), new Element( 'p' ), 7, baseVersion );
				let transformed = transform( splitDeltaA, splitDeltaB );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 4 ] ),
							baseVersion: baseVersion
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

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 6 ) );

				// P element is correctly split, there are three P elements, letters in P elements are in correct order.
				expect( nodesAndText ).to.equal( 'XXXXXabcdXPabcPPfoPPobarxyzP' );
			} );

			it( 'split in same parent, incoming delta splits further', () => {
				let splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3, 1 ] ), new Element( 'p' ), 11, baseVersion );
				let transformed = transform( splitDeltaA, splitDeltaB );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 5 ] ),
							baseVersion: baseVersion
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

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 6 ) );

				// P element is correctly split, there are three P elements, letters in P elements are in correct order.
				expect( nodesAndText ).to.equal( 'XXXXXabcdXPaPPbcPPfoobarxyzP' );
			} );
		} );
	} );
} );
