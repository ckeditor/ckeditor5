/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, delta */

import Document from '/ckeditor5/engine/model/document.js';
import Element from '/ckeditor5/engine/model/element.js';
import Position from '/ckeditor5/engine/model/position.js';
import Text from '/ckeditor5/engine/model/text.js';

import InsertOperation from '/ckeditor5/engine/model/operation/insertoperation.js';
import InsertDelta from '/ckeditor5/engine/model/delta/insertdelta.js';

import RemoveDelta from '/ckeditor5/engine/model/delta/removedelta.js';
import RemoveOperation from '/ckeditor5/engine/model/operation/removeoperation.js';

describe( 'Batch', () => {
	let doc, root, batch, p, ul, chain;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		root.insertChildren( 0, new Text( 'abc' ) );

		batch = doc.batch();

		p = new Element( 'p' );
		ul = new Element( 'ul' );

		chain = batch.insert( new Position( root, [ 2 ] ), [ p, ul ] );
	} );

	describe( 'insert', () => {
		it( 'should insert given nodes at given position', () => {
			expect( root.getChildCount() ).to.equal( 4 );
			expect( root.getMaxOffset() ).to.equal( 5 );
			expect( root.getChild( 1 ) ).to.equal( p );
			expect( root.getChild( 2 ) ).to.equal( ul );
		} );

		it( 'should be chainable', () => {
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.insert( new Position( root, [ 2 ] ), [ p, ul ] );

			const correctDeltaMatcher = sinon.match( ( operation ) => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );
} );

describe( 'InsertDelta', () => {
	let insertDelta, doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		insertDelta = new InsertDelta();
	} );

	describe( 'constructor', () => {
		it( 'should create insert delta with no operations added', () => {
			expect( insertDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'position', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( insertDelta.position ).to.be.null;
		} );

		it( 'should be equal to the position where node is inserted', () => {
			insertDelta.operations.push( new InsertOperation( new Position( root, [ 1, 2, 3 ] ), new Element( 'x' ), 0 ) );

			expect( insertDelta.position.root ).to.equal( root );
			expect( insertDelta.position.path ).to.deep.equal( [ 1, 2, 3 ] );
		} );
	} );

	describe( 'nodes', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( insertDelta.nodes ).to.be.null;
		} );

		it( 'should be equal to the nodes inserted by the delta', () => {
			let elementX = new Element( 'x' );
			insertDelta.operations.push( new InsertOperation( new Position( root, [ 1, 2, 3 ] ), elementX, 0 ) );

			expect( insertDelta.nodes.length ).to.equal( 1 );
			expect( insertDelta.nodes.getNode( 0 ) ).to.equal( elementX );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty RemoveDelta if there are no operations in delta', () => {
			let reversed = insertDelta.getReversed();

			expect( reversed ).to.be.instanceof( RemoveDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct RemoveDelta', () => {
			let position = new Position( root, [ 1, 2, 3 ] );
			let elementX = new Element( 'x' );
			insertDelta.operations.push( new InsertOperation( position, elementX, 0 ) );

			let reversed = insertDelta.getReversed();

			expect( reversed ).to.be.instanceof( RemoveDelta );
			expect( reversed.operations.length ).to.equal( 1 );

			expect( reversed.operations[ 0 ] ).to.be.instanceof( RemoveOperation );
			expect( reversed.operations[ 0 ].sourcePosition.isEqual( position ) ).to.be.true;
			expect( reversed.operations[ 0 ].howMany ).to.equal( 1 );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( InsertDelta.className ).to.equal( 'engine.model.delta.InsertDelta' );
	} );
} );
