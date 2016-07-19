/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, delta */

import Document from '/ckeditor5/engine/model/document.js';
import Position from '/ckeditor5/engine/model/position.js';
import WeakInsertDelta from '/ckeditor5/engine/model/delta/weakinsertdelta.js';

describe( 'Batch', () => {
	let doc, root, batch, chain, attrs;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		root.insertChildren( 0, 'abc' );

		batch = doc.batch();

		attrs = [ [ 'bold', true ], [ 'foo', 'bar' ] ];

		doc.selection.setAttributesTo( attrs );

		chain = batch.weakInsert( new Position( root, [ 2 ] ), 'xyz' );
	} );

	describe( 'weakInsert', () => {
		it( 'should insert given nodes at given position', () => {
			expect( root.getChildCount() ).to.equal( 6 );
			expect( root.getChild( 2 ).character ).to.equal( 'x' );
			expect( root.getChild( 3 ).character ).to.equal( 'y' );
			expect( root.getChild( 4 ).character ).to.equal( 'z' );
		} );

		it( 'should set inserted nodes attributes to same as current selection attributes', () => {
			expect( Array.from( root.getChild( 2 )._attrs ) ).to.deep.equal( attrs );
			expect( Array.from( root.getChild( 3 )._attrs ) ).to.deep.equal( attrs );
			expect( Array.from( root.getChild( 4 )._attrs ) ).to.deep.equal( attrs );
		} );

		it( 'should be chainable', () => {
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.weakInsert( new Position( root, [ 2 ] ), 'xyz' );

			const correctDeltaMatcher = sinon.match( ( operation ) => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );
} );

describe( 'WeakInsertDelta', ()=> {
	it( 'should provide proper className', () => {
		expect( WeakInsertDelta.className ).to.equal( 'engine.model.delta.WeakInsertDelta' );
	} );
} );
