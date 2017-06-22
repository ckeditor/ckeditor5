/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import transformations from '../../../../src/model/delta/basic-transformations'; // eslint-disable-line no-unused-vars

import deltaTransform from '../../../../src/model/delta/transform';
const transform = deltaTransform.transform;

import Position from '../../../../src/model/position';
import MoveOperation from '../../../../src/model/operation/moveoperation';
import Delta from '../../../../src/model/delta/delta';

import {
	expectDelta,
	getFilledDocument,
} from '../../../../tests/model/delta/transform/_utils/utils';

describe( 'Delta', () => {
	let doc, root, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot();
		baseVersion = doc.version;
	} );

	it( 'should have baseVersion property, equal to the baseVersion of first operation in Delta or null', () => {
		const deltaA = new Delta();

		expect( deltaA.baseVersion ).to.be.null;

		const version = 5;

		deltaA.addOperation( new MoveOperation( new Position( root, [ 1, 2, 3 ] ), 4, new Position( root, [ 4, 0 ] ), version ) );

		expect( deltaA.baseVersion ).to.equal( 5 );
	} );

	it( 'should be transformable by another Delta', () => {
		const deltaA = new Delta();
		const deltaB = new Delta();

		const context = {
			isStrong: false
		};

		deltaA.addOperation( new MoveOperation( new Position( root, [ 1, 2, 3 ] ), 4, new Position( root, [ 4, 0 ] ), baseVersion ) );
		deltaB.addOperation( new MoveOperation( new Position( root, [ 1, 2, 0 ] ), 2, new Position( root, [ 4, 1 ] ), baseVersion ) );

		const deltaAbyB = transform( deltaA, deltaB, context );
		const deltaBbyA = transform( deltaB, deltaA, context );

		expect( deltaAbyB.length ).to.equal( 1 );

		expectDelta( deltaAbyB[ 0 ], {
			type: Delta,
			operations: [
				{
					type: MoveOperation,
					sourcePosition: new Position( root, [ 1, 2, 1 ] ),
					howMany: 4,
					targetPosition: new Position( root, [ 4, 0 ] ),
					baseVersion: 1
				}
			]
		} );

		expect( deltaBbyA.length ).to.equal( 1 );

		expectDelta( deltaBbyA[ 0 ], {
			type: Delta,
			operations: [
				{
					type: MoveOperation,
					sourcePosition: new Position( root, [ 1, 2, 0 ] ),
					howMany: 2,
					targetPosition: new Position( root, [ 4, 5 ] ),
					baseVersion: 1
				}
			]
		} );
	} );
} );
