/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */

'use strict';

import transform from '/ckeditor5/core/treemodel/delta/transform/transform.js';

import Text from '/ckeditor5/core/treemodel/text.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Range from '/ckeditor5/core/treemodel/range.js';

import AttributeDelta from '/ckeditor5/core/treemodel/delta/attributedelta.js';
import AttributeOperation from '/ckeditor5/core/treemodel/operation/attributeoperation.js';

import {
	expectDelta,
	getFilledDocument,
	getAttributeDelta,
	getWeakInsertDelta,
} from '/tests/core/treemodel/delta/transform/_utils/utils.js';

describe( 'transform', () => {
	let doc, root, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot( 'root' );
		baseVersion = doc.version;
	} );

	describe( 'AttributeDelta by', () => {
		let attrDelta;

		beforeEach( () => {
			let attrRange = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 3, 3, 9 ] ) );
			attrDelta = getAttributeDelta( attrRange, 'key', 'old', 'new', baseVersion );
		} );

		describe( 'WeakInsertDelta', () => {
			it( 'weak insert inside attribute range should "fix" splitting the range', () => {
				let insertPosition = new Position( root, [ 3, 3, 0 ] );
				let insertDelta = getWeakInsertDelta(
					insertPosition,
					[
						'a',
						new Text( 'b', { key: 'new' } ),
						new Text( 'c', { key: 'different' } ),
						'de'
					],
					baseVersion
				);

				let transformed = transform( attrDelta, insertDelta );

				expect( transformed.length ).to.equal( 2 );

				baseVersion = insertDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: AttributeDelta,
					operations: [
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 3, 5 ] ), new Position( root, [ 3, 3, 8, 9 ] ) ),
							key: 'key',
							oldValue: 'old',
							newValue: 'new',
							baseVersion: baseVersion
						},
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 3, 0 ] ) ),
							key: 'key',
							oldValue: 'old',
							newValue: 'new',
							baseVersion: baseVersion + 1
						}
					]
				} );

				expectDelta( transformed[ 1 ], {
					type: AttributeDelta,
					operations: [
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 3, 0 ] ), new Position( root, [ 3, 3, 1 ] ) ),
							key: 'key',
							oldValue: undefined,
							newValue: 'new',
							baseVersion: baseVersion + 2
						},
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 3, 2 ] ), new Position( root, [ 3, 3, 3 ] ) ),
							key: 'key',
							oldValue: 'different',
							newValue: 'new',
							baseVersion: baseVersion + 3
						},
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 3, 3 ] ), new Position( root, [ 3, 3, 5 ] ) ),
							key: 'key',
							oldValue: undefined,
							newValue: 'new',
							baseVersion: baseVersion + 4
						}
					]
				} );
			} );

			it( 'should be normally transformed if weak insert is not in the attribute range', () => {
				let insertPosition = new Position( root, [ 5 ] );
				let insertDelta = getWeakInsertDelta( insertPosition, 'abc', baseVersion );

				let transformed = transform( attrDelta, insertDelta );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = insertDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: AttributeDelta,
					operations: [
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 3, 3, 9 ] ) ),
							key: 'key',
							oldValue: 'old',
							newValue: 'new',
							baseVersion: baseVersion
						}
					]
				} );
			} );
		} );
	} );
} );
