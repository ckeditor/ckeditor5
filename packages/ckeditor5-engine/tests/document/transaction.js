/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document, delta */

'use strict';

const modules = bender.amd.require(
	'document/transaction',
	'document/deltas/delta',
	'ckeditorerror' );

describe( 'Transaction', () => {
	let Transaction, Delta, CKEditorError;

	before( () => {
		Transaction = modules[ 'document/transaction' ];
		Delta = modules[ 'document/deltas/delta' ];
		CKEditorError = modules.ckeditorerror;
	} );

	it( 'should have registered basic methods', () => {
		const transaction = new Transaction();

		expect( transaction.setAttr ).to.be.a( 'function' );
		expect( transaction.removeAttr ).to.be.a( 'function' );
	} );

	describe( 'Transaction.register', () => {
		let TestDelta;

		before( () => {
			TestDelta = class extends Delta {
				constructor( transaction ) {
					super( transaction, [] );
				}
			};
		} );

		afterEach( () => {
			delete Transaction.prototype.foo;
		} );

		it( 'should register function which return an delta', () => {
			Transaction.register( 'foo', ( doc, t ) => {
				t.addDelta( new TestDelta() );
			} );

			const transaction = new Transaction();

			transaction.foo();

			expect( transaction.deltas.length ).to.equal( 1 );
			expect( transaction.deltas[ 0 ] ).to.be.instanceof( TestDelta );
		} );

		it( 'should register function which return an multiple deltas', () => {
			Transaction.register( 'foo', ( doc, t ) => {
				t.addDelta( new TestDelta() );
				t.addDelta( new TestDelta() );
			} );

			const transaction = new Transaction();

			transaction.foo();

			expect( transaction.deltas.length ).to.equal( 2 );
			expect( transaction.deltas[ 0 ] ).to.be.instanceof( TestDelta );
			expect( transaction.deltas[ 1 ] ).to.be.instanceof( TestDelta );
		} );

		it( 'should pass arguments properly', () => {
			const doc = 'doc';
			const arg = 'arg';

			const transaction = new Transaction( doc );

			const stub = sinon.stub();

			Transaction.register( 'foo', stub );

			transaction.foo( arg );

			sinon.assert.calledWith( stub, doc, transaction, arg );
		} );

		it( 'should throw if one try to register the same transaction twice', () => {
			Transaction.register( 'foo', () => {} );

			expect( () => {
				Transaction.register( 'foo', () => {} );
			} ).to.throw( CKEditorError, /^transaction-register-taken/ );
		} );
	} );
} );