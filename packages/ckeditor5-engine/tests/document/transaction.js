/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document, delta */

'use strict';

var modules = bender.amd.require(
	'document/transaction',
	'document/deltas/delta' );

describe( 'Transaction', () => {
	var Transaction, Delta;

	before( () => {
		Transaction = modules[ 'document/transaction' ];
		Delta = modules[ 'document/deltas/delta' ];
	} );

	it( 'should have registered basic methods', () => {
		var transaction = new Transaction();

		expect( transaction.setAttr ).to.be.a( 'function' );
		expect( transaction.removeAttr ).to.be.a( 'function' );
	} );

	describe( 'Transaction.register', () => {
		var executeCount = 0;
		var TestDelta;

		before( () => {
			TestDelta = class extends Delta {
				constructor( transaction ) {
					super( transaction, [] );
				}

				_execute() {
					executeCount++;
				}
			};
		} );

		afterEach( () => {
			delete Transaction.prototype.foo;

			executeCount = 0;
		} );

		it( 'should register function which return an delta', () => {
			Transaction.register( 'foo', ( doc, t ) => {
				return new TestDelta( t );
			} );

			var transaction = new Transaction();

			transaction.foo();

			expect( transaction.deltas.length ).to.equal( 1 );
			expect( transaction.deltas[ 0 ] ).to.be.instanceof( TestDelta );
			expect( executeCount ).to.equal( 1 );
		} );

		it( 'should register function which return an multiple deltas', () => {
			Transaction.register( 'foo', ( doc, transaction ) => {
				return [ new TestDelta( transaction ), new TestDelta( transaction ) ];
			} );

			var transaction = new Transaction();

			transaction.foo();

			expect( transaction.deltas.length ).to.equal( 2 );
			expect( transaction.deltas[ 0 ] ).to.be.instanceof( TestDelta );
			expect( transaction.deltas[ 1 ] ).to.be.instanceof( TestDelta );
			expect( executeCount ).to.equal( 2 );
		} );
	} );
} );