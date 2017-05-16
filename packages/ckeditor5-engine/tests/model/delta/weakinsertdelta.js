/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import Position from '../../../src/model/position';
import Text from '../../../src/model/text';
import WeakInsertDelta from '../../../src/model/delta/weakinsertdelta';

describe( 'Batch', () => {
	let doc, root, batch, chain, attrs;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		root.insertChildren( 0, new Text( 'abc' ) );

		batch = doc.batch();

		attrs = [ [ 'bold', true ], [ 'foo', 'bar' ] ];

		doc.selection.setAttributesTo( attrs );

		chain = batch.weakInsert( new Position( root, [ 2 ] ), 'xyz' );
	} );

	describe( 'weakInsert', () => {
		it( 'should insert given nodes at given position', () => {
			expect( root.maxOffset ).to.equal( 6 );
			expect( root.getChild( 0 ).data ).to.equal( 'ab' );
			expect( root.getChild( 1 ).data ).to.equal( 'xyz' );
			expect( root.getChild( 2 ).data ).to.equal( 'c' );
		} );

		it( 'should set inserted nodes attributes to same as current selection attributes', () => {
			expect( Array.from( root.getChild( 1 ).getAttributes() ) ).to.deep.equal( attrs );
		} );

		it( 'should be chainable', () => {
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.weakInsert( new Position( root, [ 2 ] ), 'xyz' );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );
} );

describe( 'WeakInsertDelta', () => {
	it( 'should provide proper className', () => {
		expect( WeakInsertDelta.className ).to.equal( 'engine.model.delta.WeakInsertDelta' );
	} );
} );
