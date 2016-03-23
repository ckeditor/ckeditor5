/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

/* jshint unused: false */
import deltas from '/ckeditor5/engine/treemodel/delta/basic-deltas.js';

import Document from '/ckeditor5/engine/treemodel/document.js';
import Batch from '/ckeditor5/engine/treemodel/batch.js';
import { register } from '/ckeditor5/engine/treemodel/batch.js';
import Delta from '/ckeditor5/engine/treemodel/delta/delta.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

class TestDelta extends Delta {
	constructor( batch ) {
		super( batch, [] );
	}
}

describe( 'Batch', () => {
	it( 'should have registered basic methods', () => {
		const batch = new Batch( new Document() );

		expect( batch.setAttr ).to.be.a( 'function' );
		expect( batch.removeAttr ).to.be.a( 'function' );
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
} );
