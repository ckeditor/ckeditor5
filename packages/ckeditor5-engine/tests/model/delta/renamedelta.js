/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, delta */

'use strict';

import Document from '/ckeditor5/engine/model/document.js';
import Element from '/ckeditor5/engine/model/element.js';

import RenameDelta from '/ckeditor5/engine/model/delta/renamedelta.js';

describe( 'Batch', () => {
	let doc, root, batch, chain;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( '$root', 'root' );

		const p = new Element( 'p', null, 'abc' );
		root.appendChildren( p );

		batch = doc.batch();

		chain = batch.rename( 'h', p );
	} );

	describe( 'rename', () => {
		it( 'should rename given element', () => {
			expect( root.getChildCount() ).to.equal( 1 );
			expect( root.getChild( 0 ) ).to.have.property( 'name', 'h' );
			expect( root.getChild( 0 ).getText() ).to.equal( 'abc' );
		} );

		it( 'should be chainable', () => {
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.rename( 'p', root.getChild( 0 ) );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.alwaysCalledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );
} );

describe( 'RenameDelta', () => {
	let renameDelta, doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( '$root', 'root' );
		renameDelta = new RenameDelta();
	} );

	describe( 'constructor', () => {
		it( 'should create rename delta with no operations added', () => {
			expect( renameDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return instance of RenameDelta', () => {
			let reversed = renameDelta.getReversed();

			expect( reversed ).to.be.instanceof( RenameDelta );
		} );

		it( 'should return correct RenameDelta', () => {
			root.appendChildren( new Element( 'p', null, 'abc' ) );

			const batch = doc.batch();

			batch.rename( 'h', root.getChild( 0 ) );

			const reversed = batch.deltas[ 0 ].getReversed();

			reversed.operations.forEach( operation => {
				doc.applyOperation( operation );
			} );

			expect( root.getChildCount() ).to.equal( 1 );
			expect( root.getChild( 0 ) ).to.have.property( 'name', 'p' );
			expect( root.getChild( 0 ).getText() ).to.equal( 'abc' );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( RenameDelta.className ).to.equal( 'engine.model.delta.RenameDelta' );
	} );
} );
