/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import Position from '../../../src/model/position';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import MergeDelta from '../../../src/model/delta/mergedelta';
import SplitDelta from '../../../src/model/delta/splitdelta';

import MoveOperation from '../../../src/model/operation/moveoperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';
import ReinsertOperation from '../../../src/model/operation/reinsertoperation';

import count from '@ckeditor/ckeditor5-utils/src/count';

describe( 'Batch', () => {
	let doc, root, p1, p2, batch;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		p1 = new Element( 'p', { key1: 'value1' }, new Text( 'foo' ) );
		p2 = new Element( 'p', { key2: 'value2' }, new Text( 'bar' ) );

		root.insertChildren( 0, [ p1, p2 ] );
	} );

	describe( 'merge', () => {
		it( 'should merge foo and bar into foobar', () => {
			doc.batch().merge( new Position( root, [ 1 ] ) );

			expect( root.maxOffset ).to.equal( 1 );
			expect( root.getChild( 0 ).name ).to.equal( 'p' );
			expect( root.getChild( 0 ).maxOffset ).to.equal( 6 );
			expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
			expect( root.getChild( 0 ).getAttribute( 'key1' ) ).to.equal( 'value1' );
			expect( root.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foobar' );
		} );

		it( 'should throw if there is no element after', () => {
			expect( () => {
				doc.batch().merge( new Position( root, [ 2 ] ) );
			} ).to.throw( CKEditorError, /^batch-merge-no-element-after/ );
		} );

		it( 'should throw if there is no element before', () => {
			expect( () => {
				doc.batch().merge( new Position( root, [ 0, 2 ] ) );
			} ).to.throw( CKEditorError, /^batch-merge-no-element-before/ );
		} );

		it( 'should be chainable', () => {
			batch = doc.batch();

			const chain = batch.merge( new Position( root, [ 1 ] ) );
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch = doc.batch().merge( new Position( root, [ 1 ] ) );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );
} );

describe( 'MergeDelta', () => {
	let mergeDelta, doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		mergeDelta = new MergeDelta();
	} );

	describe( 'constructor()', () => {
		it( 'should create merge delta with no operations added', () => {
			expect( mergeDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to merge', () => {
			expect( mergeDelta.type ).to.equal( 'merge' );
		} );
	} );

	describe( 'position', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( mergeDelta.position ).to.be.null;
		} );

		it( 'should be equal to the position between merged nodes', () => {
			mergeDelta.operations.push( new MoveOperation( new Position( root, [ 1, 2, 0 ] ), 4, new Position( root, [ 1, 1, 4 ] ) ) );
			mergeDelta.operations.push( new RemoveOperation( new Position( root, [ 1, 2, 0 ] ), 1, new Position( doc.graveyard, [ 0 ] ) ) );

			expect( mergeDelta.position.root ).to.equal( root );
			expect( mergeDelta.position.path ).to.deep.equal( [ 1, 2, 0 ] );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty SplitDelta if there are no operations in delta', () => {
			const reversed = mergeDelta.getReversed();

			expect( reversed ).to.be.instanceof( SplitDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct SplitDelta', () => {
			mergeDelta.operations.push( new MoveOperation( new Position( root, [ 1, 2, 0 ] ), 4, new Position( root, [ 1, 1, 4 ] ) ) );
			mergeDelta.operations.push( new RemoveOperation( new Position( root, [ 1, 2, 0 ] ), 1, new Position( doc.graveyard, [ 0 ] ) ) );

			const reversed = mergeDelta.getReversed();

			expect( reversed ).to.be.instanceof( SplitDelta );
			expect( reversed.operations.length ).to.equal( 2 );

			expect( reversed.operations[ 0 ] ).to.be.instanceof( ReinsertOperation );
			expect( reversed.operations[ 0 ].howMany ).to.equal( 1 );
			expect( reversed.operations[ 0 ].targetPosition.path ).to.deep.equal( [ 1, 2, 0 ] );

			expect( reversed.operations[ 1 ] ).to.be.instanceof( MoveOperation );
			expect( reversed.operations[ 1 ].sourcePosition.path ).to.deep.equal( [ 1, 1, 4 ] );
			expect( reversed.operations[ 1 ].howMany ).to.equal( 4 );
			expect( reversed.operations[ 1 ].targetPosition.path ).to.deep.equal( [ 1, 2, 0 ] );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( MergeDelta.className ).to.equal( 'engine.model.delta.MergeDelta' );
	} );
} );
