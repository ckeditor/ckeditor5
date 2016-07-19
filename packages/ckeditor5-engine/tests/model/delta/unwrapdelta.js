/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, delta */

import Document from '/ckeditor5/engine/model/document.js';
import Element from '/ckeditor5/engine/model/element.js';
import Position from '/ckeditor5/engine/model/position.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

import UnwrapDelta from '/ckeditor5/engine/model/delta/unwrapdelta.js';
import WrapDelta from '/ckeditor5/engine/model/delta/wrapdelta.js';

import MoveOperation from '/ckeditor5/engine/model/operation/moveoperation.js';
import RemoveOperation from '/ckeditor5/engine/model/operation/removeoperation.js';
import ReinsertOperation from '/ckeditor5/engine/model/operation/reinsertoperation.js';

describe( 'Batch', () => {
	let doc, root, p;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		p = new Element( 'p', [], 'xyz' );
		root.insertChildren( 0, [ 'a', p, 'b' ] );
	} );

	describe( 'unwrap', () => {
		it( 'should unwrap given element', () => {
			doc.batch().unwrap( p );

			expect( root.getChildCount() ).to.equal( 5 );
			expect( root.getChild( 0 ).character ).to.equal( 'a' );
			expect( root.getChild( 1 ).character ).to.equal( 'x' );
			expect( root.getChild( 2 ).character ).to.equal( 'y' );
			expect( root.getChild( 3 ).character ).to.equal( 'z' );
			expect( root.getChild( 4 ).character ).to.equal( 'b' );
		} );

		it( 'should throw if element to unwrap has no parent', () => {
			let element = new Element( 'p' );

			expect( () => {
				doc.batch().unwrap( element );
			} ).to.throw( CKEditorError, /^batch-unwrap-element-no-parent/ );
		} );

		it( 'should be chainable', () => {
			const batch = doc.batch();

			const chain = batch.unwrap( p );
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			const batch = doc.batch().unwrap( p );

			const correctDeltaMatcher = sinon.match( ( operation ) => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );
} );

describe( 'UnwrapDelta', () => {
	let unwrapDelta, doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		unwrapDelta = new UnwrapDelta();
	} );

	describe( 'constructor', () => {
		it( 'should create unwrap delta with no operations added', () => {
			expect( unwrapDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'position', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( unwrapDelta.position ).to.be.null;
		} );

		it( 'should be equal to the position before unwrapped node', () => {
			unwrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 2, 0 ] ), 4, new Position( root, [ 1, 2 ] ) ) );
			unwrapDelta.operations.push( new RemoveOperation( new Position( root, [ 1, 6 ] ), 1 ) );

			expect( unwrapDelta.position.root ).to.equal( root );
			expect( unwrapDelta.position.path ).to.deep.equal( [ 1, 2 ] );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty WrapDelta if there are no operations in delta', () => {
			let reversed = unwrapDelta.getReversed();

			expect( reversed ).to.be.instanceof( WrapDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct WrapDelta', () => {
			unwrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 2, 0 ] ), 4, new Position( root, [ 1, 2 ] ) ) );
			unwrapDelta.operations.push( new RemoveOperation( new Position( root, [ 1, 6 ] ), 1 ) );

			let reversed = unwrapDelta.getReversed();

			expect( reversed ).to.be.instanceof( WrapDelta );
			expect( reversed.operations.length ).to.equal( 2 );

			// WrapDelta which is an effect of reversing UnwrapDelta has ReinsertOperation instead of InsertOperation.
			// This is because we will "wrap" nodes into the element in which they were in the first place.
			// That element has been removed so we reinsert it from the graveyard.
			expect( reversed.operations[ 0 ] ).to.be.instanceof( ReinsertOperation );
			expect( reversed.operations[ 0 ].howMany ).to.equal( 1 );
			expect( reversed.operations[ 0 ].targetPosition.path ).to.deep.equal( [ 1, 6 ] );

			expect( reversed.operations[ 1 ] ).to.be.instanceof( MoveOperation );
			expect( reversed.operations[ 1 ].sourcePosition.path ).to.deep.equal( [ 1, 2 ] );
			expect( reversed.operations[ 1 ].howMany ).to.equal( 4 );
			expect( reversed.operations[ 1 ].targetPosition.path ).to.deep.equal( [ 1, 6, 0 ] );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( UnwrapDelta.className ).to.equal( 'engine.model.delta.UnwrapDelta' );
	} );
} );
