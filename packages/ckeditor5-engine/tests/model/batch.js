/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import deltas from '../../src/model/delta/basic-deltas'; // eslint-disable-line no-unused-vars

import Document from '../../src/model/document';
import { default as Batch, register } from '../../src/model/batch';
import Delta from '../../src/model/delta/delta';
import Operation from '../../src/model/operation/operation';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'Batch', () => {
	it( 'should have registered basic methods', () => {
		const batch = new Batch( new Document() );

		expect( batch.setAttribute ).to.be.a( 'function' );
		expect( batch.removeAttribute ).to.be.a( 'function' );
	} );

	describe( 'type', () => {
		it( 'should default to "default"', () => {
			const batch = new Batch( new Document() );

			expect( batch.type ).to.equal( 'default' );
		} );

		it( 'should be set to the value set in constructor', () => {
			const batch = new Batch( new Document(), 'ignore' );

			expect( batch.type ).to.equal( 'ignore' );
		} );
	} );

	describe( 'register', () => {
		afterEach( () => {
			delete Batch.prototype.foo;
		} );

		it( 'should register function to the batch prototype', () => {
			const spy = sinon.spy();

			register( 'foo', spy );

			const batch = new Batch( new Document() );

			batch.foo();

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should throw if one try to register the same batch twice', () => {
			register( 'foo', () => {} );

			expect( () => {
				register( 'foo', () => {} );
			} ).to.throw( CKEditorError, /^model-batch-register-taken/ );
		} );
	} );

	describe( 'addDelta', () => {
		it( 'should add delta to the batch', () => {
			const batch = new Batch( new Document() );
			const deltaA = new Delta();
			const deltaB = new Delta();
			batch.addDelta( deltaA );
			batch.addDelta( deltaB );

			expect( batch.deltas.length ).to.equal( 2 );
			expect( batch.deltas[ 0 ] ).to.equal( deltaA );
			expect( batch.deltas[ 1 ] ).to.equal( deltaB );
		} );
	} );

	describe( 'getOperations', () => {
		it( 'should return collection of operations from all deltas', () => {
			const doc = new Document();
			const batch = new Batch( doc );
			const deltaA = new Delta();
			const deltaB = new Delta();
			const ops = [
				new Operation( doc.version ),
				new Operation( doc.version + 1 ),
				new Operation( doc.version + 2 )
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

	describe( 'baseVersion', () => {
		it( 'should return base version of first delta from the batch', () => {
			const batch = new Batch( new Document() );
			const delta = new Delta();
			const operation = new Operation( 2 );
			delta.addOperation( operation );
			batch.addDelta( delta );

			expect( batch.baseVersion ).to.equal( 2 );
		} );

		it( 'should return null if there are no deltas in batch', () => {
			const batch = new Batch( new Document() );

			expect( batch.baseVersion ).to.be.null;
		} );
	} );
} );
