/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import Position from '../../../src/model/position';
import Range from '../../../src/model/range';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import WrapDelta from '../../../src/model/delta/wrapdelta';
import UnwrapDelta from '../../../src/model/delta/unwrapdelta';

import InsertOperation from '../../../src/model/operation/insertoperation';
import MoveOperation from '../../../src/model/operation/moveoperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';

describe( 'Batch', () => {
	let doc, root, range;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		root.insertChildren( 0, new Text( 'foobar' ) );

		range = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );
	} );

	describe( 'wrap', () => {
		it( 'should wrap flat range with given element', () => {
			const p = new Element( 'p' );
			doc.batch().wrap( range, p );

			expect( root.maxOffset ).to.equal( 5 );
			expect( root.getChild( 0 ).data ).to.equal( 'fo' );
			expect( root.getChild( 1 ) ).to.equal( p );
			expect( p.getChild( 0 ).data ).to.equal( 'ob' );
			expect( root.getChild( 2 ).data ).to.equal( 'ar' );
		} );

		it( 'should wrap flat range with an element of given name', () => {
			doc.batch().wrap( range, 'p' );

			expect( root.maxOffset ).to.equal( 5 );
			expect( root.getChild( 0 ).data ).to.equal( 'fo' );
			expect( root.getChild( 1 ).name ).to.equal( 'p' );
			expect( root.getChild( 1 ).getChild( 0 ).data ).to.equal( 'ob' );
			expect( root.getChild( 2 ).data ).to.equal( 'ar' );
		} );

		it( 'should throw if range to wrap is not flat', () => {
			root.insertChildren( 1, [ new Element( 'p', [], new Text( 'xyz' ) ) ] );
			const notFlatRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 6, 2 ] ) );

			expect( () => {
				doc.batch().wrap( notFlatRange, 'p' );
			} ).to.throw( CKEditorError, /^batch-wrap-range-not-flat/ );
		} );

		it( 'should throw if element to wrap with has children', () => {
			const p = new Element( 'p', [], new Text( 'a' ) );

			expect( () => {
				doc.batch().wrap( range, p );
			} ).to.throw( CKEditorError, /^batch-wrap-element-not-empty/ );
		} );

		it( 'should throw if element to wrap with has children', () => {
			const p = new Element( 'p' );
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

			const correctDeltaMatcher = sinon.match( operation => {
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
		root = doc.createRoot();
		wrapDelta = new WrapDelta();
	} );

	describe( 'constructor()', () => {
		it( 'should create wrap delta with no operations added', () => {
			expect( wrapDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to wrap', () => {
			expect( wrapDelta.type ).to.equal( 'wrap' );
		} );
	} );

	describe( 'range', () => {
		it( 'should be equal to null if there are no operations in delta', () => {
			expect( wrapDelta.range ).to.be.null;
		} );

		it( 'should be equal to wrapped range', () => {
			wrapDelta.operations.push( new InsertOperation( new Position( root, [ 1, 6 ] ), [], 1 ) );
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
			const howMany = 5;

			wrapDelta.operations.push( new InsertOperation( new Position( root, [ 1, 6 ] ), [], 1 ) );
			wrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), howMany, new Position( root, [ 1, 6, 0 ] ) ) );

			expect( wrapDelta.howMany ).to.equal( 5 );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty UnwrapDelta if there are no operations in delta', () => {
			const reversed = wrapDelta.getReversed();

			expect( reversed ).to.be.instanceof( UnwrapDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct UnwrapDelta', () => {
			wrapDelta.operations.push( new InsertOperation( new Position( root, [ 1, 6 ] ), new Element( 'p' ), 1 ) );
			wrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 5, new Position( root, [ 1, 6, 0 ] ) ) );

			const reversed = wrapDelta.getReversed();

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
			const insertOperation = new InsertOperation( new Position( root, [ 1, 6 ] ), [], 1 );

			wrapDelta.operations.push( insertOperation );
			wrapDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 5, new Position( root, [ 1, 6, 0 ] ) ) );

			expect( wrapDelta._insertOperation ).to.equal( insertOperation );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( WrapDelta.className ).to.equal( 'engine.model.delta.WrapDelta' );
	} );
} );

