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

import Delta from '/ckeditor5/engine/treemodel/delta/delta.js';
import MergeDelta from '/ckeditor5/engine/treemodel/delta/mergedelta.js';

import MoveOperation from '/ckeditor5/engine/treemodel/operation/moveoperation.js';
import RemoveOperation from '/ckeditor5/engine/treemodel/operation/removeoperation.js';

import { getNodesAndText, jsonParseStringify } from '/tests/engine/treemodel/_utils/utils.js';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
	getInsertDelta,
	getMergeDelta,
	getMoveDelta
} from '/tests/engine/treemodel/delta/transform/_utils/utils.js';

describe( 'transform', () => {
	let doc, root, gy, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot( 'root' );
		gy = doc.graveyard;
		baseVersion = doc.version;
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

		describe( 'MoveDelta', () => {
			it( 'node on the right side of merge was moved', () => {
				let moveDelta = getMoveDelta( new Position( root, [ 3, 3, 3 ] ), 1, new Position( root, [ 3, 3, 0 ] ), baseVersion );
				let transformed = transform( mergeDelta, moveDelta );

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: Delta,
					operations: []
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( moveDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 1 ) );

				// MoveDelta is applied. MergeDelta is discarded.
				expect( nodesAndText ).to.equal( 'DIVPabcfoobarxyzPXXXXXabcdXDIV' );
			} );

			it( 'node on the left side of merge was moved', () => {
				let moveDelta = getMoveDelta( new Position( root, [ 3, 3, 2 ] ), 1, new Position( root, [ 3, 3, 0 ] ), baseVersion );
				let transformed = transform( mergeDelta, moveDelta );

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
							baseVersion: baseVersion
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

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 1 ) );

				// MoveDelta is applied. MergeDelta is discarded.
				expect( nodesAndText ).to.equal( 'DIVXabcdabcfoobarxyzXXXXXDIV' );
			} );
		} );

		describe( 'MergeDelta', () => {
			it( 'merge two consecutive elements, transformed merge is after', () => {
				let mergeDeltaB = getMergeDelta( new Position( root, [ 3, 3, 2 ] ), 0, 4, baseVersion );
				let transformed = transform( mergeDelta, mergeDeltaB );

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
							baseVersion: baseVersion
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

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 2 ) );

				// Both merge deltas are applied and merged nodes children are together in one node.
				expect( nodesAndText ).to.equal( 'XXXabcdabcfoobarxyzX' );
			} );

			it( 'merge two consecutive elements, transformed merge is before', () => {
				mergeDelta = getMergeDelta( new Position( root, [ 3, 3, 2 ] ), 0, 4, baseVersion );
				let mergeDeltaB = getMergeDelta( new Position( root, [ 3, 3, 3 ] ), 4, 12, baseVersion );

				let transformed = transform( mergeDelta, mergeDeltaB );

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
							baseVersion: baseVersion
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

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 0 ] ), 2 ) );

				// Both merge deltas are applied and merged nodes children are together in one node.
				expect( nodesAndText ).to.equal( 'XXXabcdabcfoobarxyzX' );
			} );
		} );
	} );
} );
