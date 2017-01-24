/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import transformations from '../../../../src/model/delta/basic-transformations';
/*jshint unused: false*/

import transform from '../../../../src/model/delta/transform';

import Element from '../../../../src/model/element';
import Position from '../../../../src/model/position';
import Range from '../../../../src/model/range';

import MarkerDelta from '../../../../src/model/delta/markerdelta';
import MarkerOperation from '../../../../src/model/operation/markeroperation';

import {
	expectDelta,
	getFilledDocument,
	getMarkerDelta,
	getSplitDelta
} from '../../../model/delta/transform/_utils/utils';

describe( 'transform', () => {
	let doc, root, gy, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot();
		gy = doc.graveyard;
		baseVersion = doc.version;
	} );

	describe( 'MarkerDelta by', () => {
		let markerDelta;

		beforeEach( () => {
			const oldRange = new Range( new Position( root, [ 3, 0 ] ), new Position( root, [ 3, 3 ] ) );
			const newRange = new Range( new Position( root, [ 3, 3, 3, 2 ] ), new Position( root, [ 3, 3, 3, 6 ] ) );

			markerDelta = getMarkerDelta( 'name', oldRange, newRange, baseVersion );
		} );

		describe( 'SplitDelta', () => {
			it( 'split inside oldRange', () => {
				let splitDelta = getSplitDelta( new Position( root, [ 3, 1 ] ), new Element( 'div' ), 3, baseVersion );
				let transformed = transform( markerDelta, splitDelta );

				baseVersion = splitDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				const expectedOldRange = new Range( new Position( root, [ 3, 0 ] ), new Position( root, [ 4, 2 ] ) );
				const expectedNewRange = new Range( new Position( root, [ 4, 2, 3, 2 ] ), new Position( root, [ 4, 2, 3, 6 ] ) );

				expectDelta( transformed[ 0 ], {
					type: MarkerDelta,
					operations: [
						{
							type: MarkerOperation,
							name: 'name',
							oldRange: expectedOldRange,
							newRange: expectedNewRange,
							baseVersion: baseVersion
						}
					]
				} );
			} );

			it( 'split inside newRange', () => {
				let splitDelta = getSplitDelta( new Position( root, [ 3, 3, 3, 4 ] ), new Element( 'p' ), 8, baseVersion );
				let transformed = transform( markerDelta, splitDelta );

				baseVersion = splitDelta.operations.length;

				expect( transformed.length ).to.equal( 1 );

				const expectedOldRange = new Range( new Position( root, [ 3, 0 ] ), new Position( root, [ 3, 3 ] ) );
				const expectedNewRange = new Range( new Position( root, [ 3, 3, 3, 2 ] ), new Position( root, [ 3, 3, 4, 2 ] ) );

				expectDelta( transformed[ 0 ], {
					type: MarkerDelta,
					operations: [
						{
							type: MarkerOperation,
							name: 'name',
							oldRange: expectedOldRange,
							newRange: expectedNewRange,
							baseVersion: baseVersion
						}
					]
				} );
			} );
		} );
	} );
} );
