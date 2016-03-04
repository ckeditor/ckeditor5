/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */

'use strict';

import transform from '/ckeditor5/core/treemodel/delta/transform.js';

import Position from '/ckeditor5/core/treemodel/position.js';

import MoveOperation from '/ckeditor5/core/treemodel/operation/moveoperation.js';

import Delta from '/ckeditor5/core/treemodel/delta/delta.js';

import {
	expectDelta,
	getFilledDocument,
} from '/tests/core/treemodel/delta/transform/_utils/utils.js';

describe( 'transform', () => {
	let doc, root, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot( 'root' );
		baseVersion = doc.version;
	} );

	it( 'should transform delta by transforming it\'s operations', () => {
		let deltaA = new Delta();
		let deltaB = new Delta();

		deltaA.addOperation( new MoveOperation( new Position( root, [ 1, 2, 3 ] ), 4, new Position( root, [ 4, 0 ] ), baseVersion ) );
		deltaB.addOperation( new MoveOperation( new Position( root, [ 1, 2, 0 ] ), 2, new Position( root, [ 4, 1 ] ), baseVersion ) );

		let deltaAbyB = transform( deltaA, deltaB );
		let deltaBbyA = transform( deltaB, deltaA );

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
