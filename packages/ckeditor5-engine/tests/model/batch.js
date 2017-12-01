/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Batch from '../../src/model/batch';
import Delta from '../../src/model/delta/delta';
import Operation from '../../src/model/operation/operation';

describe( 'Batch', () => {
	describe( 'type', () => {
		it( 'should default be "default"', () => {
			const batch = new Batch();

			expect( batch.type ).to.equal( 'default' );
		} );

		it( 'should be set to the value set in constructor', () => {
			const batch = new Batch( 'ignore' );

			expect( batch.type ).to.equal( 'ignore' );
		} );
	} );

	describe( 'baseVersion', () => {
		it( 'should return base version of first delta from the batch', () => {
			const batch = new Batch();
			const delta = new Delta();
			const operation = new Operation( 2 );
			delta.addOperation( operation );
			batch.addDelta( delta );

			expect( batch.baseVersion ).to.equal( 2 );
		} );

		it( 'should return null if there are no deltas in batch', () => {
			const batch = new Batch();

			expect( batch.baseVersion ).to.be.null;
		} );
	} );

	describe( 'addDelta()', () => {
		it( 'should add delta to the batch', () => {
			const batch = new Batch();
			const deltaA = new Delta();
			const deltaB = new Delta();
			batch.addDelta( deltaA );
			batch.addDelta( deltaB );

			expect( batch.deltas.length ).to.equal( 2 );
			expect( batch.deltas[ 0 ] ).to.equal( deltaA );
			expect( batch.deltas[ 1 ] ).to.equal( deltaB );
		} );
	} );

	describe( 'getOperations()', () => {
		it( 'should return collection of operations from all deltas', () => {
			const batch = new Batch();
			const deltaA = new Delta();
			const deltaB = new Delta();
			const ops = [
				new Operation( 0 ),
				new Operation( 1 ),
				new Operation( 2 )
			];

			batch.addDelta( deltaA );
			deltaA.addOperation( ops[ 0 ] );
			batch.addDelta( deltaB );
			deltaA.addOperation( ops[ 1 ] );
			deltaA.addOperation( ops[ 2 ] );

			expect( Array.from( batch.getOperations() ) ).to.deep.equal( ops );
			expect( batch.getOperations() ).to.have.property( 'next' );
		} );
	} );
} );
