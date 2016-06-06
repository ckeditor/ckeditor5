/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, operation */

'use strict';

import transformations from '/ckeditor5/engine/model/delta/basic-transformations.js';
/*jshint unused: false*/

import transform from '/ckeditor5/engine/model/delta/transform.js';

import Element from '/ckeditor5/engine/model/element.js';
import Position from '/ckeditor5/engine/model/position.js';
import Range from '/ckeditor5/engine/model/range.js';

import Delta from '/ckeditor5/engine/model/delta/delta.js';
import SplitDelta from '/ckeditor5/engine/model/delta/splitdelta.js';

import InsertOperation from '/ckeditor5/engine/model/operation/insertoperation.js';
import ReinsertOperation from '/ckeditor5/engine/model/operation/reinsertoperation.js';
import MoveOperation from '/ckeditor5/engine/model/operation/moveoperation.js';
import NoOperation from '/ckeditor5/engine/model/operation/nooperation.js';

import { getNodesAndText, jsonParseStringify } from '/tests/engine/model/_utils/utils.js';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
	getSplitDelta,
	getWrapDelta,
	getUnwrapDelta
} from '/tests/engine/model/delta/transform/_utils/utils.js';

describe( 'transform', () => {
	let doc, root, gy, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot( 'root' );
		gy = doc.graveyard;
		baseVersion = doc.version;
	} );

	describe( 'SplitDelta by', () => {
		let splitDelta, splitPosition;

		beforeEach( () => {
			splitPosition = new Position( root, [ 3, 3, 3, 3 ] );
			splitDelta = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );
		} );

		describe( 'SplitDelta', () => {
			it( 'split in same parent and offset', () => {
				let splitDeltaB = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );
				let transformed = transform( splitDelta, splitDeltaB );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: Delta,
					operations: [
						{
							type: NoOperation,
							baseVersion: baseVersion
						}
					]
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
				let transformed = transform( splitDelta, splitDeltaB );

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

			it( 'split in same parent, incoming delta splits closer, split deltas have reinsert operations', () => {
				let reOp = new ReinsertOperation(
					new Position( gy, [ 1 ] ),
					1,
					Position.createFromPosition( splitDelta.operations[ 0 ].position ),
					splitDelta.operations[ 0 ].baseVersion
				);
				splitDelta.operations[ 0 ] = reOp;

				let splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3, 5 ] ), new Element( 'p' ), 7, baseVersion );
				reOp = new ReinsertOperation(
					new Position( gy, [ 0 ] ),
					1,
					Position.createFromPosition( splitDeltaB.operations[ 0 ].position ),
					splitDeltaB.operations[ 0 ].baseVersion
				);
				splitDeltaB.operations[ 0 ] = reOp;

				let transformed = transform( splitDelta, splitDeltaB );

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
			} );

			it( 'split in same parent, incoming delta splits further', () => {
				let splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3, 1 ] ), new Element( 'p' ), 11, baseVersion );
				let transformed = transform( splitDelta, splitDeltaB );

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

			it( 'split in same parent, incoming delta splits further, split deltas have reinsert operations', () => {
				let reOp = new ReinsertOperation(
					new Position( gy, [ 1 ] ),
					1,
					Position.createFromPosition( splitDelta.operations[ 0 ].position ),
					splitDelta.operations[ 0 ].baseVersion
				);
				splitDelta.operations[ 0 ] = reOp;

				let splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3, 1 ] ), new Element( 'p' ), 11, baseVersion );
				reOp = new ReinsertOperation(
					new Position( gy, [ 0 ] ),
					1,
					Position.createFromPosition( splitDeltaB.operations[ 0 ].position ),
					splitDeltaB.operations[ 0 ].baseVersion
				);
				splitDeltaB.operations[ 0 ] = reOp;

				let transformed = transform( splitDelta, splitDeltaB );

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
			} );

			it( 'split in split parent', () => {
				let splitDeltaB = getSplitDelta( new Position( root, [ 3, 3, 3 ] ), new Element( 'div' ), 1, baseVersion );
				let transformed = transform( splitDelta, splitDeltaB );

				baseVersion = splitDeltaB.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 4, 1 ] ),
							baseVersion: baseVersion
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

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 2 ) );

				// DIV and P elements are correctly split.
				expect( nodesAndText ).to.equal( 'DIVXXXXXabcdXDIVDIVPabcPPfoobarxyzPDIV' );
			} );
		} );

		describe( 'UnwrapDelta', () => {
			it( 'split position directly in unwrapped node', () => {
				let unwrapDelta = getUnwrapDelta( new Position( root, [ 3, 3, 3 ] ), 12, baseVersion );
				let transformed = transform( splitDelta, unwrapDelta );

				baseVersion = unwrapDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: Delta,
					operations: [
						{
							type: NoOperation,
							baseVersion: baseVersion
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( unwrapDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 1 ) );

				// UnwrapDelta is applied. SplitDelta is discarded.
				expect( nodesAndText ).to.equal( 'DIVXXXXXabcdXabcfoobarxyzDIV' );
			} );

			it( 'split position indirectly in unwrapped node', () => {
				let unwrapDelta = getUnwrapDelta( new Position( root, [ 3, 3 ] ), 4, baseVersion );

				let transformed = transform( splitDelta, unwrapDelta );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = unwrapDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 7 ] ),
							baseVersion: baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 6, 3 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 7, 0 ] ),
							baseVersion:  baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( unwrapDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3 ] ), 1 ) );

				// UnwrapDelta and SplitDelta are correctly applied.
				expect( nodesAndText ).to.equal( 'DIVXXXXXaXXXXXXabcdXPabcPPfoobarxyzPDIV' );
			} );
		} );

		describe( 'WrapDelta', () => {
			it( 'split position is between wrapped nodes', () => {
				let wrapRange = new Range( new Position( root, [ 3, 3, 3, 1 ] ), new Position( root, [ 3, 3, 3, 5 ] ) );
				let wrapElement = new Element( 'E' );
				let wrapDelta = getWrapDelta( wrapRange, wrapElement, baseVersion );

				let transformed = transform( splitDelta, wrapDelta );

				baseVersion = wrapDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: Delta,
					operations: [
						{
							type: NoOperation,
							baseVersion: baseVersion
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( wrapDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 3 ] ), 1 ) );

				// WrapDelta is applied. SplitDelta is discarded.
				expect( nodesAndText ).to.equal( 'PaEbcfoEobarxyzP' );
			} );

			it( 'split position is before wrapped nodes', () => {
				let wrapRange = new Range( new Position( root, [ 3, 3, 3, 5 ] ), new Position( root, [ 3, 3, 3, 7 ] ) );
				let wrapElement = new Element( 'E' );
				let wrapDelta = getWrapDelta( wrapRange, wrapElement, baseVersion );

				let transformed = transform( splitDelta, wrapDelta );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = wrapDelta.operations.length;

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
							howMany: 8,
							targetPosition: new Position( root, [ 3, 3, 4, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( wrapDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 3 ] ), 2 ) );

				// WrapDelta and SplitDelta are correctly applied.
				expect( nodesAndText ).to.equal( 'PabcPPfoEobEarxyzP' );
			} );

			it( 'split position is inside wrapped node', () => {
				let wrapRange = new Range( new Position( root, [ 3, 3, 2 ] ), new Position( root, [ 3, 3, 4 ] ) );
				let wrapElement = new Element( 'E' );
				let wrapDelta = getWrapDelta( wrapRange, wrapElement, baseVersion );

				let transformed = transform( splitDelta, wrapDelta );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = wrapDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 2, 2 ] ),
							baseVersion: baseVersion
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

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 2 ] ), 1 ) );

				// WrapDelta and SplitDelta are correctly applied.
				expect( nodesAndText ).to.equal( 'EXabcdXPabcPPfoobarxyzPE' );
			} );
		} );
	} );
} );
