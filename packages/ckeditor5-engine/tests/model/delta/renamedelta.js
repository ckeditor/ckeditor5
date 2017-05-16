/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import RenameDelta from '../../../src/model/delta/renamedelta';

describe( 'Batch', () => {
	let doc, root, batch, chain;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		const p = new Element( 'p', null, new Text( 'abc' ) );
		root.appendChildren( p );

		batch = doc.batch();

		chain = batch.rename( p, 'h' );
	} );

	describe( 'rename', () => {
		it( 'should rename given element', () => {
			expect( root.maxOffset ).to.equal( 1 );
			expect( root.getChild( 0 ) ).to.have.property( 'name', 'h' );
			expect( root.getChild( 0 ) ).to.have.property( 'name', 'h' );
		} );

		it( 'should throw if not an Element instance is passed', () => {
			expect( () => {
				batch.rename( new Text( 'abc' ), 'h' );
			} ).to.throw( CKEditorError, /^batch-rename-not-element-instance/ );
		} );

		it( 'should be chainable', () => {
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.rename( root.getChild( 0 ), 'p' );

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
		root = doc.createRoot();
		renameDelta = new RenameDelta();
	} );

	describe( 'constructor()', () => {
		it( 'should create rename delta with no operations added', () => {
			expect( renameDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to rename', () => {
			expect( renameDelta.type ).to.equal( 'rename' );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return instance of RenameDelta', () => {
			const reversed = renameDelta.getReversed();

			expect( reversed ).to.be.instanceof( RenameDelta );
		} );

		it( 'should return correct RenameDelta', () => {
			root.appendChildren( new Element( 'p', null, new Text( 'abc' ) ) );

			const batch = doc.batch();

			batch.rename( root.getChild( 0 ), 'h' );

			const reversed = batch.deltas[ 0 ].getReversed();

			reversed.operations.forEach( operation => {
				doc.applyOperation( operation );
			} );

			expect( root.maxOffset ).to.equal( 1 );
			expect( root.getChild( 0 ) ).to.have.property( 'name', 'p' );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( RenameDelta.className ).to.equal( 'engine.model.delta.RenameDelta' );
	} );
} );
