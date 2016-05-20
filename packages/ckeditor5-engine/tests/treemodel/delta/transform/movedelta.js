/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */

'use strict';

import transformations from '/ckeditor5/engine/treemodel/delta/basic-transformations.js';
/*jshint unused: false*/

import transform from '/ckeditor5/engine/treemodel/delta/transform.js';

import Position from '/ckeditor5/engine/treemodel/position.js';
import Range from '/ckeditor5/engine/treemodel/range.js';

import MoveDelta from '/ckeditor5/engine/treemodel/delta/movedelta.js';
import SplitDelta from '/ckeditor5/engine/treemodel/delta/splitdelta.js';

import MoveOperation from '/ckeditor5/engine/treemodel/operation/moveoperation.js';

import { getNodesAndText, jsonParseStringify } from '/tests/engine/treemodel/_utils/utils.js';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
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

	describe( 'MoveDelta by', () => {
		let moveDelta;

		beforeEach( () => {
			let sourcePosition = new Position( root, [ 3, 3, 3 ] );
			let howMany = 1;
			let targetPosition = new Position( root, [ 3, 3, 0 ] );

			moveDelta = getMoveDelta( sourcePosition, howMany, targetPosition, baseVersion );
		} );

		describe( 'MergeDelta', () => {
			it( 'node on the right side of merge was moved', () => {
				let mergePosition = new Position( root, [ 3, 3, 3 ] );
				let mergeDelta = getMergeDelta( mergePosition, 4, 12, baseVersion );

				let transformed = transform( moveDelta, mergeDelta );

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

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 1 ) );

				// MoveDelta is applied. MergeDelta is discarded.
				expect( nodesAndText ).to.equal( 'DIVPabcfoobarxyzPXXXXXabcdXDIV' );
			} );

			it( 'move range in merged node', () => {
				let mergePosition = new Position( root, [ 3, 3 ] );
				let mergeDelta = getMergeDelta( mergePosition, 1, 4, baseVersion );

				let transformed = transform( moveDelta, mergeDelta );

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
							baseVersion: baseVersion
						}
					]
				} );
			} );
		} );
	} );
} );
