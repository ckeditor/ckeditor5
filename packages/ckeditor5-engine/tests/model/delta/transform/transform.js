/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import transformations from '../../../../src/model/delta/basic-transformations';
/*jshint unused: false*/

import deltaTransform from '../../../../src/model/delta/transform';
const transformDeltaSets = deltaTransform.transformDeltaSets;

import Document from '../../../../src/model/document';
import Element from '../../../../src/model/element';
import Text from '../../../../src/model/text';
import Position from '../../../../src/model/position';

import Delta from '../../../../src/model/delta/delta';
import InsertDelta from '../../../../src/model/delta/insertdelta';
import RemoveDelta from '../../../../src/model/delta/removedelta';
import SplitDelta from '../../../../src/model/delta/splitdelta';

import NoOperation from '../../../../src/model/operation/nooperation';
import MoveOperation from '../../../../src/model/operation/moveoperation';
import RemoveOperation from '../../../../src/model/operation/removeoperation';
import InsertOperation from '../../../../src/model/operation/insertoperation';

import {
	expectDelta,
	getInsertDelta,
	getSplitDelta,
	getRemoveDelta
} from '../../../../tests/model/delta/transform/_utils/utils';

describe( 'transform', () => {
	let doc, root, gy, baseVersion;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		root.appendChildren( new Element( 'p', null, new Text( 'foobar' ) ) );

		gy = doc.graveyard;
		baseVersion = doc.version;
	} );

	describe( 'transformDeltaSets', () => {
		it( 'should transform two deltas', () => {
			const insertDelta = getInsertDelta( new Position( root, [ 0, 4 ] ), new Text( 'xxx' ), baseVersion );
			const removeDelta = getRemoveDelta( new Position( root, [ 0, 0 ] ), 2, baseVersion );

			const { deltasA, deltasB } = transformDeltaSets( [ insertDelta ], [ removeDelta ] );

			expect( deltasA.length ).to.equal( 1 );
			expect( deltasB.length ).to.equal( 1 );

			expectDelta( deltasA[ 0 ], {
				type: InsertDelta,
				operations: [
					{
						type: InsertOperation,
						position: new Position( root, [ 0, 2 ] ),
						baseVersion: 1
					}
				]
			} );

			expectDelta( deltasB[ 0 ], {
				type: RemoveDelta,
				operations: [
					{
						type: RemoveOperation,
						sourcePosition: new Position( root, [ 0, 0 ] ),
						howMany: 2,
						baseVersion: 1
					}
				]
			} );
		} );

		it( 'should transform two deltas - reverse', () => {
			const insertDelta = getInsertDelta( new Position( root, [ 0, 4 ] ), new Text( 'xxx' ), baseVersion );
			const removeDelta = getRemoveDelta( new Position( root, [ 0, 0 ] ), 2, baseVersion );

			const { deltasA, deltasB } = transformDeltaSets( [ removeDelta ], [ insertDelta ] );

			expect( deltasA.length ).to.equal( 1 );
			expect( deltasB.length ).to.equal( 1 );

			expectDelta( deltasA[ 0 ], {
				type: RemoveDelta,
				operations: [
					{
						type: RemoveOperation,
						sourcePosition: new Position( root, [ 0, 0 ] ),
						howMany: 2,
						baseVersion: 1
					}
				]
			} );

			expectDelta( deltasB[ 0 ], {
				type: InsertDelta,
				operations: [
					{
						type: InsertOperation,
						position: new Position( root, [ 0, 2 ] ),
						baseVersion: 1
					}
				]
			} );
		} );

		it( 'should transform two arrays of deltas', () => {
			const splitDelta = getSplitDelta( new Position( root, [ 0, 3 ] ), new Element( 'p' ), 3, baseVersion );
			const insertDeltaX = getInsertDelta( new Position( root, [ 0, 3 ] ), new Text( 'xxx' ), baseVersion + 2 );

			const removeDelta = getRemoveDelta( new Position( root, [ 0, 2 ] ), 2, baseVersion );
			const insertDeltaY = getInsertDelta( new Position( root, [ 0, 4 ] ), new Text( 'yyy' ), baseVersion + 1 );

			const { deltasA, deltasB } = transformDeltaSets( [ splitDelta, insertDeltaX ], [ removeDelta, insertDeltaY ], true );

			expect( deltasA.length ).to.equal( 3 );
			expect( deltasB.length ).to.equal( 2 );

			expectDelta( deltasA[ 0 ], {
				type: SplitDelta,
				operations: [
					{
						type: InsertOperation,
						position: new Position( root, [ 1 ] ),
						baseVersion: 2
					},
					{
						type: MoveOperation,
						sourcePosition: new Position( root, [ 0, 2 ] ),
						howMany: 5,
						targetPosition: new Position( root, [ 1, 0 ] ),
						baseVersion: 3
					}
				]
			} );

			expectDelta( deltasA[ 1 ], {
				type: InsertDelta,
				operations: [
					{
						type: InsertOperation,
						position: new Position( root, [ 0, 2 ] ),
						baseVersion: 4
					}
				]
			} );

			expectDelta( deltasA[ 2 ], {
				type: Delta,
				operations: [
					{
						type: NoOperation,
						baseVersion: 5
					}
				]
			} );

			expectDelta( deltasB[ 0 ], {
				type: RemoveDelta,
				operations: [
					{
						type: RemoveOperation,
						sourcePosition: new Position( root, [ 1, 0 ] ),
						howMany: 1,
						baseVersion: 3
					},
					{
						type: RemoveOperation,
						sourcePosition: new Position( root, [ 0, 2 ] ),
						howMany: 1,
						baseVersion: 4
					}
				]
			} );

			expectDelta( deltasB[ 1 ], {
				type: InsertDelta,
				operations: [
					{
						type: InsertOperation,
						position: new Position( root, [ 1, 2 ] ),
						baseVersion: 5
					}
				]
			} );
		} );

		it( 'should transform two arrays of deltas - reverse', () => {
			const splitDelta = getSplitDelta( new Position( root, [ 0, 3 ] ), new Element( 'p' ), 3, baseVersion );
			const insertDeltaX = getInsertDelta( new Position( root, [ 0, 3 ] ), new Text( 'xxx' ), baseVersion + 2 );

			const removeDelta = getRemoveDelta( new Position( root, [ 0, 2 ] ), 2, baseVersion );
			const insertDeltaY = getInsertDelta( new Position( root, [ 0, 4 ] ), new Text( 'yyy' ), baseVersion + 1 );

			const { deltasA, deltasB } = transformDeltaSets( [ removeDelta, insertDeltaY ], [ splitDelta, insertDeltaX ], true );

			expect( deltasA.length ).to.equal( 2 );
			expect( deltasB.length ).to.equal( 3 );

			expectDelta( deltasA[ 0 ], {
				type: RemoveDelta,
				operations: [
					{
						type: RemoveOperation,
						sourcePosition: new Position( root, [ 1, 0 ] ),
						howMany: 1,
						baseVersion: 3
					},
					{
						type: RemoveOperation,
						sourcePosition: new Position( root, [ 0, 2 ] ),
						howMany: 1,
						baseVersion: 4
					}
				]
			} );

			expectDelta( deltasA[ 1 ], {
				type: InsertDelta,
				operations: [
					{
						type: InsertOperation,
						position: new Position( root, [ 1, 2 ] ),
						baseVersion: 5
					}
				]
			} );

			expectDelta( deltasB[ 0 ], {
				type: SplitDelta,
				operations: [
					{
						type: InsertOperation,
						position: new Position( root, [ 1 ] ),
						baseVersion: 2
					},
					{
						type: MoveOperation,
						sourcePosition: new Position( root, [ 0, 2 ] ),
						howMany: 5,
						targetPosition: new Position( root, [ 1, 0 ] ),
						baseVersion: 3
					}
				]
			} );

			expectDelta( deltasB[ 1 ], {
				type: InsertDelta,
				operations: [
					{
						type: InsertOperation,
						position: new Position( root, [ 0, 2 ] ),
						baseVersion: 4
					}
				]
			} );

			expectDelta( deltasB[ 2 ], {
				type: Delta,
				operations: [
					{
						type: NoOperation,
						baseVersion: 5
					}
				]
			} );
		} );

		it( 'importance flag - first set is important', () => {
			const insertDeltaA = getInsertDelta( new Position( root, [ 0, 4 ] ), new Text( 'xxx' ), baseVersion );
			const insertDeltaB = getInsertDelta( new Position( root, [ 0, 4 ] ), new Text( 'yyy' ), baseVersion );

			let { deltasA, deltasB } = transformDeltaSets( [ insertDeltaA ], [ insertDeltaB ], true );

			expectDelta( deltasA[ 0 ], {
				type: InsertDelta,
				operations: [
					{
						type: InsertOperation,
						position: new Position( root, [ 0, 4 ] ),
						baseVersion: 1
					}
				]
			} );

			expectDelta( deltasB[ 0 ], {
				type: InsertDelta,
				operations: [
					{
						type: InsertOperation,
						position: new Position( root, [ 0, 7 ] ),
						baseVersion: 1
					}
				]
			} );
		} );

		it( 'importance flag - second set is important', () => {
			const insertDeltaA = getInsertDelta( new Position( root, [ 0, 4 ] ), new Text( 'xxx' ), baseVersion );
			const insertDeltaB = getInsertDelta( new Position( root, [ 0, 4 ] ), new Text( 'yyy' ), baseVersion );

			let { deltasA, deltasB } = transformDeltaSets( [ insertDeltaA ], [ insertDeltaB ], false );

			expectDelta( deltasA[ 0 ], {
				type: InsertDelta,
				operations: [
					{
						type: InsertOperation,
						position: new Position( root, [ 0, 7 ] ),
						baseVersion: 1
					}
				]
			} );

			expectDelta( deltasB[ 0 ], {
				type: InsertDelta,
				operations: [
					{
						type: InsertOperation,
						position: new Position( root, [ 0, 4 ] ),
						baseVersion: 1
					}
				]
			} );
		} );

		it( 'should not modify original deltas or arrays', () => {
			const insertDeltaA = getInsertDelta( new Position( root, [ 0, 0 ] ), new Text( 'x' ), baseVersion );
			const insertDeltaB = getInsertDelta( new Position( root, [ 1, 0 ] ), new Text( 'y' ), baseVersion );

			const originalDeltasA = [ insertDeltaA ];
			const originalDeltasB = [ insertDeltaB ];

			let { deltasA, deltasB } = transformDeltaSets( originalDeltasA, originalDeltasB, false );

			expect( deltasA ).to.not.equal( originalDeltasA );
			expect( deltasB ).to.not.equal( originalDeltasB );
			expect( deltasA[ 0 ] ).to.not.equal( originalDeltasA[ 0 ] );
			expect( deltasB[ 0 ] ).to.not.equal( originalDeltasB[ 0 ] );
		} );
	} );
} );
