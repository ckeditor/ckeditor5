/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import Element from '../../../src/model/element';
import Position from '../../../src/model/position';

import InsertOperation from '../../../src/model/operation/insertoperation';
import InsertDelta from '../../../src/model/delta/insertdelta';

import RemoveDelta from '../../../src/model/delta/removedelta';
import RemoveOperation from '../../../src/model/operation/removeoperation';

describe( 'InsertDelta', () => {
	let insertDelta, doc, root;

	beforeEach( () => {
		const model = new Model();

		doc = model.document;
		root = doc.createRoot();
		insertDelta = new InsertDelta();
	} );

	describe( 'constructor()', () => {
		it( 'should create insert delta with no operations added', () => {
			expect( insertDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to insert', () => {
			expect( insertDelta.type ).to.equal( 'insert' );
		} );
	} );

	describe( 'position', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( insertDelta.position ).to.be.null;
		} );

		it( 'should be equal to the position where node is inserted', () => {
			insertDelta.operations.push( new InsertOperation( new Position( root, [ 1, 2, 3 ] ), new Element( 'x' ), 0 ) );

			expect( insertDelta.position.root ).to.equal( root );
			expect( insertDelta.position.path ).to.deep.equal( [ 1, 2, 3 ] );
		} );
	} );

	describe( 'nodes', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( insertDelta.nodes ).to.be.null;
		} );

		it( 'should be equal to the nodes inserted by the delta', () => {
			const elementX = new Element( 'x' );
			insertDelta.operations.push( new InsertOperation( new Position( root, [ 1, 2, 3 ] ), elementX, 0 ) );

			expect( insertDelta.nodes.length ).to.equal( 1 );
			expect( insertDelta.nodes.getNode( 0 ) ).to.equal( elementX );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty RemoveDelta if there are no operations in delta', () => {
			const reversed = insertDelta.getReversed();

			expect( reversed ).to.be.instanceof( RemoveDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct RemoveDelta', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const elementX = new Element( 'x' );
			insertDelta.operations.push( new InsertOperation( position, elementX, 0 ) );

			const reversed = insertDelta.getReversed();

			expect( reversed ).to.be.instanceof( RemoveDelta );
			expect( reversed.operations.length ).to.equal( 1 );

			expect( reversed.operations[ 0 ] ).to.be.instanceof( RemoveOperation );
			expect( reversed.operations[ 0 ].sourcePosition.isEqual( position ) ).to.be.true;
			expect( reversed.operations[ 0 ].howMany ).to.equal( 1 );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( InsertDelta.className ).to.equal( 'engine.model.delta.InsertDelta' );
	} );
} );
