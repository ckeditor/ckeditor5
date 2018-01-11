/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import Position from '../../../src/model/position';

import MoveDelta from '../../../src/model/delta/movedelta';
import MoveOperation from '../../../src/model/operation/moveoperation';

describe( 'MoveDelta', () => {
	let moveDelta, doc, root;

	beforeEach( () => {
		const model = new Model();

		doc = model.document;
		root = doc.createRoot();
		moveDelta = new MoveDelta();
	} );

	describe( 'constructor()', () => {
		it( 'should create move delta with no operations added', () => {
			expect( moveDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to move', () => {
			expect( moveDelta.type ).to.equal( 'move' );
		} );
	} );

	describe( 'sourcePosition', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( moveDelta.sourcePosition ).to.be.null;
		} );

		it( 'should be equal to the position where node is inserted', () => {
			moveDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 2, new Position( root, [ 2, 2 ] ), 0 ) );

			expect( moveDelta.sourcePosition.root ).to.equal( root );
			expect( moveDelta.sourcePosition.path ).to.deep.equal( [ 1, 1 ] );
		} );
	} );

	describe( 'howMany', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( moveDelta.howMany ).to.be.null;
		} );

		it( 'should be equal to the position where node is inserted', () => {
			moveDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 2, new Position( root, [ 2, 2 ] ), 0 ) );

			expect( moveDelta.howMany ).to.equal( 2 );
		} );
	} );

	describe( 'targetPosition', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( moveDelta.targetPosition ).to.be.null;
		} );

		it( 'should be equal to the move operation\'s target position', () => {
			moveDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 2, new Position( root, [ 2, 2 ] ), 0 ) );

			expect( moveDelta.targetPosition.root ).to.equal( root );
			expect( moveDelta.targetPosition.path ).to.deep.equal( [ 2, 2 ] );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty MoveDelta if there are no operations in delta', () => {
			const reversed = moveDelta.getReversed();

			expect( reversed ).to.be.instanceof( MoveDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct MoveDelta', () => {
			moveDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 2, new Position( root, [ 2, 2 ] ), 0 ) );

			const reversed = moveDelta.getReversed();

			expect( reversed ).to.be.instanceof( MoveDelta );
			expect( reversed.operations.length ).to.equal( 1 );

			expect( reversed.operations[ 0 ] ).to.be.instanceof( MoveOperation );
			expect( reversed.operations[ 0 ].sourcePosition.path ).to.deep.equal( [ 2, 2 ] );
			expect( reversed.operations[ 0 ].howMany ).to.equal( 2 );
			expect( reversed.operations[ 0 ].targetPosition.path ).to.deep.equal( [ 1, 1 ] );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( MoveDelta.className ).to.equal( 'engine.model.delta.MoveDelta' );
	} );
} );
