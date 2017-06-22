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

import MoveOperation from '../../../../src/model/operation/moveoperation';

import MergeDelta from '../../../../src/model/delta/mergedelta';
import UnwrapDelta from '../../../../src/model/delta/unwrapdelta';

import { getNodesAndText } from '../../../../tests/model/_utils/utils';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
	getSplitDelta,
	getUnwrapDelta
} from '../../../../tests/model/delta/transform/_utils/utils';

describe( 'transform', () => {
	let doc, root, gy, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot();
		gy = doc.graveyard;
		baseVersion = doc.version;
	} );

	describe( 'UnwrapDelta by', () => {
		let unwrapDelta;

		beforeEach( () => {
			unwrapDelta = getUnwrapDelta( new Position( root, [ 3, 3, 3 ] ), 12, baseVersion );
		} );

		describe( 'SplitDelta', () => {
			it( 'split position directly in unwrapped node', () => {
				const splitPosition = new Position( root, [ 3, 3, 3, 3 ] );
				const splitDelta = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );

				const transformed = transform( unwrapDelta, splitDelta );

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
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 4 ] ),
							howMany: 1,
							targetPosition: new Position( gy, [ 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				expectDelta( transformed[ 1 ], {
					type: UnwrapDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 3, 0 ] ),
							howMany: 12,
							targetPosition: new Position( root, [ 3, 3, 3 ] ),
							baseVersion: baseVersion + 2
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 3, 15 ] ),
							howMany: 1,
							targetPosition: new Position( gy, [ 0 ] ),
							baseVersion: baseVersion + 3
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( splitDelta, doc );
				applyDelta( transformed[ 0 ], doc );
				applyDelta( transformed[ 1 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 1 ) );

				// UnwrapDelta is applied. SplitDelta is discarded.
				expect( nodesAndText ).to.equal( 'DIVXXXXXabcdXabcfoobarxyzDIV' );
			} );

			it( 'split position before unwrapped node', () => {
				const splitPosition = new Position( root, [ 3, 3, 3 ] );
				const splitDelta = getSplitDelta( splitPosition, new Element( 'div' ), 1, baseVersion );

				const transformed = transform( unwrapDelta, splitDelta );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = splitDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: UnwrapDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 4, 0, 0 ] ),
							howMany: 12,
							targetPosition: new Position( root, [ 3, 4, 0 ] ),
							baseVersion
						},
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 4, 12 ] ),
							howMany: 1,
							targetPosition: new Position( gy, [ 0 ] ),
							baseVersion: baseVersion + 1
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( splitDelta, doc );
				applyDelta( transformed[ 0 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 2 ) );

				// UnwrapDelta and SplitDelta are applied.
				expect( nodesAndText ).to.equal( 'DIVXXXXXabcdXDIVDIVabcfoobarxyzDIV' );
			} );
		} );
	} );
} );
