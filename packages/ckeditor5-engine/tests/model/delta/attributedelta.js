/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import Range from '../../../src/model/range';
import Position from '../../../src/model/position';
import AttributeDelta from '../../../src/model/delta/attributedelta';
import AttributeOperation from '../../../src/model/operation/attributeoperation';
import NoOperation from '../../../src/model/operation/nooperation';
import { jsonParseStringify } from '../../../tests/model/_utils/utils';

describe( 'AttributeDelta', () => {
	let root, delta;

	beforeEach( () => {
		const model = new Model();

		root = model.document.createRoot();
		delta = new AttributeDelta();
	} );

	describe( 'type', () => {
		it( 'should be equal to attribute', () => {
			expect( delta.type ).to.equal( 'attribute' );
		} );
	} );

	describe( 'key', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( delta.key ).to.be.null;
		} );

		it( 'should be equal to attribute operations key that are in delta', () => {
			const range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) );
			delta.addOperation( new AttributeOperation( range, 'key', 'old', 'new', 0 ) );

			expect( delta.key ).to.equal( 'key' );
		} );
	} );

	describe( 'value', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( delta.value ).to.be.null;
		} );

		it( 'should be equal to the value set by the delta operations', () => {
			const range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) );
			delta.addOperation( new AttributeOperation( range, 'key', 'old', 'new', 0 ) );

			expect( delta.value ).to.equal( 'new' );
		} );
	} );

	describe( 'range', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( delta.range ).to.be.null;
		} );

		it( 'start and end should be equal to first and last changed position', () => {
			const rangeA = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );
			const rangeB = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) );
			const rangeC = new Range( new Position( root, [ 5 ] ), new Position( root, [ 6 ] ) );

			delta.addOperation( new AttributeOperation( rangeA, 'key', 'oldA', 'new', 0 ) );
			delta.addOperation( new AttributeOperation( rangeB, 'key', 'oldB', 'new', 1 ) );
			delta.addOperation( new AttributeOperation( rangeC, 'key', 'oldC', 'new', 2 ) );

			expect( delta.range.start.path ).to.deep.equal( [ 1 ] );
			expect( delta.range.end.path ).to.deep.equal( [ 6 ] );
		} );

		it( 'should return correct values when some operations are NoOperations', () => {
			const rangeA = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );
			const rangeB = new Range( new Position( root, [ 5 ] ), new Position( root, [ 6 ] ) );

			delta.addOperation( new AttributeOperation( rangeA, 'key', 'oldA', 'new', 0 ) );
			delta.addOperation( new NoOperation( 1 ) );
			delta.addOperation( new AttributeOperation( rangeB, 'key', 'oldC', 'new', 2 ) );

			expect( delta.range.start.path ).to.deep.equal( [ 2 ] );
			expect( delta.range.end.path ).to.deep.equal( [ 6 ] );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty AttributeDelta if there are no operations in delta', () => {
			const reversed = delta.getReversed();

			expect( reversed ).to.be.instanceof( AttributeDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct AttributeDelta', () => {
			const rangeA = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) );
			const rangeB = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );

			delta.addOperation( new AttributeOperation( rangeA, 'key', 'oldA', 'new', 0 ) );
			delta.addOperation( new AttributeOperation( rangeB, 'key', 'oldB', 'new', 1 ) );

			const reversed = delta.getReversed();

			expect( reversed ).to.be.instanceof( AttributeDelta );
			expect( reversed.operations.length ).to.equal( 2 );

			// Remember about reversed operations order.
			expect( reversed.operations[ 0 ] ).to.be.instanceof( AttributeOperation );
			expect( reversed.operations[ 0 ].range.isEqual( rangeB ) ).to.be.true;
			expect( reversed.operations[ 0 ].key ).to.equal( 'key' );
			expect( reversed.operations[ 0 ].oldValue ).to.equal( 'new' );
			expect( reversed.operations[ 0 ].newValue ).to.equal( 'oldB' );

			expect( reversed.operations[ 1 ] ).to.be.instanceof( AttributeOperation );
			expect( reversed.operations[ 1 ].range.isEqual( rangeA ) ).to.be.true;
			expect( reversed.operations[ 1 ].key ).to.equal( 'key' );
			expect( reversed.operations[ 1 ].oldValue ).to.equal( 'new' );
			expect( reversed.operations[ 1 ].newValue ).to.equal( 'oldA' );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( AttributeDelta.className ).to.equal( 'engine.model.delta.AttributeDelta' );
	} );

	it( 'should not have _range property when converted to JSON', () => {
		const json = jsonParseStringify( delta );

		expect( json ).not.to.have.property( '_range' );
	} );
} );
