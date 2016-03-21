/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Range from '/ckeditor5/core/treemodel/range.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

import WrapDelta from '/ckeditor5/core/treemodel/delta/wrapdelta.js';
import UnwrapDelta from '/ckeditor5/core/treemodel/delta/unwrapdelta.js';

import InsertOperation from '/ckeditor5/core/treemodel/operation/insertoperation.js';
import MoveOperation from '/ckeditor5/core/treemodel/operation/moveoperation.js';
import RemoveOperation from '/ckeditor5/core/treemodel/operation/removeoperation.js';

describe( 'Batch', () => {
	let doc, root, range;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		root.insertChildren( 0, 'foobar' );

		range = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );
	} );

	describe( 'wrap', () => {
		it( 'should wrap flat range with given element', () => {
			let p = new Element( 'p' );
			doc.batch().wrap( range, p );

			expect( root.getChildCount() ).to.equal( 5 );
			expect( root.getChild( 0 ).character ).to.equal( 'f' );
			expect( root.getChild( 1 ).character ).to.equal( 'o' );
			expect( root.getChild( 2 ) ).to.equal( p );
			expect( p.getChild( 0 ).character ).to.equal( 'o' );
			expect( p.getChild( 1 ).character ).to.equal( 'b' );
			expect( root.getChild( 3 ).character ).to.equal( 'a' );
			expect( root.getChild( 4 ).character ).to.equal( 'r' );
		} );

		it( 'should wrap flat range with an element of given name', () => {
			doc.batch().wrap( range, 'p' );

			expect( root.getChildCount() ).to.equal( 5 );
			expect( root.getChild( 0 ).character ).to.equal( 'f' );
			expect( root.getChild( 1 ).character ).to.equal( 'o' );
			expect( root.getChild( 2 ).name ).to.equal( 'p' );
			expect( root.getChild( 2 ).getChild( 0 ).character ).to.equal( 'o' );
			expect( root.getChild( 2 ).getChild( 1 ).character ).to.equal( 'b' );
			expect( root.getChild( 3 ).character ).to.equal( 'a' );
			expect( root.getChild( 4 ).character ).to.equal( 'r' );
		} );

		it( 'should throw if range to wrap is not flat', () => {
			root.insertChildren( 6, [ new Element( 'p', [], 'xyz' ) ] );
			let notFlatRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 6, 2 ] ) );

			expect( () => {
				doc.batch().wrap( notFlatRange, 'p' );
			} ).to.throw( CKEditorError, /^batch-wrap-range-not-flat/ );
		} );

		it( 'should throw if element to wrap with has children', () => {
			let p = new Element( 'p', [], 'a' );

			expect( () => {
				doc.batch().wrap( range, p );
			} ).to.throw( CKEditorError, /^batch-wrap-element-not-empty/ );
		} );

		it( 'should throw if element to wrap with has children', () => {
			let p = new Element( 'p' );
			root.insertChildren( 0, p );

			expect( () => {
				doc.batch().wrap( range, p );
			} ).to.throw( CKEditorError, /^batch-wrap-element-attached/ );
		} );

		it( 'should be chainable', () => {
			const batch = doc.batch();

			const chain = batch.wrap( range, 'p' );
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			const batch = doc.batch().wrap( range, 'p' );

			const correctDeltaMatcher = sinon.match( ( operation ) => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );
} );

describe( 'WrapDelta', () => {
	let wrapDelta, doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		wrapDelta = new WrapDelta();
	} );

	describe( 'constructor', () => {
		it( 'should create wrap delta with no operations added', () => {
			expect( wrapDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'range', () => {
		it( 'should be equal to null if there are no operations in delta', () => {
			expect( wrapDelta.range ).to.be.null;
		} );

		it( 'should be equal to wrapped range', () => {
			wrapDelta.operations.push( new InsertOperation( new Position( root, [ 1, 6 ] ), 1 ) );
			wrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 5, new Position( root, [ 1, 6, 0 ] ) ) );

			expect( wrapDelta.range.start.isEqual( new Position( root, [ 1, 1 ] ) ) ).to.be.true;
			expect( wrapDelta.range.end.isEqual( new Position( root, [ 1, 6 ] ) ) ).to.be.true;
		} );
	} );

	describe( 'howMany', () => {
		it( 'should be equal to 0 if there are no operations in delta', () => {
			expect( wrapDelta.howMany ).to.equal( 0 );
		} );

		it( 'should be equal to the number of wrapped elements', () => {
			let howMany = 5;

			wrapDelta.operations.push( new InsertOperation( new Position( root, [ 1, 6 ] ), 1 ) );
			wrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), howMany, new Position( root, [ 1, 6, 0 ] ) ) );

			expect( wrapDelta.howMany ).to.equal( 5 );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty UnwrapDelta if there are no operations in delta', () => {
			let reversed = wrapDelta.getReversed();

			expect( reversed ).to.be.instanceof( UnwrapDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct UnwrapDelta', () => {
			wrapDelta.operations.push( new InsertOperation( new Position( root, [ 1, 6 ] ), 1 ) );
			wrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 5, new Position( root, [ 1, 6, 0 ] ) ) );

			let reversed = wrapDelta.getReversed();

			expect( reversed ).to.be.instanceof( UnwrapDelta );
			expect( reversed.operations.length ).to.equal( 2 );

			expect( reversed.operations[ 0 ] ).to.be.instanceof( MoveOperation );
			expect( reversed.operations[ 0 ].sourcePosition.path ).to.deep.equal( [ 1, 1, 0 ] );
			expect( reversed.operations[ 0 ].howMany ).to.equal( 5 );
			expect( reversed.operations[ 0 ].targetPosition.path ).to.deep.equal( [ 1, 1 ] );

			expect( reversed.operations[ 1 ] ).to.be.instanceof( RemoveOperation );
			expect( reversed.operations[ 1 ].sourcePosition.path ).to.deep.equal( [ 1, 6 ] );
			expect( reversed.operations[ 1 ].howMany ).to.equal( 1 );
		} );
	} );

	describe( '_insertOperation', () => {
		it( 'should be null if there are no operations in the delta', () => {
			expect( wrapDelta._insertOperation ).to.be.null;
		} );

		it( 'should be equal to the first operation in the delta', () => {
			let insertOperation = new InsertOperation( new Position( root, [ 1, 6 ] ), 1 );

			wrapDelta.operations.push( insertOperation );
			wrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 5, new Position( root, [ 1, 6, 0 ] ) ) );

			expect( wrapDelta._insertOperation ).to.equal( insertOperation );
		} );
	} );
} );

