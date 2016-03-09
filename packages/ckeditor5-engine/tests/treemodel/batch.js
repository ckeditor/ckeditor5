/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import deltas from '/ckeditor5/core/treemodel/delta/basic-deltas.js';
/*jshint unused: false*/

import Batch from '/ckeditor5/core/treemodel/batch.js';
import { register } from '/ckeditor5/core/treemodel/batch.js';
import Delta from '/ckeditor5/core/treemodel/delta/delta.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'Batch', () => {
	it( 'should have registered basic methods', () => {
		const batch = new Batch();

		expect( batch.setAttr ).to.be.a( 'function' );
		expect( batch.removeAttr ).to.be.a( 'function' );
	} );

	describe( 'register', () => {
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
			register( 'foo', function() {
				this.addDelta( new TestDelta() );
			} );

			const batch = new Batch();

			batch.foo();

			expect( batch.deltas.length ).to.equal( 1 );
			expect( batch.deltas[ 0 ] ).to.be.instanceof( TestDelta );
		} );

		it( 'should register function which return an multiple deltas', () => {
			register( 'foo', function() {
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
			register( 'foo', () => {} );

			expect( () => {
				register( 'foo', () => {} );
			} ).to.throw( CKEditorError, /^batch-register-taken/ );
		} );
	} );
} );
