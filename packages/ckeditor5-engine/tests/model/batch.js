/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, delta */

'use strict';

import deltas from '/ckeditor5/engine/model/delta/basic-deltas.js'; // jshint ignore:line

import Document from '/ckeditor5/engine/model/document.js';
import Batch from '/ckeditor5/engine/model/batch.js';
import { register } from '/ckeditor5/engine/model/batch.js';
import Delta from '/ckeditor5/engine/model/delta/delta.js';
import Operation from '/ckeditor5/engine/model/operation/operation.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'Batch', () => {
	it( 'should have registered basic methods', () => {
		const batch = new Batch( new Document() );

		expect( batch.setAttr ).to.be.a( 'function' );
		expect( batch.removeAttr ).to.be.a( 'function' );
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
			} ).to.throw( CKEditorError, /^batch-register-taken/ );
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
} );
