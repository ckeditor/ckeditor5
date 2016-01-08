/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

const modules = bender.amd.require(
	'core/treemodel/batch',
	'core/treemodel/delta/delta',
	'core/ckeditorerror'
);

describe( 'Batch', () => {
	let Batch, Delta, CKEditorError;

	before( () => {
		Batch = modules[ 'core/treemodel/batch' ];
		Delta = modules[ 'core/treemodel/delta/delta' ];
		CKEditorError = modules[ 'core/ckeditorerror' ];
	} );

	it( 'should have registered basic methods', () => {
		const batch = new Batch();

		expect( batch.setAttr ).to.be.a( 'function' );
		expect( batch.removeAttr ).to.be.a( 'function' );
	} );

	describe( 'Batch.register', () => {
		let TestDelta;

		before( () => {
			TestDelta = class extends Delta {
				constructor( batch ) {
					super( batch, [] );
				}
			};
		} );

		afterEach( () => {
			delete Batch.prototype.foo;
		} );

		it( 'should register function which return an delta', () => {
			Batch.register( 'foo', function() {
				this.addDelta( new TestDelta() );
			} );

			const batch = new Batch();

			batch.foo();

			expect( batch.deltas.length ).to.equal( 1 );
			expect( batch.deltas[ 0 ] ).to.be.instanceof( TestDelta );
		} );

		it( 'should register function which return an multiple deltas', () => {
			Batch.register( 'foo', function() {
				this.addDelta( new TestDelta() );
				this.addDelta( new TestDelta() );
			} );

			const batch = new Batch();

			batch.foo();

			expect( batch.deltas.length ).to.equal( 2 );
			expect( batch.deltas[ 0 ] ).to.be.instanceof( TestDelta );
			expect( batch.deltas[ 1 ] ).to.be.instanceof( TestDelta );
		} );

		it( 'should throw if one try to register the same batch twice', () => {
			Batch.register( 'foo', () => {} );

			expect( () => {
				Batch.register( 'foo', () => {} );
			} ).to.throw( CKEditorError, /^batch-register-taken/ );
		} );
	} );
} );
