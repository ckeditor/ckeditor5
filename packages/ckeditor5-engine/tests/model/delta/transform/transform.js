/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import transformations from '../../../../src/model/delta/basic-transformations'; // eslint-disable-line no-unused-vars
import deltaTransform from '../../../../src/model/delta/transform';
const transformDeltaSets = deltaTransform.transformDeltaSets;

import Document from '../../../../src/model/document';
import Element from '../../../../src/model/element';
import Text from '../../../../src/model/text';
import Position from '../../../../src/model/position';

import Delta from '../../../../src/model/delta/delta';
import InsertDelta from '../../../../src/model/delta/insertdelta';
import RemoveDelta from '../../../../src/model/delta/removedelta';
import MoveDelta from '../../../../src/model/delta/movedelta';
import SplitDelta from '../../../../src/model/delta/splitdelta';
import UnwrapDelta from '../../../../src/model/delta/unwrapdelta';

import NoOperation from '../../../../src/model/operation/nooperation';
import MoveOperation from '../../../../src/model/operation/moveoperation';
import RemoveOperation from '../../../../src/model/operation/removeoperation';
import ReinsertOperation from '../../../../src/model/operation/reinsertoperation';
import InsertOperation from '../../../../src/model/operation/insertoperation';

import {
	expectDelta,
	getInsertDelta,
	getSplitDelta,
	getRemoveDelta,
	getMoveDelta,
	getMergeDelta,
	getUnwrapDelta
} from '../../../../tests/model/delta/transform/_utils/utils';

describe( 'transform', () => {
	let doc, root, baseVersion;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		root.appendChildren( new Element( 'p', null, new Text( 'foobar' ) ) );

		baseVersion = doc.version;
	} );

	describe( 'transformDeltaSets', () => {
		it( 'should use deltaTransform.transform', () => {
			sinon.spy( deltaTransform, 'transform' );

			const insertDelta = getInsertDelta( new Position( root, [ 0, 4 ] ), new Text( 'xxx' ), baseVersion );
			const removeDelta = getRemoveDelta( new Position( root, [ 0, 0 ] ), 2, baseVersion );

			transformDeltaSets( [ insertDelta ], [ removeDelta ] );

			expect( deltaTransform.transform.called ).to.be.true;

			deltaTransform.transform.restore();
		} );

		it( 'should transform two arrays of deltas', () => {
			const splitDelta = getSplitDelta( new Position( root, [ 0, 3 ] ), new Element( 'p' ), 3, baseVersion );
			const insertDeltaX = getInsertDelta( new Position( root, [ 0, 3 ] ), new Text( 'xxx' ), baseVersion + 2 );

			const removeDelta = getRemoveDelta( new Position( root, [ 0, 2 ] ), 2, baseVersion );
			const insertDeltaY = getInsertDelta( new Position( root, [ 0, 4 ] ), new Text( 'yyy' ), baseVersion + 1 );

			const { deltasA, deltasB } = transformDeltaSets( [ splitDelta, insertDeltaX ], [ removeDelta, insertDeltaY ] );

			expect( deltasA.length ).to.equal( 3 );
			expect( deltasB.length ).to.equal( 3 );

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
						sourcePosition: new Position( root, [ 0, 2 ] ),
						howMany: 1,
						baseVersion: 3
					}
				]
			} );

			expectDelta( deltasB[ 1 ], {
				type: RemoveDelta,
				operations: [
					{
						type: RemoveOperation,
						sourcePosition: new Position( root, [ 1, 0 ] ),
						howMany: 1,
						baseVersion: 4
					}
				]
			} );

			expectDelta( deltasB[ 2 ], {
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

			const { deltasA, deltasB } = transformDeltaSets( [ removeDelta, insertDeltaY ], [ splitDelta, insertDeltaX ] );

			expect( deltasA.length ).to.equal( 3 );
			expect( deltasB.length ).to.equal( 3 );

			expectDelta( deltasA[ 0 ], {
				type: RemoveDelta,
				operations: [
					{
						type: RemoveOperation,
						sourcePosition: new Position( root, [ 0, 2 ] ),
						howMany: 1,
						baseVersion: 3
					}
				]
			} );

			expectDelta( deltasA[ 1 ], {
				type: RemoveDelta,
				operations: [
					{
						type: RemoveOperation,
						sourcePosition: new Position( root, [ 1, 0 ] ),
						howMany: 1,
						baseVersion: 4
					}
				]
			} );

			expectDelta( deltasA[ 2 ], {
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

		it( 'should not modify original deltas or arrays', () => {
			const insertDeltaA = getInsertDelta( new Position( root, [ 0, 0 ] ), new Text( 'x' ), baseVersion );
			const insertDeltaB = getInsertDelta( new Position( root, [ 1, 0 ] ), new Text( 'y' ), baseVersion );

			const originalDeltasA = [ insertDeltaA ];
			const originalDeltasB = [ insertDeltaB ];

			const { deltasA, deltasB } = transformDeltaSets( originalDeltasA, originalDeltasB );

			expect( deltasA ).to.not.equal( originalDeltasA );
			expect( deltasB ).to.not.equal( originalDeltasB );
			expect( deltasA[ 0 ] ).to.not.equal( originalDeltasA[ 0 ] );
			expect( deltasB[ 0 ] ).to.not.equal( originalDeltasB[ 0 ] );
		} );

		describe( 'context', () => {
			it( 'first set is important', () => {
				const insertDeltaA = getInsertDelta( new Position( root, [ 0, 4 ] ), new Text( 'xxx' ), baseVersion );
				const insertDeltaB = getInsertDelta( new Position( root, [ 0, 4 ] ), new Text( 'yyy' ), baseVersion );

				const { deltasA, deltasB } = transformDeltaSets( [ insertDeltaA ], [ insertDeltaB ] );

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

			it( 'remove delta is more important if additional context is not used', () => {
				const moveDelta = getMoveDelta( new Position( root, [ 0, 4 ] ), 3, new Position( root, [ 1, 0 ] ), baseVersion );
				const removeDelta = getRemoveDelta( new Position( root, [ 0, 4 ] ), 3, baseVersion );

				const { deltasA, deltasB } = transformDeltaSets( [ moveDelta ], [ removeDelta ] );

				expectDelta( deltasA[ 0 ], {
					type: Delta,
					operations: [
						{
							type: NoOperation,
							baseVersion: 1
						}
					]
				} );

				expectDelta( deltasB[ 0 ], {
					type: RemoveDelta,
					operations: [
						{
							type: RemoveOperation,
							sourcePosition: new Position( root, [ 1, 0 ] ),
							howMany: 3,
							targetPosition: new Position( doc.graveyard, [ 0 ] ),
							baseVersion: 1
						}
					]
				} );
			} );

			it( 'remove delta may be less important if additional context is used and the delta was undone', () => {
				const moveDelta = getMoveDelta( new Position( root, [ 0, 4 ] ), 3, new Position( root, [ 1, 0 ] ), baseVersion );
				const removeDelta = getRemoveDelta( new Position( root, [ 0, 4 ] ), 3, baseVersion );

				// "Fake" delta undoing.
				doc.history.setDeltaAsUndone( removeDelta, new Delta() );

				const { deltasA, deltasB } = transformDeltaSets( [ moveDelta ], [ removeDelta ], doc );

				expectDelta( deltasA[ 0 ], {
					type: MoveDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( doc.graveyard, [ 0 ] ),
							howMany: 3,
							targetPosition: new Position( root, [ 1, 0 ] ),
							baseVersion: 1
						}
					]
				} );

				expectDelta( deltasB[ 0 ], {
					type: Delta,
					operations: [
						{
							type: NoOperation,
							baseVersion: 1
						}
					]
				} );
			} );

			// #1053.
			it( 'remove operation importance should be set correctly also for deltas other than remove delta', () => {
				const unwrapDelta = getUnwrapDelta( new Position( root, [ 0 ] ), 2, baseVersion );

				const nodeCopy = new Element( 'p' );
				const splitDelta = getSplitDelta( new Position( root, [ 0, 0, 1 ] ), nodeCopy, 1, baseVersion );
				const mergeDelta = splitDelta.getReversed();

				const { deltasA } = transformDeltaSets( [ unwrapDelta ], [ splitDelta, mergeDelta ], doc );

				expect( deltasA.length ).to.equal( 2 );

				expectDelta( deltasA[ 0 ], {
					type: MoveDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 0, 0 ] ),
							howMany: 1,
							targetPosition: new Position( root, [ 0 ] ),
							baseVersion: baseVersion + 4
						}
					]
				} );

				expectDelta( deltasA[ 1 ], {
					type: UnwrapDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 1, 0 ] ),
							howMany: 1,
							targetPosition: new Position( root, [ 1 ] ),
							baseVersion: baseVersion + 5
						},
						{
							type: RemoveOperation,
							sourcePosition: new Position( root, [ 2 ] ),
							howMany: 1,
							baseVersion: baseVersion + 6
						}
					]
				} );
			} );

			it( 'should keep correct order of nodes if additional context is used (insert before)', () => {
				// Assume document state: 'a^bcd'. User presses 'delete' key twice.
				const removeDelta1 = getRemoveDelta( new Position( root, [ 1 ] ), 1, baseVersion ); // 'acd'.
				const removeDelta2 = getRemoveDelta( new Position( root, [ 1 ] ), 1, baseVersion + 1 ); // 'ad'.
				const reinsertDelta2 = removeDelta2.getReversed(); // 'acd'.

				doc.history.addDelta( removeDelta1 );
				doc.history.addDelta( removeDelta2 );
				doc.history.addDelta( reinsertDelta2 );

				doc.history.setDeltaAsUndone( removeDelta2, reinsertDelta2 );

				// This should insert 'b' at offset 1.
				// However this delta will be transformed by `reinsertDelta2` which also inserts a node at offset 1.
				// This leads to a conflict and history needs to be check how deltas relate to each other.
				// Compare this scenario to the scenario below.
				const reinsertDelta1 = removeDelta1.getReversed();

				const { deltasA } = transformDeltaSets( [ reinsertDelta1 ], [ removeDelta2, reinsertDelta2 ], doc );

				expectDelta( deltasA[ 0 ], {
					type: MoveDelta,
					operations: [
						{
							type: ReinsertOperation,
							targetPosition: new Position( root, [ 1 ] ),
							howMany: 1,
							baseVersion: 3
						}
					]
				} );
			} );

			it( 'should keep correct order of nodes if additional context is used (insert after)', () => {
				// Assume document state: 'abc^d'. User presses 'backspace' key twice.
				const removeDelta1 = getRemoveDelta( new Position( root, [ 2 ] ), 1, baseVersion ); // 'abd'.
				const removeDelta2 = getRemoveDelta( new Position( root, [ 1 ] ), 1, baseVersion + 1 ); // 'ad'.
				const reinsertDelta2 = removeDelta2.getReversed(); // 'abd'.

				doc.history.addDelta( removeDelta1 );
				doc.history.addDelta( removeDelta2 );
				doc.history.addDelta( reinsertDelta2 );

				doc.history.setDeltaAsUndone( removeDelta2, reinsertDelta2 );

				// This should insert 'c' at offset 2.
				// However this delta will be first transformed by `removeDelta2`. After that transformation
				// the delta will try to insert 'c' at offset 1. Then, it will be transformed by `reinsertDelta2`,
				// which also tries to insert node at offset 1.
				// This leads to a conflict and history needs to be check how deltas relate to each other.
				// Compare this scenario to the scenario below.
				// In both cases transformed delta was inserting something at the same position. However, in
				// both cases the expected outcome is different.
				const reinsertDelta1 = removeDelta1.getReversed();

				const { deltasA } = transformDeltaSets( [ reinsertDelta1 ], [ removeDelta2, reinsertDelta2 ], doc );

				expectDelta( deltasA[ 0 ], {
					type: MoveDelta,
					operations: [
						{
							type: ReinsertOperation,
							targetPosition: new Position( root, [ 2 ] ),
							howMany: 1,
							baseVersion: 3
						}
					]
				} );
			} );

			it( 'should not throw if delta transformed by undoing delta was not transformed by undone delta', () => {
				// This scenario may happen when deltas are undone in different order than usual LIFO order.
				const removeDelta1 = getRemoveDelta( new Position( root, [ 0 ] ), 1, baseVersion );
				const removeDelta2 = getRemoveDelta( new Position( root, [ 2 ] ), 1, baseVersion + 1 );
				const reinsertDelta1 = removeDelta1.getReversed();
				reinsertDelta1.baseVersion = 2;

				doc.history.addDelta( removeDelta1 );
				doc.history.addDelta( removeDelta2 );
				doc.history.addDelta( reinsertDelta1 );

				doc.history.setDeltaAsUndone( removeDelta1, reinsertDelta1 );

				const reinsertDelta2 = removeDelta2.getReversed();

				const { deltasA } = transformDeltaSets( [ reinsertDelta2 ], [ reinsertDelta1 ], doc );

				expectDelta( deltasA[ 0 ], {
					type: MoveDelta,
					operations: [
						{
							type: MoveOperation,
							sourcePosition: new Position( root, [ 0 ] ),
							targetPosition: new Position( root, [ 3 ] ),
							howMany: 1,
							baseVersion: 3
						}
					]
				} );
			} );

			it( 'should use stickiness if additional context is not used', () => {
				const moveDeltaA = getMoveDelta( new Position( root, [ 0, 0 ] ), 1, new Position( root, [ 1, 0 ] ), baseVersion );
				const moveDeltaB = getMoveDelta( new Position( root, [ 1, 0 ] ), 3, new Position( root, [ 2, 2 ] ), baseVersion );
				moveDeltaB.operations[ 0 ].isSticky = true;

				const { deltasA } = transformDeltaSets( [ moveDeltaA ], [ moveDeltaB ], doc );

				expectDelta( deltasA[ 0 ], {
					type: MoveDelta,
					operations: [
						{
							type: MoveOperation,
							targetPosition: new Position( root, [ 2, 2 ] ),
							howMany: 1,
							baseVersion: 1
						}
					]
				} );
			} );

			it( 'should discard stickiness if additional context is used and delta with sticky move operation has been undone', () => {
				// Assume following data model:	<paragraph>ab</paragraph><paragraph>cd</paragraph>
				// Then we remove 'b':			<paragraph>a</paragraph><paragraph>cd</paragraph>
				const removeDelta = getRemoveDelta( new Position( root, [ 0, 1 ] ), 1, baseVersion );
				// Then we merge paragraphs:	<paragraph>acd</paragraph>
				// Keep in mind that merging has sticky move operation ('cd' is sticky-moved to the first paragraph).
				const mergeDelta = getMergeDelta( new Position( root, [ 1 ] ), 2, 1, baseVersion + 1 );
				// Then we reverse merging:		<paragraph>a</paragraph><paragraph>cd</paragraph>
				// Keep in mind that now we have two deltas with sticky moves in a history.
				const splitDelta = mergeDelta.getReversed();

				doc.history.addDelta( removeDelta );
				doc.history.addDelta( mergeDelta );
				doc.history.addDelta( splitDelta );

				doc.history.setDeltaAsUndone( mergeDelta, splitDelta );

				// This delta should insert 'b' at position [ 0, 1 ].
				// However, without context data, after transforming `reinsertDelta` by `splitDelta`,
				// 'b' would "go away" together with 'cd'.
				const reinsertDelta = removeDelta.getReversed();

				const { deltasA } = transformDeltaSets( [ reinsertDelta ], [ mergeDelta, splitDelta ], doc );

				expectDelta( deltasA[ 0 ], {
					type: MoveDelta,
					operations: [
						{
							type: ReinsertOperation,
							targetPosition: new Position( root, [ 0, 1 ] ),
							howMany: 1,
							baseVersion: 5
						}
					]
				} );
			} );
		} );
	} );
} );
