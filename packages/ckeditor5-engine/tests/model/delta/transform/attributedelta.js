/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import transformations from '../../../../src/model/delta/basic-transformations';
/*jshint unused: false*/

import transform from '../../../../src/model/delta/transform';

import Element from '../../../../src/model/element';
import Text from '../../../../src/model/text';
import Position from '../../../../src/model/position';
import Range from '../../../../src/model/range';

import AttributeDelta from '../../../../src/model/delta/attributedelta';
import AttributeOperation from '../../../../src/model/operation/attributeoperation';

import {
	expectDelta,
	getFilledDocument,
	getAttributeDelta,
	getWeakInsertDelta,
	getSplitDelta
} from '../../../../tests/model/delta/transform/_utils/utils';

describe( 'transform', () => {
	let doc, root, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot();
		baseVersion = doc.version;
	} );

	describe( 'AttributeDelta by', () => {
		describe( 'WeakInsertDelta', () => {
			it( 'weak insert inside attribute range should "fix" splitting the range', () => {
				let attrRange = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 3, 3, 9 ] ) );
				let attrDelta = getAttributeDelta( attrRange, 'key', 'old', 'new', baseVersion );

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
							oldValue: null,
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
							oldValue: null,
							newValue: 'new',
							baseVersion: baseVersion + 4
						}
					]
				} );
			} );

			it( 'should be normally transformed if weak insert is not in the attribute range', () => {
				let attrRange = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 3, 3, 9 ] ) );
				let attrDelta = getAttributeDelta( attrRange, 'key', 'old', 'new', baseVersion );

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

		describe( 'SplitDelta', () => {
			it( 'change attribute of split element', () => {
				let attrRange1 = Range.createFromParentsAndOffsets( root, 0, root, 1 );
				let attrRange2 = new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 4 ] ) );

				let attrDelta = new AttributeDelta();
				attrDelta.addOperation( new AttributeOperation( attrRange1, 'key', 'old', 'new', baseVersion ) );
				attrDelta.addOperation( new AttributeOperation( attrRange2, 'key', 'old', 'new', baseVersion ) );

				let splitPosition = new Position( root, [ 3, 3, 3, 3 ] );
				let splitDelta = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );

				let transformed = transform( attrDelta, splitDelta );

				expect( transformed.length ).to.equal( 2 );

				baseVersion = splitDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: AttributeDelta,
					operations: [
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) ),
							key: 'key',
							oldValue: 'old',
							newValue: 'new',
							baseVersion: baseVersion
						},
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 3, 5 ] ), new Position( root, [ 3, 4 ] ) ),
							key: 'key',
							oldValue: 'old',
							newValue: 'new',
							baseVersion: baseVersion + 1
						},
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 2 ] ), new Position( root, [ 3, 3, 4 ] ) ),
							key: 'key',
							oldValue: 'old',
							newValue: 'new',
							baseVersion: baseVersion + 2
						},
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 3, 4, 0 ] ), new Position( root, [ 3, 3, 4, 9 ] ) ),
							key: 'key',
							oldValue: 'old',
							newValue: 'new',
							baseVersion: baseVersion + 3
						}
					]
				} );

				expectDelta( transformed[ 1 ], {
					type: AttributeDelta,
					operations: [
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 3, 4 ] ), new Position( root, [ 3, 3, 4, 0 ] ) ),
							key: 'key',
							oldValue: null,
							newValue: 'new',
							baseVersion: baseVersion + 4
						}
					]
				} );
			} );

			// A different case.
			it( 'change attribute of split element #2', () => {
				let attrRange = new Range( new Position( root, [ 3, 3, 3 ] ), new Position( root, [ 3, 3, 3, 0 ] ) );
				let attrDelta = new AttributeDelta();
				attrDelta.addOperation( new AttributeOperation( attrRange, 'foo', null, 'bar', baseVersion ) );

				let splitPosition = new Position( root, [ 3, 3, 3, 3 ] );
				let splitDelta = getSplitDelta( splitPosition, new Element( 'p', { foo: 'old' } ), 9, baseVersion );

				let transformed = transform( attrDelta, splitDelta );

				expect( transformed.length ).to.equal( 2 );

				baseVersion = splitDelta.operations.length;

				expectDelta( transformed[ 0 ], {
					type: AttributeDelta,
					operations: [
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 3, 3 ] ), new Position( root, [ 3, 3, 3, 0 ] ) ),
							key: 'foo',
							oldValue: null,
							newValue: 'bar',
							baseVersion: baseVersion
						}
					]
				} );

				expectDelta( transformed[ 1 ], {
					type: AttributeDelta,
					operations: [
						{
							type: AttributeOperation,
							range: new Range( new Position( root, [ 3, 3, 4 ] ), new Position( root, [ 3, 3, 4, 0 ] ) ),
							key: 'foo',
							oldValue: 'old',
							newValue: 'bar',
							baseVersion: baseVersion + 1
						}
					]
				} );
			} );
		} );
	} );
} );
