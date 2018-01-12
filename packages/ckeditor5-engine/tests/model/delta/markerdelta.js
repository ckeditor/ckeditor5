/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import Range from '../../../src/model/range';

import MarkerDelta from '../../../src/model/delta/markerdelta';
import MarkerOperation from '../../../src/model/operation/markeroperation';

describe( 'MarkerDelta', () => {
	let markerDelta, doc, root, range;

	beforeEach( () => {
		const model = new Model();

		doc = model.document;
		root = doc.createRoot();
		range = Range.createIn( root );
		markerDelta = new MarkerDelta();
	} );

	describe( 'constructor()', () => {
		it( 'should create merge delta with no operations added', () => {
			expect( markerDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to marker', () => {
			expect( markerDelta.type ).to.equal( 'marker' );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return correct MarkerDelta', () => {
			markerDelta.addOperation( new MarkerOperation( 'name', null, range, 0 ) );
			const reversed = markerDelta.getReversed();

			expect( reversed ).to.be.instanceof( MarkerDelta );
			expect( reversed.operations.length ).to.equal( 1 );

			const op = reversed.operations[ 0 ];

			expect( op ).to.be.an.instanceof( MarkerOperation );
			expect( op.oldRange.isEqual( range ) ).to.be.true;
			expect( op.newRange ).to.be.null;
		} );
	} );

	it( 'should provide proper className', () => {
		expect( MarkerDelta.className ).to.equal( 'engine.model.delta.MarkerDelta' );
	} );
} );
