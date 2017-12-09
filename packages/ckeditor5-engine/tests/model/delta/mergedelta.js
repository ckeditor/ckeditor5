/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import Position from '../../../src/model/position';

import MergeDelta from '../../../src/model/delta/mergedelta';
import SplitDelta from '../../../src/model/delta/splitdelta';

import MoveOperation from '../../../src/model/operation/moveoperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';
import ReinsertOperation from '../../../src/model/operation/reinsertoperation';

describe( 'MergeDelta', () => {
	let mergeDelta, doc, root;

	beforeEach( () => {
		const model = new Model();

		doc = model.document;
		root = doc.createRoot();
		mergeDelta = new MergeDelta();
	} );

	describe( 'constructor()', () => {
		it( 'should create merge delta with no operations added', () => {
			expect( mergeDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to merge', () => {
			expect( mergeDelta.type ).to.equal( 'merge' );
		} );
	} );

	describe( 'position', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( mergeDelta.position ).to.be.null;
		} );

		it( 'should be equal to the position between merged nodes', () => {
			mergeDelta.operations.push( new MoveOperation( new Position( root, [ 1, 2, 0 ] ), 4, new Position( root, [ 1, 1, 4 ] ) ) );
			mergeDelta.operations.push( new RemoveOperation( new Position( root, [ 1, 2, 0 ] ), 1, new Position( doc.graveyard, [ 0 ] ) ) );

			expect( mergeDelta.position.root ).to.equal( root );
			expect( mergeDelta.position.path ).to.deep.equal( [ 1, 2, 0 ] );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty SplitDelta if there are no operations in delta', () => {
			const reversed = mergeDelta.getReversed();

			expect( reversed ).to.be.instanceof( SplitDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct SplitDelta', () => {
			mergeDelta.operations.push( new MoveOperation( new Position( root, [ 1, 2, 0 ] ), 4, new Position( root, [ 1, 1, 4 ] ) ) );
			mergeDelta.operations.push( new RemoveOperation( new Position( root, [ 1, 2, 0 ] ), 1, new Position( doc.graveyard, [ 0 ] ) ) );

			const reversed = mergeDelta.getReversed();

			expect( reversed ).to.be.instanceof( SplitDelta );
			expect( reversed.operations.length ).to.equal( 2 );

			expect( reversed.operations[ 0 ] ).to.be.instanceof( ReinsertOperation );
			expect( reversed.operations[ 0 ].howMany ).to.equal( 1 );
			expect( reversed.operations[ 0 ].targetPosition.path ).to.deep.equal( [ 1, 2, 0 ] );

			expect( reversed.operations[ 1 ] ).to.be.instanceof( MoveOperation );
			expect( reversed.operations[ 1 ].sourcePosition.path ).to.deep.equal( [ 1, 1, 4 ] );
			expect( reversed.operations[ 1 ].howMany ).to.equal( 4 );
			expect( reversed.operations[ 1 ].targetPosition.path ).to.deep.equal( [ 1, 2, 0 ] );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( MergeDelta.className ).to.equal( 'engine.model.delta.MergeDelta' );
	} );
} );
