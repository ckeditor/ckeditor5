/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, operation */

import transformations from '/ckeditor5/engine/model/delta/basic-transformations.js';
/*jshint unused: false*/

import transform from '/ckeditor5/engine/model/delta/transform.js';

import Text from '/ckeditor5/engine/model/text.js';
import Position from '/ckeditor5/engine/model/position.js';
import Range from '/ckeditor5/engine/model/range.js';

import WeakInsertDelta from '/ckeditor5/engine/model/delta/weakinsertdelta.js';
import AttributeDelta from '/ckeditor5/engine/model/delta/attributedelta.js';

import InsertOperation from '/ckeditor5/engine/model/operation/insertoperation.js';
import AttributeOperation from '/ckeditor5/engine/model/operation/attributeoperation.js';

import {
	expectDelta,
	getFilledDocument,
	getAttributeDelta,
	getWeakInsertDelta
} from '/tests/engine/model/delta/transform/_utils/utils.js';

describe( 'transform', () => {
	let doc, root, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot();
		baseVersion = doc.version;
	} );

	describe( 'AttributeDelta by', () => {
		let insertDelta;

		beforeEach( () => {
			let insertPosition = new Position( root, [ 3, 3, 0 ] );
			insertDelta = getWeakInsertDelta(
				insertPosition,
				[
					'a',
					new Text( 'b', { key: 'new' } ),
					new Text( 'c', { key: 'different' } ),
					new Text( 'c', { key: 'different', key2: true } ),
					'de'
				],
				baseVersion
			);
		} );

		describe( 'WeakInsertDelta', () => {
			it( 'weak insert inside attribute range should "fix" splitting the range', () => {
				let attrRange = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 3, 3, 9 ] ) );
				let attrDelta = getAttributeDelta( attrRange, 'key', 'old', 'new', baseVersion );

				let transformed = transform( insertDelta, attrDelta );

				expect( transformed.length ).to.equal( 2 );

				baseVersion = attrDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: WeakInsertDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 0 ] ),
							baseVersion: baseVersion
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
							baseVersion: baseVersion + 1
						},
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 3, 2 ] ), new Position( root, [ 3, 3, 4 ] ) ),
							key: 'key',
							oldValue: 'different',
							newValue: 'new',
							baseVersion: baseVersion + 2
						},
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 3, 4 ] ), new Position( root, [ 3, 3, 6 ] ) ),
							key: 'key',
							oldValue: undefined,
							newValue: 'new',
							baseVersion: baseVersion + 3
						}
					]
				} );
			} );

			it( 'should be normally transformed if weak insert is not in the attribute range', () => {
				let attrRange = new Range( new Position( root, [ 5 ] ), new Position( root, [ 7 ] ) );
				let attrDelta = getAttributeDelta( attrRange, 'key', 'old', 'new', baseVersion );

				let transformed = transform( insertDelta, attrDelta );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = attrDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: WeakInsertDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 0 ] ),
							baseVersion: baseVersion
						}
					]
				} );
			} );
		} );
	} );
} );
