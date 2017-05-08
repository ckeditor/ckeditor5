/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import transformations from '../../../../src/model/delta/basic-transformations';
/*jshint unused: false*/

import deltaTransform from '../../../../src/model/delta/transform';
const transform = deltaTransform.transform;

import Element from '../../../../src/model/element';
import Position from '../../../../src/model/position';
import Range from '../../../../src/model/range';

import MoveOperation from '../../../../src/model/operation/moveoperation';
import InsertOperation from '../../../../src/model/operation/insertoperation';

import MergeDelta from '../../../../src/model/delta/mergedelta';
import WrapDelta from '../../../../src/model/delta/wrapdelta';

import { getNodesAndText, jsonParseStringify } from '../../../../tests/model/_utils/utils';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
	getSplitDelta,
	getWrapDelta
} from '../../../../tests/model/delta/transform/_utils/utils';

describe( 'transform', () => {
	let doc, root, gy, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot();
		gy = doc.graveyard;
		baseVersion = doc.version;
	} );

	describe( 'WrapDelta by', () => {
		let wrapDelta;

		beforeEach( () => {
			let wrapRange = new Range( new Position( root, [ 3, 3, 3, 1 ] ), new Position( root, [ 3, 3, 3, 5 ] ) );
			let wrapElement = new Element( 'E' );

			wrapDelta = getWrapDelta( wrapRange, wrapElement, baseVersion );
		} );

		describe( 'SplitDelta', () => {
			it( 'split position is between wrapped nodes', () => {
				let splitPosition = new Position( root, [ 3, 3, 3, 3 ] );
				let splitDelta = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );

				let transformed = transform( wrapDelta, splitDelta );

				expect( transformed.length ).to.equal( 2 );

				baseVersion = splitDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: MergeDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 4, 0 ] ),
							howMany: 9,
							targetPosition: new Position( root, [ 3, 3, 3, 3 ] ),
							baseVersion: baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 4 ] ),
							howMany: 1,
							targetPosition: new Position( gy, [ 0, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				expectDelta( transformed[ 1 ], {
					type: WrapDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 3, 5 ] ),
							baseVersion: baseVersion + 2
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 1 ] ),
							howMany: 4,
							targetPosition: new Position( root, [ 3, 3, 3, 5, 0 ] ),
							baseVersion: baseVersion + 3
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( splitDelta, doc );
				applyDelta( transformed[ 0 ], doc );
				applyDelta( transformed[ 1 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 3 ] ), 1 ) );

				// WrapDelta is applied. SplitDelta is discarded.
				expect( nodesAndText ).to.equal( 'PaEbcfoEobarxyzP' );
			} );

			it( 'split position is before wrapped nodes', () => {
				let splitPosition = new Position( root, [ 3, 3, 3, 1 ] );
				let splitDelta = getSplitDelta( splitPosition, new Element( 'p' ), 11, baseVersion );

				let transformed = transform( wrapDelta, splitDelta );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = wrapDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: WrapDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 4, 4 ] ),
							baseVersion: baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 4, 0 ] ),
							howMany: 4,
							targetPosition: new Position( root, [ 3, 3, 4, 4, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( splitDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 3 ] ), 2 ) );

				// WrapDelta and SplitDelta are correctly applied.
				expect( nodesAndText ).to.equal( 'PaPPEbcfoEobarxyzP' );
			} );

			it( 'split position is inside wrapped node', () => {
				// For this case, we need different WrapDelta so it is overwritten.
				let wrapRange = new Range( new Position( root, [ 3, 3, 2 ] ), new Position( root, [ 3, 3, 4 ] ) );
				let wrapElement = new Element( 'E' );

				wrapDelta = getWrapDelta( wrapRange, wrapElement, baseVersion );

				let splitPosition = new Position( root, [ 3, 3, 3, 3 ] );
				let splitDelta = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );

				let transformed = transform( wrapDelta, splitDelta );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = wrapDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: WrapDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 5 ] ),
							baseVersion: baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 2 ] ),
							howMany: 3,
							targetPosition: new Position( root, [ 3, 3, 5, 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( splitDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3, 2 ] ), 1 ) );

				// WrapDelta and SplitDelta are correctly applied.
				expect( nodesAndText ).to.equal( 'EXabcdXPabcPPfoobarxyzPE' );
			} );
		} );
	} );
} );
