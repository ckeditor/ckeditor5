/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import transformations from '../../../../src/model/delta/basic-transformations'; // eslint-disable-line no-unused-vars

import deltaTransform from '../../../../src/model/delta/transform';
const transform = deltaTransform.transform;

import Position from '../../../../src/model/position';
import Range from '../../../../src/model/range';

import MoveDelta from '../../../../src/model/delta/movedelta';
import SplitDelta from '../../../../src/model/delta/splitdelta';

import MoveOperation from '../../../../src/model/operation/moveoperation';

import { getNodesAndText } from '../../../../tests/model/_utils/utils';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
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

	describe( 'MoveDelta by', () => {
		let moveDelta;

		beforeEach( () => {
			const sourcePosition = new Position( root, [ 3, 3, 3 ] );
			const howMany = 1;
			const targetPosition = new Position( root, [ 3, 3, 0 ] );

			moveDelta = getMoveDelta( sourcePosition, howMany, targetPosition, baseVersion );
		} );

		describe( 'MergeDelta', () => {
			it( 'node on the right side of merge was moved', () => {
				const mergePosition = new Position( root, [ 3, 3, 3 ] );
				const mergeDelta = getMergeDelta( mergePosition, 4, 12, baseVersion );

				const transformed = transform( moveDelta, mergeDelta, context );

				expect( transformed.length ).to.equal( 2 );

				baseVersion = mergeDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
							// This `SplitDelta` got created through reversing `MergeDelta`. It means that operations in
							// a `MergeDelta` had been reversed. One of them is `RemoveOperation` which got reversed into
							// `ReinsertOperation` because we want to get back the node from graveyard. `ReinsertOperation`
							// is treated in OT as `MoveOperation` and might be converted to it. This is why we have to
							// check whether the operation type is `MoveOperation`. This is all perfectly valid.
							type: MoveOperation,
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
					type: MoveDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: moveDelta._moveOperation.sourcePosition,
							howMany: moveDelta._moveOperation.howMany,
							targetPosition: moveDelta._moveOperation.targetPosition,
							baseVersion: baseVersion + 2
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.

				applyDelta( mergeDelta, doc );
				applyDelta( transformed[ 0 ], doc );
				applyDelta( transformed[ 1 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 1 ) );

				// MoveDelta is applied. MergeDelta is discarded.
				expect( nodesAndText ).to.equal( 'DIVPabcfoobarxyzPXXXXXabcdXDIV' );
			} );

			it( 'move range in merged node #1', () => {
				const mergePosition = new Position( root, [ 3, 3 ] );
				const mergeDelta = getMergeDelta( mergePosition, 1, 4, baseVersion );

				const transformed = transform( moveDelta, mergeDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = mergeDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: MoveDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 2, 4 ] ),
							howMany: 1,
							targetPosition: new Position( root, [ 3, 2, 1 ] ),
							baseVersion
						}
					]
				} );
			} );

			it( 'move range in merged node #2', () => {
				moveDelta._moveOperation.sourcePosition.path = [ 3, 3, 1 ];
				moveDelta._moveOperation.targetPosition.path = [ 3, 3, 4 ];

				const mergePosition = new Position( root, [ 3, 3 ] );
				const mergeDelta = getMergeDelta( mergePosition, 1, 4, baseVersion );

				const transformed = transform( moveDelta, mergeDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = mergeDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: MoveDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 3, 2, 2 ] ),
							howMany: 1,
							targetPosition: new Position( root, [ 3, 2, 5 ] ),
							baseVersion
						}
					]
				} );
			} );
		} );
	} );
} );
