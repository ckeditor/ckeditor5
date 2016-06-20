/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, operation */

'use strict';

import transformations from '/ckeditor5/engine/model/delta/basic-transformations.js';
/*jshint unused: false*/

import transform from '/ckeditor5/engine/model/delta/transform.js';

import Position from '/ckeditor5/engine/model/position.js';
import Range from '/ckeditor5/engine/model/range.js';

import RemoveDelta from '/ckeditor5/engine/model/delta/movedelta.js';
import SplitDelta from '/ckeditor5/engine/model/delta/splitdelta.js';

import MoveOperation from '/ckeditor5/engine/model/operation/moveoperation.js';

import { getNodesAndText, jsonParseStringify } from '/tests/engine/model/_utils/utils.js';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
	getMergeDelta,
	getRemoveDelta
} from '/tests/engine/model/delta/transform/_utils/utils.js';

describe( 'transform', () => {
	let doc, root, gy, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot();
		gy = doc.graveyard;
		baseVersion = doc.version;
	} );

	describe( 'RemoveDelta by', () => {
		let removeDelta;

		beforeEach( () => {
			let sourcePosition = new Position( root, [ 3, 3, 3 ] );
			let howMany = 1;

			removeDelta = getRemoveDelta( sourcePosition, howMany, baseVersion );
		} );

		describe( 'MergeDelta', () => {
			it( 'node on the right side of merge was removed', () => {
				// This special case should be handled by MoveDelta x MergeDelta special case.

				let mergePosition = new Position( root, [ 3, 3, 3 ] );
				let mergeDelta = getMergeDelta( mergePosition, 4, 12, baseVersion );

				let transformed = transform( removeDelta, mergeDelta );

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

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 1 ) );

				// RemoveDelta is applied. MergeDelta is discarded.
				expect( nodesAndText ).to.equal( 'DIVXXXXXabcdXDIV' );
			} );
		} );
	} );
} );
