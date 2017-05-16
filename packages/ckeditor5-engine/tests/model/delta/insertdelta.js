/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import Element from '../../../src/model/element';
import DocumentFragment from '../../../src/model/documentfragment';
import Text from '../../../src/model/text';
import Position from '../../../src/model/position';
import Range from '../../../src/model/range';

import InsertOperation from '../../../src/model/operation/insertoperation';
import MarkerOperation from '../../../src/model/operation/markeroperation';
import InsertDelta from '../../../src/model/delta/insertdelta';

import RemoveDelta from '../../../src/model/delta/removedelta';
import RemoveOperation from '../../../src/model/operation/removeoperation';

import { stringify } from '../../../src/dev-utils/model';

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
			expect( root.childCount ).to.equal( 4 );
			expect( root.maxOffset ).to.equal( 5 );
			expect( root.getChild( 1 ) ).to.equal( p );
			expect( root.getChild( 2 ) ).to.equal( ul );
		} );

		it( 'should be chainable', () => {
			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.insert( new Position( root, [ 2 ] ), [ p, ul ] );

			const correctDeltaMatcher = sinon.match( operation => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );

		it( 'should transfer markers from given DocumentFragment', () => {
			const documentFragment = new DocumentFragment( [ new Element( 'li', null, [ new Text( 'foo bar' ) ] ) ] );
			const marker = new Range( new Position( documentFragment, [ 0, 1 ] ), new Position( documentFragment, [ 0, 5 ] ) );

			documentFragment.markers.set( 'marker', marker );

			batch.insert( new Position( root, [ 3, 0 ] ), documentFragment );

			expect( Array.from( doc.markers ).length ).to.equal( 1 );
			expect( stringify( root, doc.markers.get( 'marker' ).getRange() ) ).to.equal( 'ab<p></p><ul><li>f[oo b]ar</li></ul>c' );
		} );

		it( 'should set each marker as separate operation', () => {
			sinon.spy( doc, 'applyOperation' );

			const documentFragment = new DocumentFragment( [ new Element( 'li', null, [ new Text( 'foo bar' ) ] ) ] );
			const marker1 = new Range( new Position( documentFragment, [ 0, 1 ] ), new Position( documentFragment, [ 0, 2 ] ) );
			const marker2 = new Range( new Position( documentFragment, [ 0, 5 ] ), new Position( documentFragment, [ 0, 6 ] ) );

			documentFragment.markers.set( 'marker1', marker1 );
			documentFragment.markers.set( 'marker2', marker2 );

			batch.insert( new Position( root, [ 3, 0 ] ), documentFragment );

			expect( doc.applyOperation.calledThrice );
			expect( doc.applyOperation.firstCall.calledWith( sinon.match( operation => operation instanceof InsertOperation ) ) );
			expect( doc.applyOperation.secondCall.calledWith( sinon.match( operation => operation instanceof MarkerOperation ) ) );
			expect( doc.applyOperation.thirdCall.calledWith( sinon.match( operation => operation instanceof MarkerOperation ) ) );
		} );

		it( 'should not create a delta and an operation if no nodes were inserted', () => {
			sinon.spy( doc, 'applyOperation' );

			batch = doc.batch();

			batch.insert( new Position( root, [ 0 ] ), [] );

			expect( batch.deltas.length ).to.equal( 0 );
			expect( doc.applyOperation.called ).to.be.false;
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

	describe( 'constructor()', () => {
		it( 'should create insert delta with no operations added', () => {
			expect( insertDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to insert', () => {
			expect( insertDelta.type ).to.equal( 'insert' );
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
			const elementX = new Element( 'x' );
			insertDelta.operations.push( new InsertOperation( new Position( root, [ 1, 2, 3 ] ), elementX, 0 ) );

			expect( insertDelta.nodes.length ).to.equal( 1 );
			expect( insertDelta.nodes.getNode( 0 ) ).to.equal( elementX );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty RemoveDelta if there are no operations in delta', () => {
			const reversed = insertDelta.getReversed();

			expect( reversed ).to.be.instanceof( RemoveDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct RemoveDelta', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const elementX = new Element( 'x' );
			insertDelta.operations.push( new InsertOperation( position, elementX, 0 ) );

			const reversed = insertDelta.getReversed();

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
