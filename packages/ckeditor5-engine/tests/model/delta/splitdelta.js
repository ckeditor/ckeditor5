/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import Position from '../../../src/model/position';
import Element from '../../../src/model/element';

import MergeDelta from '../../../src/model/delta/mergedelta';
import SplitDelta from '../../../src/model/delta/splitdelta';

import InsertOperation from '../../../src/model/operation/insertoperation';
import MoveOperation from '../../../src/model/operation/moveoperation';
import NoOperation from '../../../src/model/operation/nooperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';

describe( 'SplitDelta', () => {
	let splitDelta, doc, root;

	beforeEach( () => {
		const model = new Model();

		doc = model.document;
		root = doc.createRoot();
		splitDelta = new SplitDelta();
	} );

	describe( 'constructor()', () => {
		it( 'should create split delta with no operations added', () => {
			expect( splitDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to split', () => {
			expect( splitDelta.type ).to.equal( 'split' );
		} );
	} );

	describe( 'position', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( splitDelta.position ).to.be.null;
		} );

		it( 'should be equal to the position where node is split', () => {
			splitDelta.operations.push( new InsertOperation( new Position( root, [ 1, 2 ] ), new Element( 'p' ), 0 ) );
			splitDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1, 4 ] ), 4, new Position( root, [ 1, 2, 0 ] ), 1 ) );

			expect( splitDelta.position.root ).to.equal( root );
			expect( splitDelta.position.path ).to.deep.equal( [ 1, 1, 4 ] );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty MergeDelta if there are no operations in delta', () => {
			const reversed = splitDelta.getReversed();

			expect( reversed ).to.be.instanceof( MergeDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct SplitDelta', () => {
			splitDelta.operations.push( new InsertOperation( new Position( root, [ 1, 2 ] ), new Element( 'p' ), 0 ) );
			splitDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1, 4 ] ), 4, new Position( root, [ 1, 2, 0 ] ), 1 ) );

			const reversed = splitDelta.getReversed();

			expect( reversed ).to.be.instanceof( MergeDelta );
			expect( reversed.operations.length ).to.equal( 2 );

			expect( reversed.operations[ 0 ] ).to.be.instanceof( MoveOperation );
			expect( reversed.operations[ 0 ].sourcePosition.path ).to.deep.equal( [ 1, 2, 0 ] );
			expect( reversed.operations[ 0 ].howMany ).to.equal( 4 );
			expect( reversed.operations[ 0 ].targetPosition.path ).to.deep.equal( [ 1, 1, 4 ] );

			expect( reversed.operations[ 1 ] ).to.be.instanceof( RemoveOperation );
			expect( reversed.operations[ 1 ].sourcePosition.path ).to.deep.equal( [ 1, 2 ] );
			expect( reversed.operations[ 1 ].howMany ).to.equal( 1 );
		} );
	} );

	describe( '_cloneOperation', () => {
		it( 'should return null if delta has no operations', () => {
			expect( splitDelta._cloneOperation ).to.be.null;
		} );

		it( 'should return the first operation in the delta, which is InsertOperation or ReinsertOperation', () => {
			const p = new Element( 'p' );
			const insert = new InsertOperation( new Position( root, [ 1, 2 ] ), p, 0 );
			splitDelta.operations.push( insert );
			splitDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1, 4 ] ), 4, new Position( root, [ 1, 2, 0 ] ), 1 ) );

			expect( splitDelta._cloneOperation ).to.equal( insert );
		} );
	} );

	describe( '_moveOperation', () => {
		it( 'should return null if delta has no operations', () => {
			expect( splitDelta._moveOperation ).to.be.null;
		} );

		it( 'should return null if second operation is NoOperation', () => {
			const p = new Element( 'p' );
			splitDelta.operations.push( new InsertOperation( new Position( root, [ 1, 2 ] ), p, 0 ) );
			splitDelta.operations.push( new NoOperation( 1 ) );

			expect( splitDelta._moveOperation ).to.be.null;
		} );

		it( 'should return second operation if it is MoveOperation', () => {
			const p = new Element( 'p' );
			const move = new MoveOperation( new Position( root, [ 1, 1, 4 ] ), 4, new Position( root, [ 1, 2, 0 ] ), 1 );
			splitDelta.operations.push( new InsertOperation( new Position( root, [ 1, 2 ] ), p, 0 ) );
			splitDelta.operations.push( move );

			expect( splitDelta._moveOperation ).to.equal( move );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( SplitDelta.className ).to.equal( 'engine.model.delta.SplitDelta' );
	} );
} );

