/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import Position from '../../../src/model/position';

import UnwrapDelta from '../../../src/model/delta/unwrapdelta';
import WrapDelta from '../../../src/model/delta/wrapdelta';

import MoveOperation from '../../../src/model/operation/moveoperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';
import ReinsertOperation from '../../../src/model/operation/reinsertoperation';

describe( 'UnwrapDelta', () => {
	let unwrapDelta, doc, root;

	beforeEach( () => {
		const model = new Model();

		doc = model.document;
		root = doc.createRoot();
		unwrapDelta = new UnwrapDelta();
	} );

	describe( 'constructor()', () => {
		it( 'should create unwrap delta with no operations added', () => {
			expect( unwrapDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to unwrap', () => {
			expect( unwrapDelta.type ).to.equal( 'unwrap' );
		} );
	} );

	describe( 'position', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( unwrapDelta.position ).to.be.null;
		} );

		it( 'should be equal to the position before unwrapped node', () => {
			unwrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 2, 0 ] ), 4, new Position( root, [ 1, 2 ] ) ) );
			unwrapDelta.operations.push( new RemoveOperation( new Position( root, [ 1, 6 ] ), 1, new Position( doc.graveyard, [ 0 ] ) ) );

			expect( unwrapDelta.position.root ).to.equal( root );
			expect( unwrapDelta.position.path ).to.deep.equal( [ 1, 2 ] );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty WrapDelta if there are no operations in delta', () => {
			const reversed = unwrapDelta.getReversed();

			expect( reversed ).to.be.instanceof( WrapDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct WrapDelta', () => {
			unwrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 2, 0 ] ), 4, new Position( root, [ 1, 2 ] ) ) );
			unwrapDelta.operations.push( new RemoveOperation( new Position( root, [ 1, 6 ] ), 1, new Position( doc.graveyard, [ 0 ] ) ) );

			const reversed = unwrapDelta.getReversed();

			expect( reversed ).to.be.instanceof( WrapDelta );
			expect( reversed.operations.length ).to.equal( 2 );

			// WrapDelta which is an effect of reversing UnwrapDelta has ReinsertOperation instead of InsertOperation.
			// This is because we will "wrap" nodes into the element in which they were in the first place.
			// That element has been removed so we reinsert it from the graveyard.
			expect( reversed.operations[ 0 ] ).to.be.instanceof( ReinsertOperation );
			expect( reversed.operations[ 0 ].howMany ).to.equal( 1 );
			expect( reversed.operations[ 0 ].targetPosition.path ).to.deep.equal( [ 1, 6 ] );

			expect( reversed.operations[ 1 ] ).to.be.instanceof( MoveOperation );
			expect( reversed.operations[ 1 ].sourcePosition.path ).to.deep.equal( [ 1, 2 ] );
			expect( reversed.operations[ 1 ].howMany ).to.equal( 4 );
			expect( reversed.operations[ 1 ].targetPosition.path ).to.deep.equal( [ 1, 6, 0 ] );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( UnwrapDelta.className ).to.equal( 'engine.model.delta.UnwrapDelta' );
	} );
} );
