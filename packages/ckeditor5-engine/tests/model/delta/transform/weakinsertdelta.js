/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import transformations from '../../../../src/model/delta/basic-transformations'; // eslint-disable-line no-unused-vars

import deltaTransform from '../../../../src/model/delta/transform';
const transform = deltaTransform.transform;

import Text from '../../../../src/model/text';
import Position from '../../../../src/model/position';
import Range from '../../../../src/model/range';

import WeakInsertDelta from '../../../../src/model/delta/weakinsertdelta';
import AttributeDelta from '../../../../src/model/delta/attributedelta';

import InsertOperation from '../../../../src/model/operation/insertoperation';
import AttributeOperation from '../../../../src/model/operation/attributeoperation';

import {
	expectDelta,
	getFilledDocument,
	getAttributeDelta,
	getWeakInsertDelta
} from '../../../../tests/model/delta/transform/_utils/utils';

describe( 'transform', () => {
	let doc, root, baseVersion, context;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot();
		baseVersion = doc.version;
		context = { isStrong: false };
	} );

	describe( 'AttributeDelta by', () => {
		let insertDelta;

		beforeEach( () => {
			const insertPosition = new Position( root, [ 3, 3, 0 ] );
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
				const attrRange = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 3, 3, 9 ] ) );
				const attrDelta = getAttributeDelta( attrRange, 'key', 'old', 'new', baseVersion );

				const transformed = transform( insertDelta, attrDelta, context );

				expect( transformed.length ).to.equal( 2 );

				baseVersion = attrDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: WeakInsertDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 0 ] ),
							baseVersion
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
							oldValue: null,
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
							oldValue: null,
							newValue: 'new',
							baseVersion: baseVersion + 3
						}
					]
				} );
			} );

			it( 'should be normally transformed if weak insert is not in the attribute range', () => {
				const attrRange = new Range( new Position( root, [ 5 ] ), new Position( root, [ 7 ] ) );
				const attrDelta = getAttributeDelta( attrRange, 'key', 'old', 'new', baseVersion );

				const transformed = transform( insertDelta, attrDelta, context );

				expect( transformed.length ).to.equal( 1 );

				baseVersion = attrDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: WeakInsertDelta,
					operations: [
						{
							type: InsertOperation,
							position: new Position( root, [ 3, 3, 0 ] ),
							baseVersion
						}
					]
				} );
			} );
		} );
	} );
} );
