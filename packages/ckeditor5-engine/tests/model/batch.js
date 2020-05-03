/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Batch from '../../src/model/batch';
import Operation from '../../src/model/operation/operation';

describe( 'Batch', () => {
	describe( 'type', () => {
		it( 'should default to "default"', () => {
			const batch = new Batch();

			expect( batch.type ).to.equal( 'default' );
		} );

		it( 'should be set to the value set in constructor', () => {
			const batch = new Batch( 'transparent' );

			expect( batch.type ).to.equal( 'transparent' );
		} );
	} );

	describe( 'addOperation()', () => {
		it( 'should add operation to the batch', () => {
			const batch = new Batch();
			const op = new Operation( 0 );

			batch.addOperation( op );

			expect( batch.operations.length ).to.equal( 1 );
			expect( batch.operations[ 0 ] ).to.equal( op );
		} );
	} );

	describe( 'baseVersion', () => {
		it( 'should return base version of the first operation from the batch', () => {
			const batch = new Batch();
			const operation = new Operation( 2 );
			batch.addOperation( operation );

			expect( batch.baseVersion ).to.equal( 2 );
		} );

		it( 'should return null if there are no operations in batch', () => {
			const batch = new Batch();

			expect( batch.baseVersion ).to.be.null;
		} );

		it( 'should return null if all operations in batch have base version set to null', () => {
			const batch = new Batch();

			const opA = new Operation( null );
			const opB = new Operation( null );

			batch.addOperation( opA );
			batch.addOperation( opB );

			expect( batch.baseVersion ).to.equal( null );
		} );
	} );
} );
