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
import RemoveDelta from '../../../../src/model/delta/removedelta';
import SplitDelta from '../../../../src/model/delta/splitdelta';

import NoOperation from '../../../../src/model/operation/nooperation';
import MoveOperation from '../../../../src/model/operation/moveoperation';
import RemoveOperation from '../../../../src/model/operation/removeoperation';

import { getNodesAndText } from '../../../../tests/model/_utils/utils';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
	getMergeDelta,
	getRemoveDelta,
	getSplitDelta
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

	describe( 'RemoveDelta by', () => {
		describe( 'MergeDelta', () => {
			it( 'node on the right side of merge was removed', () => {
				// This special case should be handled by MoveDelta x MergeDelta special case.
				const sourcePosition = new Position( root, [ 3, 3, 3 ] );
				const removeDelta = getRemoveDelta( sourcePosition, 1, baseVersion );

				const mergePosition = new Position( root, [ 3, 3, 3 ] );
				const mergeDelta = getMergeDelta( mergePosition, 4, 12, baseVersion );

				const transformed = transform( removeDelta, mergeDelta, context );

				expect( transformed.length ).to.equal( 2 );

				baseVersion = mergeDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: SplitDelta,
					operations: [
						{
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
					type: RemoveDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: removeDelta._moveOperation.sourcePosition,
							howMany: removeDelta._moveOperation.howMany,
							baseVersion: baseVersion + 2
						}
					]
				} );

				// Test if deltas do what they should after applying transformed delta.
				applyDelta( mergeDelta, doc );
				applyDelta( transformed[ 0 ], doc );
				applyDelta( transformed[ 1 ], doc );

				const nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 1 ) );

				// RemoveDelta is applied. MergeDelta is discarded.
				expect( nodesAndText ).to.equal( 'DIVXXXXXabcdXDIV' );
			} );
		} );

		describe( 'SplitDelta', () => {
			it( 'node inside the removed range was a node that has been split', () => {
				const sourcePosition = new Position( root, [ 3, 3, 1 ] );
				const removeDelta = getRemoveDelta( sourcePosition, 3, baseVersion );

				const splitPosition = new Position( root, [ 3, 3, 2, 2 ] );
				const nodeCopy = new Element( 'x' );
				const splitDelta = getSplitDelta( splitPosition, nodeCopy, 2, baseVersion );

				const transformed = transform( removeDelta, splitDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = splitDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: RemoveDelta,
					operations: [
						{
							type: RemoveOperation,
							sourcePosition,
							howMany: 4,
							baseVersion
						}
					]
				} );
			} );

			it( 'removed nodes in split node, after split position, isStrong = false', () => {
				const sourcePosition = new Position( root, [ 3, 3, 2, 4 ] );
				const removeDelta = getRemoveDelta( sourcePosition, 3, baseVersion );

				const splitPosition = new Position( root, [ 3, 3, 2, 2 ] );
				const nodeCopy = new Element( 'x' );
				const splitDelta = getSplitDelta( splitPosition, nodeCopy, 8, baseVersion );

				const transformed = transform( removeDelta, splitDelta, {
					isStrong: false,
					forceWeakRemove: true
				} );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = splitDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: Delta,
					operations: [
						{
							type: NoOperation,
							baseVersion
						}
					]
				} );
			} );

			it( 'last node in the removed range was a node that has been split', () => {
				const sourcePosition = new Position( root, [ 3, 2 ] );
				const removeDelta = getRemoveDelta( sourcePosition, 2, baseVersion );

				const splitPosition = new Position( root, [ 3, 3, 2 ] );
				const nodeCopy = new Element( 'div' );
				const splitDelta = getSplitDelta( splitPosition, nodeCopy, 2, baseVersion );

				const transformed = transform( removeDelta, splitDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = splitDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: RemoveDelta,
					operations: [
						{
							type: RemoveOperation,
							sourcePosition,
							howMany: 3,
							baseVersion
						}
					]
				} );
			} );

			it( 'removed node has been split - undo context', () => {
				const sourcePosition = new Position( root, [ 3, 3, 1 ] );
				const removeDelta = getRemoveDelta( sourcePosition, 1, baseVersion );

				const splitPosition = new Position( root, [ 3, 3, 1, 2 ] );
				const nodeCopy = new Element( 'x' );
				const splitDelta = getSplitDelta( splitPosition, nodeCopy, 2, baseVersion );

				context.bWasUndone = true;

				const transformed = transform( removeDelta, splitDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = splitDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: RemoveDelta,
					operations: [
						{
							type: RemoveOperation,
							sourcePosition,
							howMany: 1,
							baseVersion
						}
					]
				} );
			} );

			it( 'should not throw if clone operation is NoOperation and use default transformation in that case', () => {
				const noOpSplitDelta = new SplitDelta();
				noOpSplitDelta.addOperation( new NoOperation( 0 ) );
				noOpSplitDelta.addOperation( new MoveOperation( new Position( root, [ 1, 2 ] ), 3, new Position( root, [ 2, 0 ] ), 1 ) );

				const removeDelta = getRemoveDelta( new Position( root, [ 3 ] ), 1, 0 );

				const transformed = transform( removeDelta, noOpSplitDelta, context );

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: RemoveDelta,
					operations: [
						{
							type: RemoveOperation,
							sourcePosition: new Position( root, [ 3 ] ),
							howMany: 1,
							baseVersion: 2
						}
					]
				} );
			} );
		} );
	} );
} );
