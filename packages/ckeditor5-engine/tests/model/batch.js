/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Batch from '../../src/model/batch';
import Delta from '../../src/model/delta/delta';
import InsertDelta from '../../src/model/delta/insertdelta';
import WeakInsertDelta from '../../src/model/delta/weakinsertdelta';

import Operation from '../../src/model/operation/operation';
import InsertOperation from '../../src/model/operation/insertoperation';
import MarkerOperation from '../../src/model/operation/markeroperation';

import Document from '../../src/model/document';
import DocumentFragment from '../../src/model/documentfragment';
import Element from '../../src/model/element';
import Text from '../../src/model/text';
import Position from '../../src/model/position';
import Range from '../../src/model/range';

import count from '@ckeditor/ckeditor5-utils/src/count';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import { stringify } from '../../src/dev-utils/model';
import { getNodesAndText } from '../../tests/model/_utils/utils';

describe( 'Batch', () => {
	describe( 'type', () => {
		it( 'should default to "default"', () => {
			const batch = new Batch( new Document() );

			expect( batch.type ).to.equal( 'default' );
		} );

		it( 'should be set to the value set in constructor', () => {
			const batch = new Batch( new Document(), 'ignore' );

			expect( batch.type ).to.equal( 'ignore' );
		} );
	} );

	describe( 'baseVersion', () => {
		it( 'should return base version of first delta from the batch', () => {
			const batch = new Batch( new Document() );
			const delta = new Delta();
			const operation = new Operation( 2 );
			delta.addOperation( operation );
			batch.addDelta( delta );

			expect( batch.baseVersion ).to.equal( 2 );
		} );

		it( 'should return null if there are no deltas in batch', () => {
			const batch = new Batch( new Document() );

			expect( batch.baseVersion ).to.be.null;
		} );
	} );

	describe( 'addDelta()', () => {
		it( 'should add delta to the batch', () => {
			const batch = new Batch( new Document() );
			const deltaA = new Delta();
			const deltaB = new Delta();
			batch.addDelta( deltaA );
			batch.addDelta( deltaB );

			expect( batch.deltas.length ).to.equal( 2 );
			expect( batch.deltas[ 0 ] ).to.equal( deltaA );
			expect( batch.deltas[ 1 ] ).to.equal( deltaB );
		} );
	} );

	describe( 'getOperations()', () => {
		it( 'should return collection of operations from all deltas', () => {
			const doc = new Document();
			const batch = new Batch( doc );
			const deltaA = new Delta();
			const deltaB = new Delta();
			const ops = [
				new Operation( doc.version ),
				new Operation( doc.version + 1 ),
				new Operation( doc.version + 2 )
			];

			batch.addDelta( deltaA );
			deltaA.addOperation( ops[ 0 ] );
			batch.addDelta( deltaB );
			deltaA.addOperation( ops[ 1 ] );
			deltaA.addOperation( ops[ 2 ] );

			expect( Array.from( batch.getOperations() ) ).to.deep.equal( ops );
			expect( batch.getOperations() ).to.have.property( 'next' );
		} );
	} );

	describe( 'createText()', () => {
		let doc, batch;

		beforeEach( () => {
			doc = new Document();
			batch = doc.batch();
		} );

		it( 'should create text node', () => {
			const text = batch.createText( 'foo' );

			expect( text ).to.instanceof( Text );
			expect( text.data ).to.equal( 'foo' );
			expect( Array.from( text.getAttributes() ) ).to.length( 0 );
		} );

		it( 'should create text with attributes', () => {
			const text = batch.createText( 'foo', { foo: 'bar', biz: 'baz' } );

			expect( Array.from( text.getAttributes() ) ).to.deep.equal( [ [ 'foo', 'bar' ], [ 'biz', 'baz' ] ] );
		} );
	} );

	describe( 'createElement()', () => {
		let doc, batch;

		beforeEach( () => {
			doc = new Document();
			batch = doc.batch();
		} );

		it( 'should create element', () => {
			const element = batch.createElement( 'foo' );

			expect( element ).to.instanceof( Element );
			expect( element.name ).to.equal( 'foo' );
			expect( Array.from( element.getAttributes() ) ).to.length( 0 );
		} );

		it( 'should create element with attributes', () => {
			const element = batch.createText( 'foo', { foo: 'bar', biz: 'baz' } );

			expect( Array.from( element.getAttributes() ) ).to.deep.equal( [ [ 'foo', 'bar' ], [ 'biz', 'baz' ] ] );
		} );
	} );

	describe( 'createDocumentFragment()', () => {
		let doc, batch;

		beforeEach( () => {
			doc = new Document();
			batch = doc.batch();
		} );

		it( 'should create element', () => {
			const element = batch.createDocumentFragment();

			expect( element ).to.instanceof( DocumentFragment );
		} );
	} );

	describe( 'insert()', () => {
		let doc, batch;

		beforeEach( () => {
			doc = new Document();
			batch = doc.batch();
		} );

		it( 'should insert node at given position', () => {
			const parent = batch.createDocumentFragment();
			const child = batch.createElement( 'child' );
			const textChild = batch.createText( 'textChild' );

			batch.insert( child, new Position( parent, [ 0 ] ) );
			batch.insert( textChild, new Position( parent, [ 1 ] ) );

			expect( Array.from( parent ) ).to.deep.equal( [ child, textChild ] );
		} );

		it( 'should insert node at the beginning of given element', () => {
			const parent = batch.createDocumentFragment();
			const child1 = batch.createElement( 'child' );
			const child2 = batch.createElement( 'child' );

			batch.insert( child1, parent );
			batch.insert( child2, parent );

			expect( Array.from( parent.getChildren() ) ).to.deep.equal( [ child2, child1 ] );
		} );

		it( 'should insert node at the end of given element', () => {
			const parent = batch.createDocumentFragment();
			const child1 = batch.createElement( 'child' );
			const child2 = batch.createElement( 'child' );

			batch.insert( child1, parent );
			batch.insert( child2, parent, 'end' );

			expect( Array.from( parent.getChildren() ) ).to.deep.equal( [ child1, child2 ] );
		} );

		it( 'should insert node at the given offset of given element', () => {
			const parent = batch.createDocumentFragment();
			const child1 = batch.createElement( 'child' );
			const child2 = batch.createElement( 'child' );
			const child3 = batch.createElement( 'child' );

			batch.insert( child3, parent );
			batch.insert( child1, parent );
			batch.insert( child2, parent, 1 );

			expect( Array.from( parent.getChildren() ) ).to.deep.equal( [ child1, child2, child3 ] );
		} );

		it( 'should insert node before the given node', () => {
			const parent = batch.createDocumentFragment();
			const child1 = batch.createElement( 'child' );
			const child2 = batch.createElement( 'child' );
			const child3 = batch.createElement( 'child' );

			batch.insert( child3, parent );
			batch.insert( child1, parent );
			batch.insert( child2, child3, 'before' );

			expect( Array.from( parent.getChildren() ) ).to.deep.equal( [ child1, child2, child3 ] );
		} );

		it( 'should insert node after the given node', () => {
			const parent = batch.createDocumentFragment();
			const child1 = batch.createElement( 'child' );
			const child2 = batch.createElement( 'child' );
			const child3 = batch.createElement( 'child' );

			batch.insert( child3, parent );
			batch.insert( child1, parent );
			batch.insert( child2, child1, 'after' );

			expect( Array.from( parent.getChildren() ) ).to.deep.equal( [ child1, child2, child3 ] );
		} );

		it( 'should create proper delta for inserting element', () => {
			const parent = batch.createDocumentFragment();
			const element = batch.createElement( 'child' );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.insert( element, parent );

			sinon.assert.calledOnce( spy );
			expect( spy.lastCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.lastCall.args[ 0 ].delta ).to.instanceof( InsertDelta );
			expect( spy.lastCall.args[ 0 ].delta ).to.not.instanceof( WeakInsertDelta );
			expect( spy.lastCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );

		it( 'should create proper delta for inserting text', () => {
			const parent = batch.createDocumentFragment();
			const text = batch.createText( 'child' );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.insert( text, parent );

			sinon.assert.calledOnce( spy );
			expect( spy.lastCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.lastCall.args[ 0 ].delta ).to.instanceof( WeakInsertDelta );
			expect( spy.lastCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within the same document (documentA -> documentA)', () => {
			const rootA = doc.createRoot();
			const parent1 = batch.createElement( 'parent' );
			const parent2 = batch.createElement( 'parent' );
			const node = batch.createText( 'foo' );

			batch.insert( node, parent1 );
			batch.insert( parent1, rootA );
			batch.insert( parent2, rootA );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.insert( node, parent2 );

			// Verify result.
			expect( Array.from( parent1.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( parent2.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify deltas and operations.
			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'move' );
			expect( spy.firstCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within the same document (documentA -> documentB)', () => {
			const rootA = doc.createRoot( '$root', 'A' );
			const rootB = doc.createRoot( '$root', 'B' );
			const node = batch.createText( 'foo' );

			batch.insert( node, rootA );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.insert( node, rootB );

			// Verify result.
			expect( Array.from( rootA.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( rootB.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify deltas and operations.
			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'move' );
			expect( spy.firstCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within the same document (docFragA -> docFragA)', () => {
			const docFragA = batch.createDocumentFragment();
			const parent1 = batch.createElement( 'parent' );
			const parent2 = batch.createElement( 'parent' );
			const node = batch.createText( 'foo' );

			batch.insert( node, parent1 );
			batch.insert( parent1, docFragA );
			batch.insert( parent2, docFragA );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.insert( node, parent2 );

			// Verify result.
			expect( Array.from( parent1.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( parent2.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify deltas and operations.
			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'move' );
			expect( spy.firstCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within different document (document -> docFrag)', () => {
			const root = doc.createRoot();
			const docFrag = batch.createDocumentFragment();
			const node = batch.createText( 'foo' );

			batch.insert( node, root );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.insert( node, docFrag );

			// Verify result.
			expect( Array.from( root.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( docFrag.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify deltas and operations.
			sinon.assert.calledTwice( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'remove' );
			expect( spy.firstCall.args[ 0 ].delta.batch ).to.equal( batch );
			expect( spy.secondCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.secondCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within different document (docFragA -> docFragB)', () => {
			const docFragA = batch.createDocumentFragment();
			const docFragB = batch.createDocumentFragment();
			const node = batch.createText( 'foo' );

			batch.insert( node, docFragA );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.insert( node, docFragB );

			// Verify result.
			expect( Array.from( docFragA ) ).to.deep.equal( [] );
			expect( Array.from( docFragB ) ).to.deep.equal( [ node ] );

			// Verify deltas and operations.
			sinon.assert.calledTwice( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'detach' );
			expect( spy.firstCall.args[ 0 ].delta.batch ).to.equal( batch );
			expect( spy.secondCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.secondCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );

		it.skip( 'should transfer markers from given DocumentFragment', () => {
			const documentFragment = batch.createDocumentFragment();
			const li = batch.createElement( 'li' );

			batch.insert( batch.createText( 'foo bar' ), li );
			batch.insert( li, documentFragment );

			const marker = new Range( new Position( documentFragment, [ 0, 1 ] ), new Position( documentFragment, [ 0, 5 ] ) );

			documentFragment.markers.set( 'marker', marker );

			batch.insert( documentFragment, new Position( root, [ 3, 0 ] ) );

			expect( Array.from( doc.markers ).length ).to.equal( 1 );
			expect( stringify( root, doc.markers.get( 'marker' ).getRange() ) ).to.equal( 'ab<p></p><ul><li>f[oo b]ar</li></ul>c' );
		} );

		it.skip( 'should set each marker as separate operation', () => {
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
	} );

	describe( 'insertText()', () => {
		let doc, batch;

		beforeEach( () => {
			doc = new Document();
			batch = doc.batch();
		} );

		it( 'should create and insert text node with attributes at given position', () => {
			const parent = batch.createDocumentFragment();

			batch.insertText( 'foo', { bar: 'biz' }, new Position( parent, [ 0 ] ) );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Text );
			expect( parent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'bar', 'biz' ] ] );
		} );

		it( 'should create and insert text node with no attributes at given position', () => {
			const parent = batch.createDocumentFragment();

			batch.insertText( 'foo', null, new Position( parent, [ 0 ] ) );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Text );
			expect( parent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create and insert text node omitting attributes param', () => {
			const parent = batch.createDocumentFragment();

			batch.insertText( 'foo', new Position( parent, [ 0 ] ) );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Text );
			expect( parent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create and insert text node at the beginning of given element', () => {
			const parent = batch.createDocumentFragment();

			batch.insert( batch.createElement( 'child' ), parent );

			batch.insertText( 'foo', parent );

			expect( parent.childCount ).to.equal( 2 );
			expect( parent.getChild( 0 ) ).to.instanceof( Text );
			expect( parent.getChild( 1 ) ).to.instanceof( Element );
		} );

		it( 'should create and insert text node at the end of given element', () => {
			const parent = batch.createDocumentFragment();

			batch.insert( batch.createElement( 'child' ), parent );

			batch.insertText( 'foo', parent, 'end' );

			expect( parent.childCount ).to.equal( 2 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 1 ) ).to.instanceof( Text );
		} );

		it( 'should create and insert text node at the given offset of given element', () => {
			const parent = batch.createDocumentFragment();

			batch.insert( batch.createElement( 'child' ), parent );
			batch.insert( batch.createElement( 'child' ), parent );

			batch.insertText( 'foo', parent, 1 );

			expect( parent.childCount ).to.equal( 3 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 1 ) ).to.instanceof( Text );
			expect( parent.getChild( 2 ) ).to.instanceof( Element );
		} );

		it( 'should create and insert text node before the given node', () => {
			const parent = batch.createDocumentFragment();
			const child1 = batch.createElement( 'child' );
			const child2 = batch.createElement( 'child' );

			batch.insert( child1, parent );
			batch.insert( child2, parent, 'end' );

			batch.insertText( 'foo', child2, 'before' );

			expect( parent.childCount ).to.equal( 3 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 1 ) ).to.instanceof( Text );
			expect( parent.getChild( 2 ) ).to.instanceof( Element );
		} );

		it( 'should create and insert text node after the given node', () => {
			const parent = batch.createDocumentFragment();
			const child1 = batch.createElement( 'child' );
			const child2 = batch.createElement( 'child' );

			batch.insert( child1, parent );
			batch.insert( child2, parent, 'end' );

			batch.insertText( 'foo', child1, 'after' );

			expect( parent.childCount ).to.equal( 3 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 1 ) ).to.instanceof( Text );
			expect( parent.getChild( 2 ) ).to.instanceof( Element );
		} );

		it( 'should create proper delta', () => {
			const parent = batch.createDocumentFragment();
			const spy = sinon.spy( doc, 'applyOperation' );

			batch.insertText( 'foo', parent );

			sinon.assert.calledOnce( spy );
			expect( spy.lastCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.lastCall.args[ 0 ].delta ).to.instanceof( WeakInsertDelta );
			expect( spy.lastCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );
	} );

	describe( 'insertElement()', () => {
		let doc, batch;

		beforeEach( () => {
			doc = new Document();
			batch = doc.batch();
		} );

		it( 'should create and insert element with attributes at given position', () => {
			const parent = batch.createDocumentFragment();

			batch.insertElement( 'foo', { bar: 'biz' }, new Position( parent, [ 0 ] ) );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'bar', 'biz' ] ] );
		} );

		it( 'should create and insert element with no attributes at given position', () => {
			const parent = batch.createDocumentFragment();

			batch.insertElement( 'foo', null, new Position( parent, [ 0 ] ) );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create and insert element with no attributes omitting attributes param', () => {
			const parent = batch.createDocumentFragment();

			batch.insertElement( 'foo', new Position( parent, [ 0 ] ) );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create and insert element at the beginning of given element', () => {
			const parent = batch.createDocumentFragment();

			batch.insert( batch.createElement( 'child' ), parent );

			batch.insertElement( 'foo', parent );

			expect( parent.childCount ).to.equal( 2 );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( parent.getChild( 1 ).name ).to.equal( 'child' );
		} );

		it( 'should create and insert element at the end of given element', () => {
			const parent = batch.createDocumentFragment();

			batch.insert( batch.createElement( 'child' ), parent );

			batch.insertElement( 'foo', parent, 'end' );

			expect( parent.childCount ).to.equal( 2 );
			expect( parent.getChild( 0 ).name ).to.equal( 'child' );
			expect( parent.getChild( 1 ).name ).to.equal( 'foo' );
		} );

		it( 'should create and insert element at the given offset of given element', () => {
			const parent = batch.createDocumentFragment();

			batch.insert( batch.createElement( 'child1' ), parent );
			batch.insert( batch.createElement( 'child2' ), parent, 'end' );

			batch.insertElement( 'foo', parent, 1 );

			expect( parent.childCount ).to.equal( 3 );
			expect( parent.getChild( 0 ).name ).to.equal( 'child1' );
			expect( parent.getChild( 1 ).name ).to.equal( 'foo' );
			expect( parent.getChild( 2 ).name ).to.equal( 'child2' );
		} );

		it( 'should create and insert element before the given node', () => {
			const parent = batch.createDocumentFragment();
			const child1 = batch.createElement( 'child1' );
			const child2 = batch.createElement( 'child2' );

			batch.insert( child1, parent );
			batch.insert( child2, parent, 'end' );

			batch.insertElement( 'foo', child2, 'before' );

			expect( parent.childCount ).to.equal( 3 );
			expect( parent.getChild( 0 ).name ).to.equal( 'child1' );
			expect( parent.getChild( 1 ).name ).to.equal( 'foo' );
			expect( parent.getChild( 2 ).name ).to.equal( 'child2' );
		} );

		it( 'should create and insert element after the given node', () => {
			const parent = batch.createDocumentFragment();
			const child1 = batch.createElement( 'child1' );
			const child2 = batch.createElement( 'child2' );

			batch.insert( child1, parent );
			batch.insert( child2, parent, 'end' );

			batch.insertElement( 'foo', child1, 'after' );

			expect( parent.childCount ).to.equal( 3 );
			expect( parent.getChild( 0 ).name ).to.equal( 'child1' );
			expect( parent.getChild( 1 ).name ).to.equal( 'foo' );
			expect( parent.getChild( 2 ).name ).to.equal( 'child2' );
		} );

		it( 'should create proper delta', () => {
			const parent = batch.createDocumentFragment();
			const spy = sinon.spy( doc, 'applyOperation' );

			batch.insertText( 'foo', parent );

			sinon.assert.calledOnce( spy );
			expect( spy.lastCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.lastCall.args[ 0 ].delta ).to.instanceof( InsertDelta );
			expect( spy.lastCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );
	} );

	describe( 'append()', () => {
		let doc, batch;

		beforeEach( () => {
			doc = new Document();
			batch = doc.batch();
		} );

		it( 'should insert element at the end of the parent', () => {
			const parent = doc.batch().createDocumentFragment();
			const childText = doc.batch().createText( 'foo' );
			const childElement = doc.batch().createElement( 'foo' );

			batch.append( childText, parent );
			batch.append( childElement, parent );

			expect( Array.from( parent ) ).to.deep.equal( [ childText, childElement ] );
		} );

		it( 'should create proper delta', () => {
			const parent = batch.createDocumentFragment();
			const text = batch.createText( 'foo' );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.append( text, parent );

			sinon.assert.calledOnce( spy );
			expect( spy.lastCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.lastCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within the same document (documentA -> documentA)', () => {
			const rootA = doc.createRoot();
			const parent1 = batch.createElement( 'parent' );
			const parent2 = batch.createElement( 'parent' );
			const node = batch.createText( 'foo' );

			batch.insert( node, parent1 );
			batch.insert( parent1, rootA );
			batch.insert( parent2, rootA );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.append( node, parent2 );

			// Verify result.
			expect( Array.from( parent1.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( parent2.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify deltas and operations.
			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'move' );
			expect( spy.firstCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within the same document (documentA -> documentB)', () => {
			const rootA = doc.createRoot( '$root', 'A' );
			const rootB = doc.createRoot( '$root', 'B' );
			const node = batch.createText( 'foo' );

			batch.insert( node, rootA );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.append( node, rootB );

			// Verify result.
			expect( Array.from( rootA.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( rootB.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify deltas and operations.
			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'move' );
			expect( spy.firstCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within the same document (docFragA -> docFragA)', () => {
			const docFragA = batch.createDocumentFragment();
			const parent1 = batch.createElement( 'parent' );
			const parent2 = batch.createElement( 'parent' );
			const node = batch.createText( 'foo' );

			batch.insert( node, parent1 );
			batch.insert( parent1, docFragA );
			batch.insert( parent2, docFragA );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.append( node, parent2 );

			// Verify result.
			expect( Array.from( parent1.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( parent2.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify deltas and operations.
			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'move' );
			expect( spy.firstCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within different document (document -> docFrag)', () => {
			const root = doc.createRoot();
			const docFrag = batch.createDocumentFragment();
			const node = batch.createText( 'foo' );

			batch.insert( node, root );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.append( node, docFrag );

			// Verify result.
			expect( Array.from( root.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( docFrag.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify deltas and operations.
			sinon.assert.calledTwice( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'remove' );
			expect( spy.firstCall.args[ 0 ].delta.batch ).to.equal( batch );
			expect( spy.secondCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.secondCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within different document (docFragA -> docFragB)', () => {
			const docFragA = batch.createDocumentFragment();
			const docFragB = batch.createDocumentFragment();
			const node = batch.createText( 'foo' );

			batch.insert( node, docFragA );

			const spy = sinon.spy( doc, 'applyOperation' );

			batch.append( node, docFragB );

			// Verify result.
			expect( Array.from( docFragA ) ).to.deep.equal( [] );
			expect( Array.from( docFragB ) ).to.deep.equal( [ node ] );

			// Verify deltas and operations.
			sinon.assert.calledTwice( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'detach' );
			expect( spy.firstCall.args[ 0 ].delta.batch ).to.equal( batch );
			expect( spy.secondCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.secondCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );
	} );

	describe( 'appendText()', () => {
		let doc, batch;

		beforeEach( () => {
			doc = new Document();
			batch = doc.batch();
		} );

		it( 'should create and insert text node with attributes at the end of the parent', () => {
			const parent = batch.createDocumentFragment();

			batch.appendText( 'foo', { bar: 'biz' }, parent );
			batch.appendText( 'bar', { biz: 'bar' }, parent );

			expect( parent.childCount ).to.equal( 2 );
			expect( parent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'bar', 'biz' ] ] );
			expect( parent.getChild( 1 ).data ).to.equal( 'bar' );
			expect( Array.from( parent.getChild( 1 ).getAttributes() ) ).to.deep.equal( [ [ 'biz', 'bar' ] ] );
		} );

		it( 'should create and insert text node with no attributes at the end of the parent', () => {
			const parent = batch.createDocumentFragment();

			batch.appendText( 'foo', null, parent );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Text );
			expect( parent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create and insert text node with no attributes omitting attributes param', () => {
			const parent = batch.createDocumentFragment();

			batch.appendText( 'foo', parent );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Text );
			expect( parent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create proper delta and operations', () => {
			const parent = batch.createDocumentFragment();
			const spy = sinon.spy( doc, 'applyOperation' );

			batch.appendText( 'foo', parent );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.firstCall.args[ 0 ].delta ).to.instanceof( WeakInsertDelta );
			expect( spy.firstCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );
	} );

	describe( 'appendElement()', () => {
		let doc, batch;

		beforeEach( () => {
			doc = new Document();
			batch = doc.batch();
		} );

		it( 'should create and insert element with attributes at the end of the parent', () => {
			const parent = batch.createDocumentFragment();

			batch.appendElement( 'foo', { bar: 'biz' }, parent );
			batch.appendElement( 'bar', { biz: 'bar' }, parent );

			expect( parent.childCount ).to.equal( 2 );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'bar', 'biz' ] ] );
			expect( parent.getChild( 1 ).name ).to.equal( 'bar' );
			expect( Array.from( parent.getChild( 1 ).getAttributes() ) ).to.deep.equal( [ [ 'biz', 'bar' ] ] );
		} );

		it( 'should create and insert element with no attributes at the end of the parent', () => {
			const parent = batch.createDocumentFragment();

			batch.appendElement( 'foo', null, parent );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create and insert element with no attributes omitting attributes param', () => {
			const parent = batch.createDocumentFragment();

			batch.appendElement( 'foo', parent );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create proper delta and operation', () => {
			const parent = batch.createDocumentFragment();
			const spy = sinon.spy( doc, 'applyOperation' );

			batch.appendElement( 'foo', parent );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.firstCall.args[ 0 ].delta ).to.instanceof( InsertDelta ).to.not.instanceof( WeakInsertDelta );
			expect( spy.firstCall.args[ 0 ].delta.batch ).to.equal( batch );
		} );
	} );

	describe( 'setAttribute() / removeAttribute()', () => {
		let batch, doc, root, spy;

		const correctDeltaMatcher = sinon.match( operation => {
			return operation.delta && operation.delta.batch && operation.delta.batch == batch;
		} );

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();
			batch = doc.batch();
		} );

		describe( 'change attribute on node', () => {
			let node, text;

			beforeEach( () => {
				node = batch.createElement( 'p', { a: 1 } );
				text = batch.createText( 'c', { a: 1 } );

				batch.append( node, root );
				batch.append( text, root );

				spy = sinon.spy( doc, 'applyOperation' );
			} );

			describe( 'setAttribute', () => {
				it( 'should create the attribute on element', () => {
					batch.setAttribute( node, 'b', 2 );
					expect( spy.callCount ).to.equal( 1 );
					expect( node.getAttribute( 'b' ) ).to.equal( 2 );
				} );

				it( 'should change the attribute of element', () => {
					batch.setAttribute( node, 'a', 2 );
					expect( spy.callCount ).to.equal( 1 );
					expect( node.getAttribute( 'a' ) ).to.equal( 2 );
				} );

				it( 'should create the attribute on text node', () => {
					batch.setAttribute( text, 'b', 2 );
					expect( spy.callCount ).to.equal( 1 );
					expect( root.getChild( 1 ).getAttribute( 'b' ) ).to.equal( 2 );
				} );

				it( 'should change the attribute of text node', () => {
					batch.setAttribute( text, 'a', 2 );
					expect( spy.callCount ).to.equal( 1 );
					expect( root.getChild( 1 ).getAttribute( 'a' ) ).to.equal( 2 );
				} );

				it( 'should do nothing if the attribute value is the same', () => {
					batch.setAttribute( node, 'a', 1 );
					expect( spy.callCount ).to.equal( 0 );
					expect( node.getAttribute( 'a' ) ).to.equal( 1 );
				} );

				it( 'should add delta to batch and operation to delta before applying operation', () => {
					batch.setAttribute( node, 'b', 2 );

					sinon.assert.calledWith( spy, correctDeltaMatcher );
				} );
			} );

			describe( 'removeAttribute', () => {
				it( 'should remove the attribute from element', () => {
					batch.removeAttribute( node, 'a' );
					expect( spy.callCount ).to.equal( 1 );
					expect( node.getAttribute( 'a' ) ).to.be.undefined;
				} );

				it( 'should remove the attribute from character', () => {
					batch.removeAttribute( text, 'a' );
					expect( spy.callCount ).to.equal( 1 );
					expect( root.getChild( 1 ).getAttribute( 'a' ) ).to.be.undefined;
				} );

				it( 'should do nothing if the attribute is not set', () => {
					batch.removeAttribute( node, 'b' );
					expect( spy.callCount ).to.equal( 0 );
				} );

				it( 'should add delta to batch and operation to delta before applying operation', () => {
					batch.removeAttribute( node, 'a' );

					sinon.assert.calledWith( spy, correctDeltaMatcher );
				} );
			} );
		} );

		describe( 'change attribute on range', () => {
			beforeEach( () => {
				const element = batch.createElement( 'e', { a: 2 } );

				batch.appendText( 'xxx', { a: 1 }, root );
				batch.appendText( 'xxx', root );
				batch.appendText( 'xxx', { a: 1 }, root );
				batch.appendText( 'xxx', { a: 2 }, root );
				batch.appendText( 'xxx', root );
				batch.appendText( 'xxx', { a: 1 }, root );
				batch.appendText( 'xxx', element );
				batch.append( element, root );
				batch.appendText( 'xxx', root );

				spy = sinon.spy( doc, 'applyOperation' );
			} );

			function getRange( startIndex, endIndex ) {
				return new Range(
					Position.createFromParentAndOffset( root, startIndex ),
					Position.createFromParentAndOffset( root, endIndex )
				);
			}

			function getChangesAttrsCount() {
				let totalNumber = 0;

				for ( const delta of batch.deltas ) {
					for ( const operation of delta.operations ) {
						if ( operation.range ) {
							totalNumber += count( operation.range.getItems( { singleCharacters: true } ) );
						}
					}
				}

				return totalNumber;
			}

			function getCompressedAttrs() {
				// default: 111---111222---1112------
				const range = Range.createIn( root );

				return Array.from( range.getItems( { singleCharacters: true } ) )
					.map( item => item.getAttribute( 'a' ) || '-' )
					.join( '' );
			}

			describe( 'setAttribute', () => {
				it( 'should set the attribute on the range', () => {
					batch.setAttribute( getRange( 3, 6 ), 'a', 3 );
					expect( spy.callCount ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 3 );
					expect( getCompressedAttrs() ).to.equal( '111333111222---1112------' );
				} );

				it( 'should split the operations if parts of the range have different attributes', () => {
					batch.setAttribute( getRange( 4, 14 ), 'a', 3 );
					expect( spy.callCount ).to.equal( 4 );
					expect( getChangesAttrsCount() ).to.equal( 10 );
					expect( getCompressedAttrs() ).to.equal( '111-3333333333-1112------' );
				} );

				it( 'should split the operations if parts of the part of the range have the attribute', () => {
					batch.setAttribute( getRange( 4, 14 ), 'a', 2 );
					expect( spy.callCount ).to.equal( 3 );
					expect( getChangesAttrsCount() ).to.equal( 7 );
					expect( getCompressedAttrs() ).to.equal( '111-2222222222-1112------' );
				} );

				it( 'should strip the range if the beginning have the attribute', () => {
					batch.setAttribute( getRange( 1, 5 ), 'a', 1 );
					expect( spy.callCount ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 2 );
					expect( getCompressedAttrs() ).to.equal( '11111-111222---1112------' );
				} );

				it( 'should strip the range if the ending have the attribute', () => {
					batch.setAttribute( getRange( 13, 17 ), 'a', 1 );
					expect( spy.callCount ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 2 );
					expect( getCompressedAttrs() ).to.equal( '111---111222-111112------' );
				} );

				it( 'should do nothing if the range has attribute', () => {
					batch.setAttribute( getRange( 0, 3 ), 'a', 1 );
					expect( spy.callCount ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not check range\'s start position node when creating operations', () => {
					const range = new Range(
						new Position( root, [ 18, 1 ] ),
						new Position( root, [ 19 ] )
					);

					batch.setAttribute( range, 'a', 1 );
					expect( spy.callCount ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 2 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112-11---' );
				} );

				it( 'should not change elements attribute if range contains closing tag', () => {
					const range = new Range(
						new Position( root, [ 18, 1 ] ),
						new Position( root, [ 21 ] )
					);

					batch.setAttribute( range, 'a', 1 );
					expect( spy.callCount ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 4 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112-1111-' );
				} );

				it( 'should not create an operation if the range contains only closing tag', () => {
					const range = new Range(
						new Position( root, [ 18, 3 ] ),
						new Position( root, [ 19 ] )
					);

					batch.setAttribute( range, 'a', 3 );
					expect( spy.callCount ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not create an operation if is collapsed', () => {
					batch.setAttribute( getRange( 3, 3 ), 'a', 1 );
					expect( spy.callCount ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should create a proper operations for the mixed range', () => {
					batch.setAttribute( getRange( 0, 20 ), 'a', 1 );
					expect( spy.callCount ).to.equal( 5 );
					expect( getChangesAttrsCount() ).to.equal( 14 );
					expect( getCompressedAttrs() ).to.equal( '11111111111111111111111--' );
				} );

				it( 'should add delta to batch and operation to delta before applying operation', () => {
					batch.setAttribute( getRange( 3, 6 ), 'a', 3 );

					expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
				} );
			} );

			describe( 'removeAttribute', () => {
				it( 'should remove the attribute on the range', () => {
					batch.removeAttribute( getRange( 0, 2 ), 'a' );
					expect( spy.callCount ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 2 );
					expect( getCompressedAttrs() ).to.equal( '--1---111222---1112------' );
				} );

				it( 'should split the operations if parts of the range have different attributes', () => {
					batch.removeAttribute( getRange( 7, 11 ), 'a' );
					expect( spy.callCount ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 4 );
					expect( getCompressedAttrs() ).to.equal( '111---1----2---1112------' );
				} );

				it( 'should split the operations if parts of the part of the range have no attribute', () => {
					batch.removeAttribute( getRange( 1, 7 ), 'a' );
					expect( spy.callCount ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 3 );
					expect( getCompressedAttrs() ).to.equal( '1------11222---1112------' );
				} );

				it( 'should strip the range if the beginning have no attribute', () => {
					batch.removeAttribute( getRange( 4, 12 ), 'a' );
					expect( spy.callCount ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 6 );
					expect( getCompressedAttrs() ).to.equal( '111------------1112------' );
				} );

				it( 'should strip the range if the ending have no attribute', () => {
					batch.removeAttribute( getRange( 7, 15 ), 'a' );
					expect( spy.callCount ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 5 );
					expect( getCompressedAttrs() ).to.equal( '111---1--------1112------' );
				} );

				it( 'should do nothing if the range has no attribute', () => {
					batch.removeAttribute( getRange( 4, 5 ), 'a' );
					expect( spy.callCount ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not check range\'s start position node when creating operations', () => {
					const range = new Range(
						new Position( root, [ 18, 3 ] ),
						new Position( root, [ 19 ] )
					);

					batch.removeAttribute( range, 'a' );
					expect( spy.callCount ).to.equal( 0 );
					expect( getChangesAttrsCount() ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not apply operation twice in the range contains opening and closing tags', () => {
					batch.removeAttribute( getRange( 18, 22 ), 'a' );
					expect( spy.callCount ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 1 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---111-------' );
				} );

				it( 'should not create an operation if range is collapsed', () => {
					batch.removeAttribute( getRange( 3, 3 ), 'a' );
					expect( spy.callCount ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should create a proper operations for the mixed range', () => {
					batch.removeAttribute( getRange( 3, 15 ), 'a' );
					expect( spy.callCount ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 6 );
					expect( getCompressedAttrs() ).to.equal( '111------------1112------' );
				} );

				it( 'should add delta to batch and operation to delta before applying operation', () => {
					batch.removeAttribute( getRange( 0, 2 ), 'a' );
					sinon.assert.calledWith( spy, correctDeltaMatcher );
				} );
			} );
		} );

		describe( 'change attribute on root element', () => {
			beforeEach( () => {
				spy = sinon.spy( doc, 'applyOperation' );
			} );

			describe( 'setAttribute', () => {
				it( 'should create the attribute on root', () => {
					batch.setAttribute( root, 'b', 2 );
					expect( spy.callCount ).to.equal( 1 );
					expect( root.getAttribute( 'b' ) ).to.equal( 2 );
				} );

				it( 'should change the attribute of root', () => {
					batch.setAttribute( root, 'a', 2 );
					expect( spy.callCount ).to.equal( 1 );
					expect( root.getAttribute( 'a' ) ).to.equal( 2 );
				} );

				it( 'should do nothing if the attribute value is the same', () => {
					batch.setAttribute( root, 'a', 1 );
					expect( spy.callCount ).to.equal( 1 );
					batch.setAttribute( root, 'a', 1 );
					expect( spy.callCount ).to.equal( 1 );
					expect( root.getAttribute( 'a' ) ).to.equal( 1 );
				} );
			} );

			describe( 'removeAttribute', () => {
				it( 'should remove the attribute from root', () => {
					batch.setAttribute( root, 'a', 1 );
					batch.removeAttribute( root, 'a' );

					expect( spy.callCount ).to.equal( 2 );
					expect( root.getAttribute( 'a' ) ).to.be.undefined;
				} );

				it( 'should do nothing if the attribute is not set', () => {
					batch.removeAttribute( root, 'b' );
					expect( spy.callCount ).to.equal( 0 );
				} );
			} );
		} );

		it( 'should not add empty delta to the batch', () => {
			const nodeA = new Element( 'p', { a: 1 } );
			const nodeB = new Element( 'p', { b: 2 } );
			root.insertChildren( 0, [ nodeA, nodeB ] );

			batch.setAttribute( nodeA, 'a', 1 );

			expect( batch.deltas.length ).to.equal( 0 );

			batch.removeAttribute( Range.createIn( root ), 'x' );

			expect( batch.deltas.length ).to.equal( 0 );
		} );
	} );

	describe( 'setAttributes()', () => {
		let doc, batch, frag, item;

		beforeEach( () => {
			doc = new Document();
			batch = doc.batch();

			frag = batch.createDocumentFragment();
			item = batch.createText( 'xxx', { b: 2, c: 3 } );

			batch.appendText( 'xxx', { a: 1 }, frag );
			batch.append( item, frag );
		} );

		it( 'should set attributes one by one on range', () => {
			const range = Range.createIn( frag );

			// `setAttribute` is a not trivial operation and is deeply tested above, there is no point to duplicate
			// such a big amount of the same tests, so let's use a spy here.
			const spy = sinon.spy( batch, 'setAttribute' );

			batch.setAttributes( range, { a: 3, c: null } );

			// Verify result.
			expect( Array.from( frag.getChild( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'a', 3 ] ] );
			expect( Array.from( frag.getChild( 1 ).getAttributes() ) ).to.deep.equal( [ [ 'b', 2 ], [ 'a', 3 ] ] );

			// Verify operations
			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy.firstCall, range, 'a', 3 );
			sinon.assert.calledWith( spy.secondCall, range, 'c', null );
		} );

		it( 'should set attributes one by one on range for map as attributes list', () => {
			const range = Range.createIn( frag );

			// `setAttribute` is a not trivial operation and is deeply tested above, there is no point to duplicate
			// such a big amount of the same tests, so let's use a spy here.
			const spy = sinon.spy( batch, 'setAttribute' );

			batch.setAttributes( range, new Map( [ [ 'a', 3 ], [ 'c', null ] ] ) );

			// Verify result.
			expect( Array.from( frag.getChild( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'a', 3 ] ] );
			expect( Array.from( frag.getChild( 1 ).getAttributes() ) ).to.deep.equal( [ [ 'b', 2 ], [ 'a', 3 ] ] );

			// Verify operations
			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy.firstCall, range, 'a', 3 );
			sinon.assert.calledWith( spy.secondCall, range, 'c', null );
		} );

		it( 'should set attributes one by one on item', () => {
			// `setAttribute` is a not trivial operation and is deeply tested above, there is no point to duplicate
			// such a big amount of the same tests, so let's use a spy here.
			const spy = sinon.spy( batch, 'setAttribute' );

			batch.setAttributes( item, { a: 3, c: null } );

			// Verify result.
			expect( Array.from( item.getAttributes() ) ).to.deep.equal( [ [ 'b', 2 ], [ 'a', 3 ] ] );

			// Verify operations
			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy.firstCall, item, 'a', 3 );
			sinon.assert.calledWith( spy.secondCall, item, 'c', null );
		} );

		it( 'should set attributes one by one on item for maps as attributes list', () => {
			// `setAttribute` is a not trivial operation and is deeply tested above, there is no point to duplicate
			// such a big amount of the same tests, so let's use a spy here.
			const spy = sinon.spy( batch, 'setAttribute' );

			batch.setAttributes( item, new Map( [ [ 'a', 3 ], [ 'c', null ] ] ) );

			// Verify result.
			expect( Array.from( item.getAttributes() ) ).to.deep.equal( [ [ 'b', 2 ], [ 'a', 3 ] ] );

			// Verify operations
			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy.firstCall, item, 'a', 3 );
			sinon.assert.calledWith( spy.secondCall, item, 'c', null );
		} );
	} );

	describe( 'merge()', () => {
		let doc, root, p1, p2;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			p1 = new Element( 'p', { key1: 'value1' }, new Text( 'foo' ) );
			p2 = new Element( 'p', { key2: 'value2' }, new Text( 'bar' ) );

			root.insertChildren( 0, [ p1, p2 ] );
		} );

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
	} );

	describe( 'move()', () => {
		let doc, root, range, div, p, batch;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			div = new Element( 'div', [], new Text( 'foobar' ) );
			p = new Element( 'p', [], new Text( 'abcxyz' ) );

			div.insertChildren( 0, [ new Element( 'p', [], new Text( 'gggg' ) ) ] );
			div.insertChildren( 2, [ new Element( 'p', [], new Text( 'hhhh' ) ) ] );

			root.insertChildren( 0, [ div, p ] );

			range = new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 0, 7 ] ) );

			batch = doc.batch();
		} );

		it( 'should move flat range of nodes', () => {
			batch.move( range, new Position( root, [ 1, 3 ] ) );

			expect( getNodesAndText( Range.createIn( root.getChild( 0 ) ) ) ).to.equal( 'PggggPfoPhhhhP' );
			expect( getNodesAndText( Range.createIn( root.getChild( 1 ) ) ) ).to.equal( 'abcobarxyz' );
		} );

		it( 'should throw if object to move is not a range', () => {
			expect( () => {
				doc.batch().move( root.getChild( 0 ), new Position( root, [ 1, 3 ] ) );
			} ).to.throw( CKEditorError, /^batch-move-invalid-range/ );
		} );

		it( 'should throw if given range is not flat', () => {
			const notFlatRange = new Range( new Position( root, [ 0, 2, 2 ] ), new Position( root, [ 0, 6 ] ) );

			expect( () => {
				doc.batch().move( notFlatRange, new Position( root, [ 1, 3 ] ) );
			} ).to.throw( CKEditorError, /^batch-move-range-not-flat/ );
		} );

		it( 'should throw if range is going to be moved to the other document', () => {
			const docFrag = batch.createDocumentFragment();

			expect( () => {
				doc.batch().move( range, docFrag );
			} ).to.throw( CKEditorError, /^batch-move-different-document/ );
		} );
	} );

	describe( 'remove()', () => {
		let doc, batch, div, p, range;

		beforeEach( () => {
			doc = new Document();
			batch = doc.batch();

			div = batch.createElement( 'div' );
			batch.appendText( 'foobar', div );

			p = batch.createElement( 'p' );
			batch.appendText( 'abcxyz', p );

			batch.insertElement( 'p', div );
			batch.appendElement( 'p', div );

			batch.insertText( 'gggg', new Position( div, [ 0, 0 ] ) );
			batch.insertText( 'hhhh', new Position( div, [ 7, 0 ] ) );
		} );

		describe( 'remove from document', () => {
			let root;

			beforeEach( () => {
				root = doc.createRoot();
				batch.append( div, root );
				batch.append( p, root );

				// Reset batch.
				batch = doc.batch();

				// Range starts in ROOT > DIV > P > gg|gg.
				// Range ends in ROOT > DIV > ...|ar.
				range = new Range( new Position( root, [ 0, 0, 2 ] ), new Position( root, [ 0, 5 ] ) );
			} );

			it( 'should remove specified node', () => {
				batch.remove( div );

				expect( root.maxOffset ).to.equal( 1 );
				expect( root.childCount ).to.equal( 1 );
				expect( getNodesAndText( Range.createIn( root.getChild( 0 ) ) ) ).to.equal( 'abcxyz' );
			} );

			it( 'should remove specified text node', () => {
				batch.remove( p.getChild( 0 ) );

				expect( getNodesAndText( Range.createOn( p ) ) ).to.equal( 'PP' );
			} );

			it( 'should remove any range of nodes', () => {
				batch.remove( range );

				expect( getNodesAndText( Range.createIn( root.getChild( 0 ) ) ) ).to.equal( 'PggParPhhhhP' );
				expect( getNodesAndText( Range.createIn( root.getChild( 1 ) ) ) ).to.equal( 'abcxyz' );
			} );

			it( 'should create minimal number of remove deltas, each with only one operation', () => {
				batch.remove( range );

				expect( batch.deltas.length ).to.equal( 2 );
				expect( batch.deltas[ 0 ].operations.length ).to.equal( 1 );
				expect( batch.deltas[ 1 ].operations.length ).to.equal( 1 );
			} );

			it( 'should use RemoveOperation', () => {
				batch.remove( div );

				expect( batch.deltas[ 0 ].operations[ 0 ].type ).to.equal( 'remove' );
			} );
		} );

		describe( 'remove from document fragment', () => {
			let frag;

			beforeEach( () => {
				frag = batch.createDocumentFragment();
				batch.append( div, frag );
				batch.append( p, frag );

				// Reset batch.
				batch = doc.batch();

				// Range starts in FRAG > DIV > P > gg|gg.
				// Range ends in FRAG > DIV > ...|ar.
				range = new Range( new Position( frag, [ 0, 0, 2 ] ), new Position( frag, [ 0, 5 ] ) );
			} );

			it( 'should remove specified node', () => {
				batch.remove( div );

				expect( frag.maxOffset ).to.equal( 1 );
				expect( frag.childCount ).to.equal( 1 );
				expect( getNodesAndText( Range.createIn( frag.getChild( 0 ) ) ) ).to.equal( 'abcxyz' );
			} );

			it( 'should remove specified text node', () => {
				batch.remove( p.getChild( 0 ) );

				expect( getNodesAndText( Range.createOn( p ) ) ).to.equal( 'PP' );
			} );

			it( 'should remove any range of nodes', () => {
				batch.remove( range );

				expect( getNodesAndText( Range.createIn( frag.getChild( 0 ) ) ) ).to.equal( 'PggParPhhhhP' );
				expect( getNodesAndText( Range.createIn( frag.getChild( 1 ) ) ) ).to.equal( 'abcxyz' );
			} );

			it( 'should create minimal number of remove deltas, each with only one operation', () => {
				batch.remove( range );

				expect( batch.deltas.length ).to.equal( 2 );
				expect( batch.deltas[ 0 ].operations.length ).to.equal( 1 );
				expect( batch.deltas[ 1 ].operations.length ).to.equal( 1 );
			} );

			it( 'should use DetachOperation', () => {
				batch.remove( div );

				expect( batch.deltas[ 0 ].operations[ 0 ].type ).to.equal( 'detach' );
			} );
		} );
	} );

	describe( 'rename()', () => {
		let doc, root, batch;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			const p = new Element( 'p', null, new Text( 'abc' ) );
			root.appendChildren( p );

			batch = doc.batch();

			batch.rename( p, 'h' );
		} );

		it( 'should rename given element', () => {
			expect( root.maxOffset ).to.equal( 1 );
			expect( root.getChild( 0 ) ).to.have.property( 'name', 'h' );
		} );

		it( 'should throw if not an Element instance is passed', () => {
			expect( () => {
				batch.rename( new Text( 'abc' ), 'h' );
			} ).to.throw( CKEditorError, /^batch-rename-not-element-instance/ );
		} );
	} );

	describe( 'split()', () => {
		let doc, root, p;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			p = new Element( 'p', { key: 'value' }, new Text( 'foobar' ) );

			root.insertChildren( 0, p );
		} );

		it( 'should split foobar to foo and bar', () => {
			doc.batch().split( new Position( root, [ 0, 3 ] ) );

			expect( root.maxOffset ).to.equal( 2 );

			expect( root.getChild( 0 ).name ).to.equal( 'p' );
			expect( root.getChild( 0 ).maxOffset ).to.equal( 3 );
			expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
			expect( root.getChild( 0 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );

			expect( root.getChild( 1 ).name ).to.equal( 'p' );
			expect( root.getChild( 1 ).maxOffset ).to.equal( 3 );
			expect( count( root.getChild( 1 ).getAttributes() ) ).to.equal( 1 );
			expect( root.getChild( 1 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 1 ).getChild( 0 ).data ).to.equal( 'bar' );
		} );

		it( 'should create an empty paragraph if we split at the end', () => {
			doc.batch().split( new Position( root, [ 0, 6 ] ) );

			expect( root.maxOffset ).to.equal( 2 );

			expect( root.getChild( 0 ).name ).to.equal( 'p' );
			expect( root.getChild( 0 ).maxOffset ).to.equal( 6 );
			expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
			expect( root.getChild( 0 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foobar' );

			expect( root.getChild( 1 ).name ).to.equal( 'p' );
			expect( root.getChild( 1 ).maxOffset ).to.equal( 0 );
			expect( count( root.getChild( 1 ).getAttributes() ) ).to.equal( 1 );
			expect( root.getChild( 1 ).getAttribute( 'key' ) ).to.equal( 'value' );
		} );

		it( 'should throw if we try to split a root', () => {
			expect( () => {
				doc.batch().split( new Position( root, [ 0 ] ) );
			} ).to.throw( CKEditorError, /^batch-split-root/ );
		} );
	} );

	describe( 'wrap()', () => {
		let doc, root, range;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			root.insertChildren( 0, new Text( 'foobar' ) );

			range = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );
		} );

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

		it( 'should throw if element to wrap with has children #1', () => {
			const p = new Element( 'p', [], new Text( 'a' ) );

			expect( () => {
				doc.batch().wrap( range, p );
			} ).to.throw( CKEditorError, /^batch-wrap-element-not-empty/ );
		} );

		it( 'should throw if element to wrap with has children #2', () => {
			const p = new Element( 'p' );
			root.insertChildren( 0, p );

			expect( () => {
				doc.batch().wrap( range, p );
			} ).to.throw( CKEditorError, /^batch-wrap-element-attached/ );
		} );
	} );

	describe( 'unwrap()', () => {
		let doc, root, p;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();

			p = new Element( 'p', [], new Text( 'xyz' ) );
			root.insertChildren( 0, [ new Text( 'a' ), p, new Text( 'b' ) ] );
		} );

		it( 'should unwrap given element', () => {
			doc.batch().unwrap( p );

			expect( root.maxOffset ).to.equal( 5 );
			expect( root.getChild( 0 ).data ).to.equal( 'axyzb' );
		} );

		it( 'should throw if element to unwrap has no parent', () => {
			const element = new Element( 'p' );

			expect( () => {
				doc.batch().unwrap( element );
			} ).to.throw( CKEditorError, /^batch-unwrap-element-no-parent/ );
		} );
	} );

	describe( 'setMarker()', () => {
		let doc, root, range;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();
			root.appendChildren( new Text( 'foo' ) );
			range = Range.createIn( root );
		} );

		it( 'should add marker to the document marker collection', () => {
			doc.batch().setMarker( 'name', range );

			expect( doc.markers.get( 'name' ).getRange().isEqual( range ) ).to.be.true;
		} );

		it( 'should update marker in the document marker collection', () => {
			doc.batch().setMarker( 'name', range );

			const range2 = Range.createFromParentsAndOffsets( root, 0, root, 0 );
			doc.batch().setMarker( 'name', range2 );

			expect( doc.markers.get( 'name' ).getRange().isEqual( range2 ) ).to.be.true;
		} );

		it( 'should accept marker instance', () => {
			doc.batch().setMarker( 'name', range );
			const marker = doc.markers.get( 'name' );
			const range2 = Range.createFromParentsAndOffsets( root, 0, root, 0 );

			const batch = doc.batch();
			batch.setMarker( marker, range2 );
			const op = batch.deltas[ 0 ].operations[ 0 ];

			expect( doc.markers.get( 'name' ).getRange().isEqual( range2 ) ).to.be.true;
			expect( op.oldRange.isEqual( range ) ).to.be.true;
			expect( op.newRange.isEqual( range2 ) ).to.be.true;
		} );

		it( 'should accept empty range parameter if marker instance is passed', () => {
			const marker = doc.markers.set( 'name', range );

			sinon.spy( doc, 'fire' );

			doc.on( 'change', ( evt, type, changes ) => {
				if ( type == 'marker' ) {
					expect( changes.type ).to.equal( 'set' );
					expect( changes.name ).to.equal( 'name' );
				}
			} );

			const batch = doc.batch();
			batch.setMarker( marker );
			const op = batch.deltas[ 0 ].operations[ 0 ];

			expect( doc.fire.calledWith( 'change', 'marker' ) ).to.be.true;
			expect( op.oldRange ).to.be.null;
			expect( op.newRange.isEqual( range ) ).to.be.true;
		} );

		it( 'should throw if marker with given name does not exist and range is not passed', () => {
			expect( () => {
				doc.batch().setMarker( 'name' );
			} ).to.throw( CKEditorError, /^batch-setMarker-no-range/ );
		} );
	} );

	describe( 'removeMarker()', () => {
		let doc, root, range;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot();
			root.appendChildren( new Text( 'foo' ) );
			range = Range.createIn( root );
		} );

		it( 'should remove marker from the document marker collection', () => {
			doc.batch().setMarker( 'name', range );
			doc.batch().removeMarker( 'name' );

			expect( doc.markers.get( 'name' ) ).to.be.null;
		} );

		it( 'should throw when trying to remove non existing marker', () => {
			expect( () => {
				doc.batch().removeMarker( 'name' );
			} ).to.throw( CKEditorError, /^batch-removeMarker-no-marker/ );
		} );

		it( 'should accept marker instance', () => {
			doc.batch().setMarker( 'name', range );
			const marker = doc.markers.get( 'name' );

			doc.batch().removeMarker( marker );

			expect( doc.markers.get( 'name' ) ).to.be.null;
		} );
	} );
} );
