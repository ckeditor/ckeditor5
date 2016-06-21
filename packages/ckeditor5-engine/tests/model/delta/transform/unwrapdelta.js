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

import MoveOperation from '/ckeditor5/engine/model/operation/moveoperation.js';

import MergeDelta from '/ckeditor5/engine/model/delta/mergedelta.js';
import UnwrapDelta from '/ckeditor5/engine/model/delta/unwrapdelta.js';

import { getNodesAndText, jsonParseStringify } from '/tests/engine/model/_utils/utils.js';

import {
	applyDelta,
	expectDelta,
	getFilledDocument,
	getSplitDelta,
	getUnwrapDelta
} from '/tests/engine/model/delta/transform/_utils/utils.js';

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
				let splitPosition = new Position( root, [ 3, 3, 3, 3 ] );
				let splitDelta = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );

				let transformed = transform( unwrapDelta, splitDelta );

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
							// `RemoveOperation` as `MoveOperation`
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

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 1 ) );

				// UnwrapDelta is applied. SplitDelta is discarded.
				expect( nodesAndText ).to.equal( 'DIVXXXXXabcdXabcfoobarxyzDIV' );
			} );

			it( 'split position before unwrapped node', () => {
				let splitPosition = new Position( root, [ 3, 3, 3 ] );
				let splitDelta = getSplitDelta( splitPosition, new Element( 'div' ), 1, baseVersion );

				let transformed = transform( unwrapDelta, splitDelta );

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
							baseVersion: baseVersion
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

				let nodesAndText = getNodesAndText( Range.createFromPositionAndShift( new Position( root, [ 3, 3 ] ), 2 ) );

				// UnwrapDelta and SplitDelta are applied.
				expect( nodesAndText ).to.equal( 'DIVXXXXXabcdXDIVDIVabcfoobarxyzDIV' );
			} );
		} );
	} );
} );
