/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import Position from '../../../src/model/position';
import Element from '../../../src/model/element';

import WrapDelta from '../../../src/model/delta/wrapdelta';
import UnwrapDelta from '../../../src/model/delta/unwrapdelta';

import InsertOperation from '../../../src/model/operation/insertoperation';
import MoveOperation from '../../../src/model/operation/moveoperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';

describe( 'WrapDelta', () => {
	let wrapDelta, doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		wrapDelta = new WrapDelta();
	} );

	describe( 'constructor()', () => {
		it( 'should create wrap delta with no operations added', () => {
			expect( wrapDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to wrap', () => {
			expect( wrapDelta.type ).to.equal( 'wrap' );
		} );
	} );

	describe( 'range', () => {
		it( 'should be equal to null if there are no operations in delta', () => {
			expect( wrapDelta.range ).to.be.null;
		} );

		it( 'should be equal to wrapped range', () => {
			wrapDelta.operations.push( new InsertOperation( new Position( root, [ 1, 6 ] ), [], 1 ) );
			wrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 5, new Position( root, [ 1, 6, 0 ] ) ) );

			expect( wrapDelta.range.start.isEqual( new Position( root, [ 1, 1 ] ) ) ).to.be.true;
			expect( wrapDelta.range.end.isEqual( new Position( root, [ 1, 6 ] ) ) ).to.be.true;
		} );
	} );

	describe( 'howMany', () => {
		it( 'should be equal to 0 if there are no operations in delta', () => {
			expect( wrapDelta.howMany ).to.equal( 0 );
		} );

		it( 'should be equal to the number of wrapped elements', () => {
			const howMany = 5;

			wrapDelta.operations.push( new InsertOperation( new Position( root, [ 1, 6 ] ), [], 1 ) );
			wrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), howMany, new Position( root, [ 1, 6, 0 ] ) ) );

			expect( wrapDelta.howMany ).to.equal( 5 );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty UnwrapDelta if there are no operations in delta', () => {
			const reversed = wrapDelta.getReversed();

			expect( reversed ).to.be.instanceof( UnwrapDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct UnwrapDelta', () => {
			wrapDelta.operations.push( new InsertOperation( new Position( root, [ 1, 6 ] ), new Element( 'p' ), 1 ) );
			wrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 5, new Position( root, [ 1, 6, 0 ] ) ) );

			const reversed = wrapDelta.getReversed();

			expect( reversed ).to.be.instanceof( UnwrapDelta );
			expect( reversed.operations.length ).to.equal( 2 );

			expect( reversed.operations[ 0 ] ).to.be.instanceof( MoveOperation );
			expect( reversed.operations[ 0 ].sourcePosition.path ).to.deep.equal( [ 1, 1, 0 ] );
			expect( reversed.operations[ 0 ].howMany ).to.equal( 5 );
			expect( reversed.operations[ 0 ].targetPosition.path ).to.deep.equal( [ 1, 1 ] );

			expect( reversed.operations[ 1 ] ).to.be.instanceof( RemoveOperation );
			expect( reversed.operations[ 1 ].sourcePosition.path ).to.deep.equal( [ 1, 6 ] );
			expect( reversed.operations[ 1 ].howMany ).to.equal( 1 );
		} );
	} );

	describe( '_insertOperation', () => {
		it( 'should be null if there are no operations in the delta', () => {
			expect( wrapDelta._insertOperation ).to.be.null;
		} );

		it( 'should be equal to the first operation in the delta', () => {
			const insertOperation = new InsertOperation( new Position( root, [ 1, 6 ] ), [], 1 );

			wrapDelta.operations.push( insertOperation );
			wrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 5, new Position( root, [ 1, 6, 0 ] ) ) );

			expect( wrapDelta._insertOperation ).to.equal( insertOperation );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( WrapDelta.className ).to.equal( 'engine.model.delta.WrapDelta' );
	} );
} );

