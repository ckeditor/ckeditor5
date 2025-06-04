/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../src/model/model.js';
import Writer from '../../src/model/writer.js';
import Batch from '../../src/model/batch.js';
import InsertOperation from '../../src/model/operation/insertoperation.js';

import DocumentFragment from '../../src/model/documentfragment.js';
import Element from '../../src/model/element.js';
import Text from '../../src/model/text.js';
import Position from '../../src/model/position.js';
import Range from '../../src/model/range.js';

import count from '@ckeditor/ckeditor5-utils/src/count.js';

import { getNodesAndText } from '../../tests/model/_utils/utils.js';
import DocumentSelection from '../../src/model/documentselection.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'Writer', () => {
	let model, doc, batch;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		model = new Model();
		batch = new Batch();

		doc = model.document;
	} );

	describe( 'constructor()', () => {
		let writer;

		beforeEach( () => {
			writer = new Writer( model, batch );
		} );

		it( 'should have model instance', () => {
			expect( writer.model ).to.instanceof( Model );
		} );

		it( 'should have batch instance', () => {
			expect( writer.batch ).to.instanceof( Batch );
		} );
	} );

	describe( 'createText()', () => {
		it( 'should create text node', () => {
			const text = createText( 'foo' );

			expect( text ).to.instanceof( Text );
			expect( text.data ).to.equal( 'foo' );
			expect( Array.from( text.getAttributes() ) ).to.length( 0 );
		} );

		it( 'should create text with attributes', () => {
			const text = createText( 'foo', { foo: 'bar', biz: 'baz' } );

			expect( Array.from( text.getAttributes() ) ).to.deep.equal( [ [ 'foo', 'bar' ], [ 'biz', 'baz' ] ] );
		} );
	} );

	describe( 'createElement()', () => {
		it( 'should create element', () => {
			const element = createElement( 'foo' );

			expect( element ).to.instanceof( Element );
			expect( element.name ).to.equal( 'foo' );
			expect( Array.from( element.getAttributes() ) ).to.length( 0 );
		} );

		it( 'should create element with attributes', () => {
			const element = createText( 'foo', { foo: 'bar', biz: 'baz' } );

			expect( Array.from( element.getAttributes() ) ).to.deep.equal( [ [ 'foo', 'bar' ], [ 'biz', 'baz' ] ] );
		} );
	} );

	describe( 'createDocumentFragment()', () => {
		it( 'should create element', () => {
			const element = createDocumentFragment();

			expect( element ).to.instanceof( DocumentFragment );
		} );
	} );

	describe( 'cloneElement()', () => {
		it( 'should make deep copy of element', () => {
			const element = createElement( 'foo', { 'abc': '123' } );

			insertElement( createElement( 'bar', { 'xyz': '789' } ), element );

			const clonedElement = cloneElement( element );

			expect( clonedElement ).to.not.equal( element );
			expect( clonedElement.getChild( 0 ) ).to.not.equal( element.getChild( 0 ) );
			expect( clonedElement.toJSON() ).to.deep.equal( element.toJSON() );
		} );

		it( 'should make shallow copy of element', () => {
			const element = createElement( 'foo', { 'abc': '123' } );

			insertElement( createElement( 'bar', { 'xyz': '789' } ), element );

			const elementJson = element.toJSON();
			delete elementJson.children;

			const clonedElement = cloneElement( element, false );

			expect( clonedElement ).to.not.equal( element );
			expect( clonedElement.childCount ).to.equal( 0 );
			expect( clonedElement.toJSON() ).to.deep.equal( elementJson );
		} );
	} );

	describe( 'insert()', () => {
		it( 'should insert node at given position', () => {
			const parent = createDocumentFragment();
			const child = createElement( 'child' );
			const textChild = createText( 'textChild' );

			insert( child, new Position( parent, [ 0 ] ) );
			insert( textChild, new Position( parent, [ 1 ] ) );

			expect( Array.from( parent ) ).to.deep.equal( [ child, textChild ] );
		} );

		it( 'should insert node at the beginning of given element', () => {
			const parent = createDocumentFragment();
			const child1 = createElement( 'child' );
			const child2 = createElement( 'child' );

			insert( child1, parent );
			insert( child2, parent );

			expect( Array.from( parent.getChildren() ) ).to.deep.equal( [ child2, child1 ] );
		} );

		it( 'should insert node at the end of given element', () => {
			const parent = createDocumentFragment();
			const child1 = createElement( 'child' );
			const child2 = createElement( 'child' );

			insert( child1, parent );
			insert( child2, parent, 'end' );

			expect( Array.from( parent.getChildren() ) ).to.deep.equal( [ child1, child2 ] );
		} );

		it( 'should insert node at the given offset of given element', () => {
			const parent = createDocumentFragment();
			const child1 = createElement( 'child' );
			const child2 = createElement( 'child' );
			const child3 = createElement( 'child' );

			insert( child3, parent );
			insert( child1, parent );
			insert( child2, parent, 1 );

			expect( Array.from( parent.getChildren() ) ).to.deep.equal( [ child1, child2, child3 ] );
		} );

		it( 'should insert node before the given node', () => {
			const parent = createDocumentFragment();
			const child1 = createElement( 'child' );
			const child2 = createElement( 'child' );
			const child3 = createElement( 'child' );

			insert( child3, parent );
			insert( child1, parent );
			insert( child2, child3, 'before' );

			expect( Array.from( parent.getChildren() ) ).to.deep.equal( [ child1, child2, child3 ] );
		} );

		it( 'should insert node after the given node', () => {
			const parent = createDocumentFragment();
			const child1 = createElement( 'child' );
			const child2 = createElement( 'child' );
			const child3 = createElement( 'child' );

			insert( child3, parent );
			insert( child1, parent );
			insert( child2, child1, 'after' );

			expect( Array.from( parent.getChildren() ) ).to.deep.equal( [ child1, child2, child3 ] );
		} );

		it( 'should do nothing if empty text node is being inserted', () => {
			const parent = createDocumentFragment();

			model.enqueueChange( batch, writer => {
				const text = writer.createText( '' );

				writer.insert( text, parent );
			} );

			expect( parent.childCount ).to.equal( 0 );
		} );

		it( 'should create proper operation for inserting element #1 (document operation)', () => {
			const parent = doc.createRoot();
			const element = createElement( 'child' );

			const spy = sinon.spy( model, 'applyOperation' );

			insert( element, parent );

			sinon.assert.calledOnce( spy );

			expect( spy.lastCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.lastCall.args[ 0 ] ).to.instanceof( InsertOperation );
			expect( spy.lastCall.args[ 0 ].shouldReceiveAttributes ).to.be.false;
			expect( spy.lastCall.args[ 0 ].batch ).to.equal( batch );
		} );

		it( 'should create proper operation for inserting element #2 (non-document operation)', () => {
			const parent = createDocumentFragment();
			const element = createElement( 'child' );

			const spy = sinon.spy( model, 'applyOperation' );

			insert( element, parent );

			sinon.assert.calledOnce( spy );

			expect( spy.lastCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.lastCall.args[ 0 ] ).to.instanceof( InsertOperation );
			expect( spy.lastCall.args[ 0 ].shouldReceiveAttributes ).to.be.false;
			expect( spy.lastCall.args[ 0 ].batch ).to.be.null;
		} );

		it( 'should create proper operation for inserting text', () => {
			const parent = doc.createRoot();
			const text = createText( 'child' );

			const spy = sinon.spy( model, 'applyOperation' );

			insert( text, parent );

			sinon.assert.calledOnce( spy );
			expect( spy.lastCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.lastCall.args[ 0 ] ).to.instanceof( InsertOperation );
			expect( spy.lastCall.args[ 0 ].shouldReceiveAttributes ).to.be.true;
			expect( spy.lastCall.args[ 0 ].batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within the same document (rootA -> rootA)', () => {
			const root = doc.createRoot();
			const parent1 = createElement( 'parent' );
			const parent2 = createElement( 'parent' );
			const node = createText( 'foo' );

			insert( node, parent1 );
			insert( parent1, root );
			insert( parent2, root );

			const spy = sinon.spy( model, 'applyOperation' );

			insert( node, parent2 );

			// Verify result.
			expect( Array.from( parent1.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( parent2.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify operations.
			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'move' );
			expect( spy.firstCall.args[ 0 ].batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within the same document (rootA -> rootB)', () => {
			const rootA = doc.createRoot( '$root', 'A' );
			const rootB = doc.createRoot( '$root', 'B' );
			const node = createText( 'foo' );

			insert( node, rootA );

			const spy = sinon.spy( model, 'applyOperation' );

			insert( node, rootB );

			// Verify result.
			expect( Array.from( rootA.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( rootB.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify operations.
			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'move' );
			expect( spy.firstCall.args[ 0 ].batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within the same document (docFragA -> docFragA)', () => {
			const docFragA = createDocumentFragment();
			const parent1 = createElement( 'parent' );
			const parent2 = createElement( 'parent' );
			const node = createText( 'foo' );

			insert( node, parent1 );
			insert( parent1, docFragA );
			insert( parent2, docFragA );

			const spy = sinon.spy( model, 'applyOperation' );

			insert( node, parent2 );

			// Verify result.
			expect( Array.from( parent1.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( parent2.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify operations.
			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'move' );
			expect( spy.firstCall.args[ 0 ].batch ).to.be.null;
		} );

		it( 'should move element from one parent to the other within different document (docFragA -> docFragB)', () => {
			const docFragA = createDocumentFragment();
			const docFragB = createDocumentFragment();
			const node = createText( 'foo' );

			insert( node, docFragA );

			const spy = sinon.spy( model, 'applyOperation' );

			insert( node, docFragB );

			// Verify result.
			expect( Array.from( docFragA ) ).to.deep.equal( [] );
			expect( Array.from( docFragB ) ).to.deep.equal( [ node ] );

			// Verify operations.
			sinon.assert.calledTwice( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'detach' );
			expect( spy.firstCall.args[ 0 ].batch ).to.be.null;
			expect( spy.secondCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.secondCall.args[ 0 ].batch ).to.be.null;
		} );

		it( 'should throw when moving element from document to document fragment', () => {
			const root = doc.createRoot();
			const docFrag = createDocumentFragment();
			const node = createText( 'foo' );

			insert( node, root );

			expectToThrowCKEditorError( () => {
				insert( node, docFrag );
			}, /^model-writer-insert-forbidden-move/, model );
		} );

		it( 'should transfer markers from given DocumentFragment', () => {
			const root = doc.createRoot();
			const docFrag = createDocumentFragment();

			appendText( 'abcd', root );

			appendElement( 'p', docFrag );
			insertText( 'foo bar', new Position( docFrag, [ 0, 0 ] ) );

			const marker = new Range( new Position( docFrag, [ 0, 1 ] ), new Position( docFrag, [ 0, 5 ] ) );

			docFrag.markers.set( 'marker', marker );

			insert( docFrag, new Position( root, [ 2 ] ) );

			expect( Array.from( model.markers ).length ).to.equal( 1 );

			const modelMarker = model.markers.get( 'marker' );
			const range = modelMarker.getRange();
			expect( range.root ).to.equal( root );
			expect( range.start.path ).to.deep.equal( [ 2, 1 ] );
			expect( range.end.path ).to.deep.equal( [ 2, 5 ] );
			expect( modelMarker.managedUsingOperations ).to.be.true;
			expect( modelMarker.affectsData ).to.be.true;
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1721.
		it( 'should update a marker if DocumentFragment has a marker that is already in the model (markers have the same name)', () => {
			const root = doc.createRoot();
			const docFrag = createDocumentFragment();

			// <root><p></p><p>[ab]cd</p></root>.
			appendText( 'abcd', root );

			// <docFrag><p>f[oo b]ar</p></docFrag>.
			appendElement( 'p', docFrag );
			insertText( 'foo bar', new Position( docFrag, [ 0, 0 ] ) );

			model.change( writer => {
				const range = new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 2 ] ) );

				writer.addMarker( 'marker', { range, usingOperation: true } );
			} );

			docFrag.markers.set( 'marker', new Range( new Position( docFrag, [ 0, 1 ] ), new Position( docFrag, [ 0, 5 ] ) ) );

			insert( docFrag, new Position( root, [ 2 ] ) );

			expect( Array.from( model.markers ).length ).to.equal( 1 );

			const modelMarker = model.markers.get( 'marker' );
			const range = modelMarker.getRange();
			expect( range.root ).to.equal( root );
			expect( range.start.path ).to.deep.equal( [ 2, 1 ] );
			expect( range.end.path ).to.deep.equal( [ 2, 5 ] );
			expect( modelMarker.managedUsingOperations ).to.be.true;
			expect( modelMarker.affectsData ).to.be.true;
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );
			const root = doc.createRoot();
			const node = createText( 'foo' );

			expectToThrowCKEditorError( () => {
				writer.insert( node, root );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'insertText()', () => {
		it( 'should create and insert text node with attributes at given position', () => {
			const parent = createDocumentFragment();

			insertText( 'foo', { bar: 'biz' }, new Position( parent, [ 0 ] ) );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Text );
			expect( parent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'bar', 'biz' ] ] );
		} );

		it( 'should create and insert text node with no attributes at given position', () => {
			const parent = createDocumentFragment();

			insertText( 'foo', null, new Position( parent, [ 0 ] ) );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Text );
			expect( parent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create and insert text node omitting attributes param', () => {
			const parent = createDocumentFragment();

			insertText( 'foo', new Position( parent, [ 0 ] ) );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Text );
			expect( parent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create and insert text node at the beginning of given element', () => {
			const parent = createDocumentFragment();

			insert( createElement( 'child' ), parent );

			insertText( 'foo', parent );

			expect( parent.childCount ).to.equal( 2 );
			expect( parent.getChild( 0 ) ).to.instanceof( Text );
			expect( parent.getChild( 1 ) ).to.instanceof( Element );
		} );

		it( 'should create and insert text node at the end of given element', () => {
			const parent = createDocumentFragment();

			insert( createElement( 'child' ), parent );
			insertText( 'foo', parent, 'end' );

			expect( parent.childCount ).to.equal( 2 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 1 ) ).to.instanceof( Text );
		} );

		it( 'should create and insert text node at the given offset of given element', () => {
			const parent = createDocumentFragment();

			insert( createElement( 'child' ), parent );
			insert( createElement( 'child' ), parent );

			insertText( 'foo', parent, 1 );

			expect( parent.childCount ).to.equal( 3 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 1 ) ).to.instanceof( Text );
			expect( parent.getChild( 2 ) ).to.instanceof( Element );
		} );

		it( 'should create and insert text node before the given node', () => {
			const parent = createDocumentFragment();
			const child1 = createElement( 'child' );
			const child2 = createElement( 'child' );

			insert( child1, parent );
			insert( child2, parent, 'end' );

			insertText( 'foo', child2, 'before' );

			expect( parent.childCount ).to.equal( 3 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 1 ) ).to.instanceof( Text );
			expect( parent.getChild( 2 ) ).to.instanceof( Element );
		} );

		it( 'should create and insert text node after the given node', () => {
			const parent = createDocumentFragment();
			const child1 = createElement( 'child' );
			const child2 = createElement( 'child' );

			insert( child1, parent );
			insert( child2, parent, 'end' );

			insertText( 'foo', child1, 'after' );

			expect( parent.childCount ).to.equal( 3 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 1 ) ).to.instanceof( Text );
			expect( parent.getChild( 2 ) ).to.instanceof( Element );
		} );

		it( 'should create proper operation', () => {
			const parent = doc.createRoot();
			const spy = sinon.spy( model, 'applyOperation' );

			insertText( 'foo', parent );

			sinon.assert.calledOnce( spy );
			expect( spy.lastCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.lastCall.args[ 0 ] ).to.instanceof( InsertOperation );
			expect( spy.lastCall.args[ 0 ].shouldReceiveAttributes ).to.be.true;
			expect( spy.lastCall.args[ 0 ].batch ).to.equal( batch );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );
			const parent = createDocumentFragment();

			expectToThrowCKEditorError( () => {
				writer.insertText( 'foo', parent );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'insertElement()', () => {
		it( 'should create and insert element with attributes at given position', () => {
			const parent = createDocumentFragment();

			insertElement( 'foo', { bar: 'biz' }, new Position( parent, [ 0 ] ) );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'bar', 'biz' ] ] );
		} );

		it( 'should create and insert element with no attributes at given position', () => {
			const parent = createDocumentFragment();
			insertElement( 'foo', null, new Position( parent, [ 0 ] ) );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create and insert element with no attributes omitting attributes param', () => {
			const parent = createDocumentFragment();
			insertElement( 'foo', new Position( parent, [ 0 ] ) );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Element );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create and insert element at the beginning of given element', () => {
			const parent = createDocumentFragment();
			insert( createElement( 'child' ), parent );

			insertElement( 'foo', parent );

			expect( parent.childCount ).to.equal( 2 );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( parent.getChild( 1 ).name ).to.equal( 'child' );
		} );

		it( 'should create and insert element at the end of given element', () => {
			const parent = createDocumentFragment();
			insert( createElement( 'child' ), parent );

			insertElement( 'foo', parent, 'end' );

			expect( parent.childCount ).to.equal( 2 );
			expect( parent.getChild( 0 ).name ).to.equal( 'child' );
			expect( parent.getChild( 1 ).name ).to.equal( 'foo' );
		} );

		it( 'should create and insert element at the given offset of given element', () => {
			const parent = createDocumentFragment();
			insert( createElement( 'child1' ), parent );
			insert( createElement( 'child2' ), parent, 'end' );

			insertElement( 'foo', parent, 1 );

			expect( parent.childCount ).to.equal( 3 );
			expect( parent.getChild( 0 ).name ).to.equal( 'child1' );
			expect( parent.getChild( 1 ).name ).to.equal( 'foo' );
			expect( parent.getChild( 2 ).name ).to.equal( 'child2' );
		} );

		it( 'should create and insert element before the given node', () => {
			const parent = createDocumentFragment();
			const child1 = createElement( 'child1' );
			const child2 = createElement( 'child2' );

			insert( child1, parent );
			insert( child2, parent, 'end' );

			insertElement( 'foo', child2, 'before' );

			expect( parent.childCount ).to.equal( 3 );
			expect( parent.getChild( 0 ).name ).to.equal( 'child1' );
			expect( parent.getChild( 1 ).name ).to.equal( 'foo' );
			expect( parent.getChild( 2 ).name ).to.equal( 'child2' );
		} );

		it( 'should create and insert element after the given node', () => {
			const parent = createDocumentFragment();
			const child1 = createElement( 'child1' );
			const child2 = createElement( 'child2' );

			insert( child1, parent );
			insert( child2, parent, 'end' );

			insertElement( 'foo', child1, 'after' );

			expect( parent.childCount ).to.equal( 3 );
			expect( parent.getChild( 0 ).name ).to.equal( 'child1' );
			expect( parent.getChild( 1 ).name ).to.equal( 'foo' );
			expect( parent.getChild( 2 ).name ).to.equal( 'child2' );
		} );

		it( 'should create proper operation', () => {
			const parent = doc.createRoot();
			const spy = sinon.spy( model, 'applyOperation' );

			insertElement( 'foo', parent );

			sinon.assert.calledOnce( spy );
			expect( spy.lastCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.lastCall.args[ 0 ] ).to.instanceof( InsertOperation );
			expect( spy.lastCall.args[ 0 ].shouldReceiveAttributes ).to.be.false;
			expect( spy.lastCall.args[ 0 ].batch ).to.equal( batch );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );
			const child = createElement( 'child' );

			expectToThrowCKEditorError( () => {
				writer.insertElement( 'foo', child, 'after' );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'append()', () => {
		it( 'should insert element at the end of the parent', () => {
			const parent = createDocumentFragment();
			const childText = createText( 'foo' );
			const childElement = createElement( 'foo' );

			append( childText, parent );
			append( childElement, parent );

			expect( Array.from( parent ) ).to.deep.equal( [ childText, childElement ] );
		} );

		it( 'should create proper operation', () => {
			const parent = doc.createRoot();
			const text = createText( 'foo' );
			const spy = sinon.spy( model, 'applyOperation' );

			append( text, parent );

			sinon.assert.calledOnce( spy );
			expect( spy.lastCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.lastCall.args[ 0 ].batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within the same root (rootA -> rootA)', () => {
			const rootA = doc.createRoot();

			const parent1 = createElement( 'parent' );
			const parent2 = createElement( 'parent' );
			const node = createText( 'foo' );

			insert( node, parent1 );
			insert( parent1, rootA );
			insert( parent2, rootA );

			const spy = sinon.spy( model, 'applyOperation' );

			append( node, parent2 );

			// Verify result.
			expect( Array.from( parent1.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( parent2.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify operations.
			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'move' );
			expect( spy.firstCall.args[ 0 ].batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within the same document (rootA -> rootB)', () => {
			const rootA = doc.createRoot( '$root', 'A' );
			const rootB = doc.createRoot( '$root', 'B' );
			const node = createText( 'foo' );

			insert( node, rootA );

			const spy = sinon.spy( model, 'applyOperation' );

			append( node, rootB );

			// Verify result.
			expect( Array.from( rootA.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( rootB.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify operations.
			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'move' );
			expect( spy.firstCall.args[ 0 ].batch ).to.equal( batch );
		} );

		it( 'should move element from one parent to the other within the same document fragment (docFragA -> docFragA)', () => {
			const docFragA = createDocumentFragment();
			const parent1 = createElement( 'parent' );
			const parent2 = createElement( 'parent' );
			const node = createText( 'foo' );

			insert( node, parent1 );
			insert( parent1, docFragA );
			insert( parent2, docFragA );

			const spy = sinon.spy( model, 'applyOperation' );

			append( node, parent2 );

			// Verify result.
			expect( Array.from( parent1.getChildren() ) ).to.deep.equal( [] );
			expect( Array.from( parent2.getChildren() ) ).to.deep.equal( [ node ] );

			// Verify operations.
			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'move' );
			expect( spy.firstCall.args[ 0 ].batch ).to.be.null;
		} );

		it( 'should move element from one parent to the other within different document fragments (docFragA -> docFragB)', () => {
			const docFragA = createDocumentFragment();
			const docFragB = createDocumentFragment();
			const node = createText( 'foo' );

			insert( node, docFragA );

			const spy = sinon.spy( model, 'applyOperation' );

			append( node, docFragB );

			// Verify result.
			expect( Array.from( docFragA ) ).to.deep.equal( [] );
			expect( Array.from( docFragB ) ).to.deep.equal( [ node ] );

			// Verify operations.
			sinon.assert.calledTwice( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'detach' );
			expect( spy.firstCall.args[ 0 ].batch ).to.be.null;
			expect( spy.secondCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.secondCall.args[ 0 ].batch ).to.be.null;
		} );

		it( 'should throw when moving element from document to document fragment', () => {
			const root = doc.createRoot();
			const docFrag = createDocumentFragment();
			const node = createText( 'foo' );

			insert( node, root );

			expectToThrowCKEditorError( () => {
				append( node, docFrag );
			}, /^model-writer-insert-forbidden-move/, model );
		} );
	} );

	describe( 'appendText()', () => {
		it( 'should create and insert text node with attributes at the end of the parent', () => {
			const parent = createDocumentFragment();
			appendText( 'foo', { bar: 'biz' }, parent );
			appendText( 'bar', { biz: 'bar' }, parent );

			expect( parent.childCount ).to.equal( 2 );
			expect( parent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'bar', 'biz' ] ] );
			expect( parent.getChild( 1 ).data ).to.equal( 'bar' );
			expect( Array.from( parent.getChild( 1 ).getAttributes() ) ).to.deep.equal( [ [ 'biz', 'bar' ] ] );
		} );

		it( 'should create and insert text node with no attributes at the end of the parent', () => {
			const parent = createDocumentFragment();
			appendText( 'foo', null, parent );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Text );
			expect( parent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create and insert text node with no attributes omitting attributes param', () => {
			const parent = createDocumentFragment();
			appendText( 'foo', parent );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.instanceof( Text );
			expect( parent.getChild( 0 ).data ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create proper operations', () => {
			const parent = doc.createRoot();
			const spy = sinon.spy( model, 'applyOperation' );

			appendText( 'foo', parent );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.firstCall.args[ 0 ] ).to.instanceof( InsertOperation );
			expect( spy.firstCall.args[ 0 ].shouldReceiveAttributes ).to.be.true;
			expect( spy.firstCall.args[ 0 ].batch ).to.equal( batch );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );
			const parent = createDocumentFragment();

			expectToThrowCKEditorError( () => {
				writer.appendText( 'foo', parent );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'appendElement()', () => {
		it( 'should create and insert element with attributes at the end of the parent', () => {
			const parent = createDocumentFragment();
			appendElement( 'foo', { bar: 'biz' }, parent );
			appendElement( 'bar', { biz: 'bar' }, parent );

			expect( parent.childCount ).to.equal( 2 );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'bar', 'biz' ] ] );
			expect( parent.getChild( 1 ).name ).to.equal( 'bar' );
			expect( Array.from( parent.getChild( 1 ).getAttributes() ) ).to.deep.equal( [ [ 'biz', 'bar' ] ] );
		} );

		it( 'should create and insert element with no attributes at the end of the parent', () => {
			const parent = createDocumentFragment();
			appendElement( 'foo', null, parent );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create and insert element with no attributes omitting attributes param', () => {
			const parent = createDocumentFragment();
			appendElement( 'foo', parent );

			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ).name ).to.equal( 'foo' );
			expect( Array.from( parent.getChild( 0 ).getAttributes() ) ).to.deep.equal( [] );
		} );

		it( 'should create proper operation', () => {
			const parent = doc.createRoot();
			const spy = sinon.spy( model, 'applyOperation' );

			appendElement( 'foo', parent );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 0 ].type ).to.equal( 'insert' );
			expect( spy.firstCall.args[ 0 ] ).to.be.instanceof( InsertOperation );
			expect( spy.firstCall.args[ 0 ].shouldReceiveAttributes ).to.be.false;
			expect( spy.firstCall.args[ 0 ].batch ).to.equal( batch );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );
			const parent = createDocumentFragment();

			expectToThrowCKEditorError( () => {
				writer.appendElement( 'foo', parent );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'setAttribute() / removeAttribute()', () => {
		let root, spy;

		beforeEach( () => {
			root = doc.createRoot();
		} );

		describe( 'change attribute on node', () => {
			let node, text;

			beforeEach( () => {
				node = createElement( 'p', { a: 1 } );
				text = createText( 'c', { a: 1 } );

				append( node, root );
				append( text, root );

				spy = sinon.spy( model, 'applyOperation' );
			} );

			describe( 'setAttribute', () => {
				it( 'should create the attribute on element', () => {
					setAttribute( 'b', 2, node );
					expect( spy.callCount ).to.equal( 1 );
					expect( node.getAttribute( 'b' ) ).to.equal( 2 );
				} );

				it( 'should change the attribute of element', () => {
					setAttribute( 'a', 2, node );
					expect( spy.callCount ).to.equal( 1 );
					expect( node.getAttribute( 'a' ) ).to.equal( 2 );
				} );

				it( 'should create the attribute on text node', () => {
					setAttribute( 'b', 2, text );
					expect( spy.callCount ).to.equal( 1 );
					expect( root.getChild( 1 ).getAttribute( 'b' ) ).to.equal( 2 );
				} );

				it( 'should change the attribute of text node', () => {
					setAttribute( 'a', 2, text );
					expect( spy.callCount ).to.equal( 1 );
					expect( root.getChild( 1 ).getAttribute( 'a' ) ).to.equal( 2 );
				} );

				it( 'should do nothing if the attribute value is the same', () => {
					setAttribute( 'a', 1, node );
					expect( spy.callCount ).to.equal( 0 );
					expect( node.getAttribute( 'a' ) ).to.equal( 1 );
				} );

				it( 'should throw when trying to use detached writer', () => {
					const writer = new Writer( model, batch );

					expectToThrowCKEditorError( () => {
						writer.setAttribute( 'a', 1, node );
					}, /^writer-incorrect-use/, model );
				} );
			} );

			describe( 'removeAttribute', () => {
				it( 'should remove the attribute from element', () => {
					removeAttribute( 'a', node );
					expect( spy.callCount ).to.equal( 1 );
					expect( node.getAttribute( 'a' ) ).to.be.undefined;
				} );

				it( 'should remove the attribute from character', () => {
					removeAttribute( 'a', text );
					expect( spy.callCount ).to.equal( 1 );
					expect( root.getChild( 1 ).getAttribute( 'a' ) ).to.be.undefined;
				} );

				it( 'should do nothing if the attribute is not set', () => {
					removeAttribute( 'b', node );
					expect( spy.callCount ).to.equal( 0 );
				} );

				it( 'should throw when trying to use detached writer', () => {
					const writer = new Writer( model, batch );

					expectToThrowCKEditorError( () => {
						writer.removeAttribute( 'b', node );
					}, /^writer-incorrect-use/, model );
				} );
			} );
		} );

		describe( 'change attribute on range', () => {
			beforeEach( () => {
				const element = createElement( 'e', { a: 2 } );

				appendText( 'xxx', { a: 1 }, root );
				appendText( 'xxx', root );
				appendText( 'xxx', { a: 1 }, root );
				appendText( 'xxx', { a: 2 }, root );
				appendText( 'xxx', root );
				appendText( 'xxx', { a: 1 }, root );
				appendText( 'xxx', element );
				append( element, root );
				appendText( 'xxx', root );

				spy = sinon.spy( model, 'applyOperation' );
			} );

			function getRange( startIndex, endIndex ) {
				return new Range(
					Position._createAt( root, startIndex ),
					Position._createAt( root, endIndex )
				);
			}

			function getChangesAttrsCount() {
				let totalNumber = 0;

				for ( const operation of batch.operations ) {
					if ( operation.range ) {
						totalNumber += count( operation.range.getItems( { singleCharacters: true } ) );
					}
				}

				return totalNumber;
			}

			function getCompressedAttrs() {
				// default: 111---111222---1112------
				const range = Range._createIn( root );

				return Array.from( range.getItems( { singleCharacters: true } ) )
					.map( item => item.getAttribute( 'a' ) || '-' )
					.join( '' );
			}

			describe( 'setAttribute', () => {
				it( 'should set the attribute on the range', () => {
					setAttribute( 'a', 3, getRange( 3, 6 ) );
					expect( spy.callCount ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 3 );
					expect( getCompressedAttrs() ).to.equal( '111333111222---1112------' );
				} );

				it( 'should split the operations if parts of the range have different attributes', () => {
					setAttribute( 'a', 3, getRange( 4, 14 ) );
					expect( spy.callCount ).to.equal( 4 );
					expect( getChangesAttrsCount() ).to.equal( 10 );
					expect( getCompressedAttrs() ).to.equal( '111-3333333333-1112------' );
				} );

				it( 'should split the operations if parts of the part of the range have the attribute', () => {
					setAttribute( 'a', 2, getRange( 4, 14 ) );
					expect( spy.callCount ).to.equal( 3 );
					expect( getChangesAttrsCount() ).to.equal( 7 );
					expect( getCompressedAttrs() ).to.equal( '111-2222222222-1112------' );
				} );

				it( 'should strip the range if the beginning have the attribute', () => {
					setAttribute( 'a', 1, getRange( 1, 5 ) );
					expect( spy.callCount ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 2 );
					expect( getCompressedAttrs() ).to.equal( '11111-111222---1112------' );
				} );

				it( 'should strip the range if the ending have the attribute', () => {
					setAttribute( 'a', 1, getRange( 13, 17 ) );
					expect( spy.callCount ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 2 );
					expect( getCompressedAttrs() ).to.equal( '111---111222-111112------' );
				} );

				it( 'should do nothing if the range has attribute', () => {
					setAttribute( 'a', 1, getRange( 0, 3 ) );
					expect( spy.callCount ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not check range\'s start position node when creating operations', () => {
					const range = new Range(
						new Position( root, [ 18, 1 ] ),
						new Position( root, [ 19 ] )
					);

					setAttribute( 'a', 1, range );
					expect( spy.callCount ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 2 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112-11---' );
				} );

				it( 'should not change elements attribute if range contains closing tag', () => {
					const range = new Range(
						new Position( root, [ 18, 1 ] ),
						new Position( root, [ 21 ] )
					);

					setAttribute( 'a', 1, range );
					expect( spy.callCount ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 4 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112-1111-' );
				} );

				it( 'should not create an operation if the range contains only closing tag', () => {
					const range = new Range(
						new Position( root, [ 18, 3 ] ),
						new Position( root, [ 19 ] )
					);

					setAttribute( 'a', 3, range );
					expect( spy.callCount ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not create an operation if is collapsed', () => {
					setAttribute( 'a', 1, getRange( 3, 3 ) );
					expect( spy.callCount ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not change children of items in the range', () => {
					setAttribute( 'a', 1, getRange( 0, 20 ) );
					expect( spy.callCount ).to.equal( 5 );
					expect( getChangesAttrsCount() ).to.equal( 14 );
					expect( getCompressedAttrs() ).to.equal( '1111111111111111111---1--' );
				} );

				it( 'should throw when trying to use detached writer', () => {
					const writer = new Writer( model, batch );

					expectToThrowCKEditorError( () => {
						writer.setAttribute( 'a', 1, getRange( 0, 20 ) );
					}, /^writer-incorrect-use/, model );
				} );
			} );

			describe( 'removeAttribute', () => {
				it( 'should remove the attribute on the range', () => {
					removeAttribute( 'a', getRange( 0, 2 ) );
					expect( spy.callCount ).to.equal( 1 );
					expect( getChangesAttrsCount() ).to.equal( 2 );
					expect( getCompressedAttrs() ).to.equal( '--1---111222---1112------' );
				} );

				it( 'should split the operations if parts of the range have different attributes', () => {
					removeAttribute( 'a', getRange( 7, 11 ) );
					expect( spy.callCount ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 4 );
					expect( getCompressedAttrs() ).to.equal( '111---1----2---1112------' );
				} );

				it( 'should split the operations if parts of the part of the range have no attribute', () => {
					removeAttribute( 'a', getRange( 1, 7 ) );
					expect( spy.callCount ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 3 );
					expect( getCompressedAttrs() ).to.equal( '1------11222---1112------' );
				} );

				it( 'should strip the range if the beginning have no attribute', () => {
					removeAttribute( 'a', getRange( 4, 12 ) );
					expect( spy.callCount ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 6 );
					expect( getCompressedAttrs() ).to.equal( '111------------1112------' );
				} );

				it( 'should strip the range if the ending have no attribute', () => {
					removeAttribute( 'a', getRange( 7, 15 ) );
					expect( spy.callCount ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 5 );
					expect( getCompressedAttrs() ).to.equal( '111---1--------1112------' );
				} );

				it( 'should do nothing if the range has no attribute', () => {
					removeAttribute( 'a', getRange( 4, 5 ) );
					expect( spy.callCount ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not check range\'s start position node when creating operations', () => {
					const range = new Range(
						new Position( root, [ 18, 3 ] ),
						new Position( root, [ 19 ] )
					);

					removeAttribute( 'a', range );
					expect( spy.callCount ).to.equal( 0 );
					expect( getChangesAttrsCount() ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should not create an operation if range is collapsed', () => {
					removeAttribute( 'a', getRange( 3, 3 ) );
					expect( spy.callCount ).to.equal( 0 );
					expect( getCompressedAttrs() ).to.equal( '111---111222---1112------' );
				} );

				it( 'should create a proper operations for the mixed range', () => {
					removeAttribute( 'a', getRange( 3, 15 ) );
					expect( spy.callCount ).to.equal( 2 );
					expect( getChangesAttrsCount() ).to.equal( 6 );
					expect( getCompressedAttrs() ).to.equal( '111------------1112------' );
				} );

				it( 'should throw when trying to use detached writer', () => {
					const writer = new Writer( model, batch );

					expectToThrowCKEditorError( () => {
						writer.removeAttribute( 'a', getRange( 3, 15 ) );
					}, /^writer-incorrect-use/, model );
				} );
			} );
		} );

		describe( 'change attribute on root element', () => {
			let p;

			beforeEach( () => {
				p = createElement( 'p', { a: 3 } );
				spy = sinon.spy( model, 'applyOperation' );
			} );

			describe( 'setAttribute', () => {
				it( 'should create the attribute on root', () => {
					setAttribute( 'b', 2, root );
					expect( spy.callCount ).to.equal( 1 );
					expect( root.getAttribute( 'b' ) ).to.equal( 2 );
				} );

				it( 'should create the attribute on detached root', () => {
					setAttribute( 'b', 2, p );
					expect( spy.callCount ).to.equal( 1 );
					expect( p.getAttribute( 'b' ) ).to.equal( 2 );
				} );

				it( 'should change the attribute of root', () => {
					setAttribute( 'a', 2, root );
					expect( spy.callCount ).to.equal( 1 );
					expect( root.getAttribute( 'a' ) ).to.equal( 2 );
				} );

				it( 'should change the attribute of detached root', () => {
					setAttribute( 'a', 2, p );
					expect( spy.callCount ).to.equal( 1 );
					expect( p.getAttribute( 'a' ) ).to.equal( 2 );
				} );

				it( 'should do nothing if the attribute value is the same', () => {
					setAttribute( 'a', 1, root );
					expect( spy.callCount ).to.equal( 1 );
					setAttribute( 'a', 1, root );
					expect( spy.callCount ).to.equal( 1 );
					expect( root.getAttribute( 'a' ) ).to.equal( 1 );
				} );

				it( 'should do nothing if the attribute value is the same on detached root', () => {
					setAttribute( 'a', 1, p );
					expect( spy.callCount ).to.equal( 1 );
					setAttribute( 'a', 1, p );
					expect( spy.callCount ).to.equal( 1 );
					expect( p.getAttribute( 'a' ) ).to.equal( 1 );
				} );

				it( 'should throw when trying to use detached writer', () => {
					const writer = new Writer( model, batch );

					expectToThrowCKEditorError( () => {
						writer.setAttribute( 'a', 1, p );
					}, /^writer-incorrect-use/, model );
				} );
			} );

			describe( 'removeAttribute', () => {
				it( 'should remove the attribute from root', () => {
					setAttribute( 'a', 1, root );
					removeAttribute( 'a', root );

					expect( spy.callCount ).to.equal( 2 );
					expect( root.getAttribute( 'a' ) ).to.be.undefined;
				} );

				it( 'should do nothing if the attribute is not set', () => {
					removeAttribute( 'b', root );
					expect( spy.callCount ).to.equal( 0 );
				} );

				it( 'should throw when trying to use detached writer', () => {
					const writer = new Writer( model, batch );

					expectToThrowCKEditorError( () => {
						writer.removeAttribute( 'b', root );
					}, /^writer-incorrect-use/, model );
				} );
			} );

			describe( 'clearAttributes', () => {
				it( 'should clear attributes from range', () => {
					appendText( 'xxx', { a: 1, b: 2, c: 3 }, root );
					appendText( 'xxx', root );
					appendText( 'xxx', { a: 1 }, root );
					appendText( 'xxx', { b: 2 }, root );
					appendText( 'xxx', root );
					appendElement( 'e', { a: 1 }, root );
					appendText( 'xxx', root );

					const range = Range._createIn( root );

					clearAttributes( range );

					let itemsCount = 0;

					for ( const item of range.getItems() ) {
						itemsCount++;
						expect( Array.from( item.getAttributeKeys() ).length ).to.equal( 0 );
					}

					expect( itemsCount ).to.equal( 3 );
				} );

				it( 'should clear attributes on element', () => {
					const element = createElement( 'x', { a: 1, b: 2, c: 3 }, root );

					expect( Array.from( element.getAttributeKeys() ).length ).to.equal( 3 );

					clearAttributes( element );

					expect( Array.from( element.getAttributeKeys() ).length ).to.equal( 0 );
				} );

				it( 'should clear attributes on root element', () => {
					setAttributes( { a: 1, b: 2, c: 3 }, root );

					expect( Array.from( root.getAttributeKeys() ).length ).to.equal( 3 );

					clearAttributes( root );

					expect( Array.from( root.getAttributeKeys() ).length ).to.equal( 0 );
				} );

				it( 'should do nothing if there are no attributes', () => {
					const element = createElement( 'x' );

					expect( Array.from( element.getAttributeKeys() ).length ).to.equal( 0 );

					clearAttributes( element );

					expect( Array.from( element.getAttributeKeys() ).length ).to.equal( 0 );
				} );

				it( 'should throw when trying to use detached writer', () => {
					const writer = new Writer( model, batch );
					const element = createElement( 'x' );

					expectToThrowCKEditorError( () => {
						writer.clearAttributes( element );
					}, /^writer-incorrect-use/, model );
				} );
			} );
		} );
	} );

	describe( 'setAttributes()', () => {
		let frag, item;

		beforeEach( () => {
			frag = createDocumentFragment();
			item = createText( 'xxx', { b: 2, c: 3 } );

			appendText( 'xxx', { a: 1 }, frag );
			append( item, frag );
		} );

		it( 'should set attributes one by one on range', () => {
			const range = Range._createIn( frag );
			let spy;

			model.change( writer => {
				// `setAttribute` is a not trivial operation and is deeply tested above, there is no point to duplicate
				// such a big amount of the same tests, so let's use a spy here.
				spy = sinon.spy( writer, 'setAttribute' );

				writer.setAttributes( { a: 3, c: null }, range );
			} );

			// Verify result.
			expect( Array.from( frag.getChild( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'a', 3 ] ] );
			expect( Array.from( frag.getChild( 1 ).getAttributes() ) ).to.deep.equal( [ [ 'b', 2 ], [ 'a', 3 ] ] );

			// Verify operations
			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy.firstCall, 'a', 3, range );
			sinon.assert.calledWith( spy.secondCall, 'c', null, range );
		} );

		it( 'should set attributes one by one on range for map as attributes list', () => {
			const range = Range._createIn( frag );
			let spy;

			model.change( writer => {
				// `setAttribute` is a not trivial operation and is deeply tested above, there is no point to duplicate
				// such a big amount of the same tests, so let's use a spy here.
				spy = sinon.spy( writer, 'setAttribute' );

				writer.setAttributes( new Map( [ [ 'a', 3 ], [ 'c', null ] ] ), range );
			} );

			// Verify result.
			expect( Array.from( frag.getChild( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'a', 3 ] ] );
			expect( Array.from( frag.getChild( 1 ).getAttributes() ) ).to.deep.equal( [ [ 'b', 2 ], [ 'a', 3 ] ] );

			// Verify operations
			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy.firstCall, 'a', 3, range );
			sinon.assert.calledWith( spy.secondCall, 'c', null, range );
		} );

		it( 'should set attributes one by one on item', () => {
			let spy;

			model.change( writer => {
				// `setAttribute` is a not trivial operation and is deeply tested above, there is no point to duplicate
				// such a big amount of the same tests, so let's use a spy here.
				spy = sinon.spy( writer, 'setAttribute' );

				writer.setAttributes( { a: 3, c: null }, item );
			} );

			// Verify result.
			expect( Array.from( item.getAttributes() ) ).to.deep.equal( [ [ 'b', 2 ], [ 'a', 3 ] ] );

			// Verify operations
			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy.firstCall, 'a', 3, item );
			sinon.assert.calledWith( spy.secondCall, 'c', null, item );
		} );

		it( 'should set attributes one by one on item for maps as attributes list', () => {
			let spy;

			model.change( writer => {
				// `setAttribute` is a not trivial operation and is deeply tested above, there is no point to duplicate
				// such a big amount of the same tests, so let's use a spy here.
				spy = sinon.spy( writer, 'setAttribute' );

				writer.setAttributes( new Map( [ [ 'a', 3 ], [ 'c', null ] ] ), item );
			} );

			// Verify result.
			expect( Array.from( item.getAttributes() ) ).to.deep.equal( [ [ 'b', 2 ], [ 'a', 3 ] ] );

			// Verify operations
			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy.firstCall, 'a', 3, item );
			sinon.assert.calledWith( spy.secondCall, 'c', null, item );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );

			expectToThrowCKEditorError( () => {
				writer.setAttributes( new Map( [ [ 'a', 3 ], [ 'c', null ] ] ), item );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'merge()', () => {
		let root, p1, p2;

		beforeEach( () => {
			root = doc.createRoot();

			p1 = new Element( 'p', { key1: 'value1' }, new Text( 'foo' ) );
			p2 = new Element( 'p', { key2: 'value2' }, new Text( 'bar' ) );

			root._insertChild( 0, [ p1, p2 ] );
		} );

		it( 'should merge foo and bar into foobar', () => {
			merge( new Position( root, [ 1 ] ) );

			expect( root.maxOffset ).to.equal( 1 );
			expect( root.getChild( 0 ).name ).to.equal( 'p' );
			expect( root.getChild( 0 ).maxOffset ).to.equal( 6 );
			expect( count( root.getChild( 0 ).getAttributes() ) ).to.equal( 1 );
			expect( root.getChild( 0 ).getAttribute( 'key1' ) ).to.equal( 'value1' );
			expect( root.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foobar' );
		} );

		it( 'should correctly merge in document fragment', () => {
			const docFrag = new DocumentFragment( [
				new Element( 'p', null, 'foo' ),
				new Element( 'p', null, 'bar' )
			] );

			merge( new Position( docFrag, [ 1 ] ) );

			expect( docFrag.getChild( 0 ).name ).to.equal( 'p' );
			expect( docFrag.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foobar' );
		} );

		describe( 'should create a marker operation if a marker was affected', () => {
			it( '<p>Foo[</p><p>Bar]</p>', () => {
				testMerge( p1, 'end', p2, 0 );
			} );

			it( '<p>[Foo</p><p>]Bar</p>', () => {
				testMerge( p1, 0, p2, 0 );
			} );

			it( '<p>[Foo</p>]<p>Bar</p>', () => {
				testMerge( p1, 0, root, 1 );
			} );

			it( '<p>Foo</p>[<p>Bar]</p>', () => {
				testMerge( root, 1, p2, 'end' );
			} );

			function testMerge( startElement, startOffset, endElement, endOffset ) {
				const markerRange = new Range(
					Position._createAt( startElement, startOffset ),
					Position._createAt( endElement, endOffset )
				);

				addMarker( 'name', {
					range: markerRange,
					usingOperation: true
				} );

				const documentVersion = model.document.version;

				merge( Position._createAfter( p1 ) );

				const history = model.document.history;

				const lastOperation = history.lastOperation;
				const secondLastOperation = history.getOperation( history.version - 2 );

				expect( secondLastOperation.type ).to.equal( 'marker' );
				expect( secondLastOperation.oldRange.isEqual( markerRange ) );
				expect( secondLastOperation.newRange.isEqual( markerRange ) );

				expect( lastOperation.type ).to.equal( 'merge' );
				expect( model.document.version ).to.equal( documentVersion + 2 );
			}
		} );

		it( 'should not create a marker operation if affected marker was not using operations', () => {
			const markerRange = new Range( Position._createAt( p2, 0 ), Position._createAt( p2, 2 ) );

			addMarker( 'name', {
				range: markerRange,
				usingOperation: false
			} );

			const documentVersion = model.document.version;

			merge( Position._createAfter( p1 ) );

			const history = model.document.history;

			const lastOperation = history.lastOperation;

			expect( lastOperation.type ).to.equal( 'merge' );
			expect( model.document.version ).to.equal( documentVersion + 1 );
		} );

		it( 'should throw if there is no element after', () => {
			expectToThrowCKEditorError( () => {
				merge( new Position( root, [ 2 ] ) );
			}, /^writer-merge-no-element-after/, model );
		} );

		it( 'should throw if there is no element before', () => {
			expectToThrowCKEditorError( () => {
				merge( new Position( root, [ 0, 2 ] ) );
			}, /^writer-merge-no-element-before/, model );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );

			expectToThrowCKEditorError( () => {
				writer.merge( new Position( root, [ 1 ] ) );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'move()', () => {
		let root, range, div, p;

		beforeEach( () => {
			root = doc.createRoot();

			div = new Element( 'div', [], new Text( 'foobar' ) );
			p = new Element( 'p', [], new Text( 'abcxyz' ) );

			div._insertChild( 0, [ new Element( 'p', [], new Text( 'gggg' ) ) ] );
			div._insertChild( 2, [ new Element( 'p', [], new Text( 'hhhh' ) ) ] );

			root._insertChild( 0, [ div, p ] );

			range = new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 0, 7 ] ) );
		} );

		it( 'should move flat range of nodes', () => {
			move( range, new Position( root, [ 1, 3 ] ) );

			expect( getNodesAndText( Range._createIn( root.getChild( 0 ) ) ) ).to.equal( 'PggggPfoPhhhhP' );
			expect( getNodesAndText( Range._createIn( root.getChild( 1 ) ) ) ).to.equal( 'abcobarxyz' );
		} );

		it( 'should create a marker operation if a marker was affected', () => {
			const markerRange = new Range( Position._createAt( p, 1 ), Position._createAt( p, 4 ) );

			addMarker( 'name', {
				range: markerRange,
				usingOperation: true
			} );

			const documentVersion = model.document.version;

			move( new Range( Position._createAt( p, 0 ), Position._createAt( p, 2 ) ), Position._createAt( div, 0 ) );

			const history = model.document.history;

			const lastOperation = history.lastOperation;
			const secondLastOperation = history.getOperation( history.version - 2 );

			expect( secondLastOperation.type ).to.equal( 'marker' );
			expect( secondLastOperation.oldRange.isEqual( markerRange ) );
			expect( secondLastOperation.newRange.isEqual( markerRange ) );

			expect( lastOperation.type ).to.equal( 'move' );
			expect( model.document.version ).to.equal( documentVersion + 2 );
		} );

		it( 'should not create a marker operation if affected marker was not using operations', () => {
			const markerRange = new Range( Position._createAt( p, 1 ), Position._createAt( p, 4 ) );

			addMarker( 'name', {
				range: markerRange,
				usingOperation: false
			} );

			const documentVersion = model.document.version;

			move( new Range( Position._createAt( p, 0 ), Position._createAt( p, 2 ) ), Position._createAt( div, 0 ) );

			const history = model.document.history;

			const lastOperation = history.lastOperation;

			expect( lastOperation.type ).to.equal( 'move' );
			expect( model.document.version ).to.equal( documentVersion + 1 );
		} );

		it( 'should throw if object to move is not a range', () => {
			expectToThrowCKEditorError( () => {
				move( root.getChild( 0 ), new Position( root, [ 1, 3 ] ) );
			}, /^writer-move-invalid-range/, model );
		} );

		it( 'should throw if given range is not flat', () => {
			const notFlatRange = new Range( new Position( root, [ 0, 2, 2 ] ), new Position( root, [ 0, 6 ] ) );

			expectToThrowCKEditorError( () => {
				move( notFlatRange, new Position( root, [ 1, 3 ] ) );
			}, /^writer-move-range-not-flat/, model );
		} );

		it( 'should throw if range is going to be moved to the other document', () => {
			const docFrag = createDocumentFragment();

			expectToThrowCKEditorError( () => {
				move( range, docFrag, 0 );
			}, /^writer-move-different-document/, model );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );

			expectToThrowCKEditorError( () => {
				writer.move( range, new Position( root, [ 1, 3 ] ) );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'remove()', () => {
		let div, p, range;

		beforeEach( () => {
			div = createElement( 'div' );
			appendText( 'foobar', div );

			p = createElement( 'p' );
			appendText( 'abcxyz', p );

			insertElement( 'p', div );
			appendElement( 'p', div );

			insertText( 'gggg', new Position( div, [ 0, 0 ] ) );
			insertText( 'hhhh', new Position( div, [ 7, 0 ] ) );
		} );

		describe( 'remove from document', () => {
			let root;

			beforeEach( () => {
				root = doc.createRoot();

				append( div, root );
				append( p, root );

				// Range starts in ROOT > DIV > P > gg|gg.
				// Range ends in ROOT > DIV > ...|ar.
				range = new Range( new Position( root, [ 0, 0, 2 ] ), new Position( root, [ 0, 5 ] ) );
			} );

			it( 'should remove specified node', () => {
				remove( div );

				expect( root.maxOffset ).to.equal( 1 );
				expect( root.childCount ).to.equal( 1 );
				expect( getNodesAndText( Range._createIn( root.getChild( 0 ) ) ) ).to.equal( 'abcxyz' );
			} );

			it( 'should remove specified text node', () => {
				remove( p.getChild( 0 ) );

				expect( getNodesAndText( Range._createOn( p ) ) ).to.equal( 'PP' );
			} );

			it( 'should remove any range of nodes', () => {
				remove( range );

				expect( getNodesAndText( Range._createIn( root.getChild( 0 ) ) ) ).to.equal( 'PggParPhhhhP' );
				expect( getNodesAndText( Range._createIn( root.getChild( 1 ) ) ) ).to.equal( 'abcxyz' );
			} );

			it( 'should create minimal number of remove operations, each with only one operation', () => {
				batch = new Batch();
				remove( range );

				expect( batch.operations.length ).to.equal( 2 );
			} );

			it( 'should use MoveOperation to graveyard', () => {
				batch = new Batch();
				remove( div );

				expect( batch.operations[ 0 ].type ).to.equal( 'remove' );
			} );

			it( 'should create a marker operation if a marker was affected', () => {
				const markerRange = new Range( Position._createAt( p, 1 ), Position._createAt( p, 4 ) );

				addMarker( 'name', {
					range: markerRange,
					usingOperation: true
				} );

				const documentVersion = model.document.version;

				remove( new Range( Position._createAt( p, 0 ), Position._createAt( p, 2 ) ) );

				const history = model.document.history;

				const lastOperation = history.lastOperation;
				const secondLastOperation = history.getOperation( history.version - 2 );

				expect( secondLastOperation.type ).to.equal( 'marker' );
				expect( secondLastOperation.oldRange.isEqual( markerRange ) );
				expect( secondLastOperation.newRange.isEqual( markerRange ) );

				expect( lastOperation.type ).to.equal( 'remove' );

				expect( model.document.version ).to.equal( documentVersion + 2 );
			} );

			it( 'should not create a marker operation if affected marker was not using operations', () => {
				const markerRange = new Range( Position._createAt( p, 1 ), Position._createAt( p, 4 ) );

				addMarker( 'name', {
					range: markerRange,
					usingOperation: false
				} );

				const documentVersion = model.document.version;

				remove( new Range( Position._createAt( p, 0 ), Position._createAt( p, 2 ) ) );

				const history = model.document.history;

				const lastOperation = history.lastOperation;

				expect( lastOperation.type ).to.equal( 'remove' );
				expect( model.document.version ).to.equal( documentVersion + 1 );
			} );

			it( 'should throw when trying to use detached writer', () => {
				const writer = new Writer( model, batch );

				expectToThrowCKEditorError( () => {
					writer.remove( range );
				}, /^writer-incorrect-use/, model );
			} );
		} );

		describe( 'remove from document fragment', () => {
			let frag;

			beforeEach( () => {
				frag = createDocumentFragment();
				append( div, frag );
				append( p, frag );

				// Range starts in FRAG > DIV > P > gg|gg.
				// Range ends in FRAG > DIV > ...|ar.
				range = new Range( new Position( frag, [ 0, 0, 2 ] ), new Position( frag, [ 0, 5 ] ) );
			} );

			it( 'should remove specified node', () => {
				remove( div );

				expect( frag.maxOffset ).to.equal( 1 );
				expect( frag.childCount ).to.equal( 1 );
				expect( getNodesAndText( Range._createIn( frag.getChild( 0 ) ) ) ).to.equal( 'abcxyz' );
			} );

			it( 'should remove specified text node', () => {
				remove( p.getChild( 0 ) );

				expect( getNodesAndText( Range._createOn( p ) ) ).to.equal( 'PP' );
			} );

			it( 'should remove any range of nodes', () => {
				remove( range );

				expect( getNodesAndText( Range._createIn( frag.getChild( 0 ) ) ) ).to.equal( 'PggParPhhhhP' );
				expect( getNodesAndText( Range._createIn( frag.getChild( 1 ) ) ) ).to.equal( 'abcxyz' );
			} );

			it( 'should create minimal number of remove operations, each with only one operation', () => {
				batch = new Batch();
				remove( range );

				expect( batch.operations.length ).to.equal( 0 );
			} );

			it( 'should use DetachOperation', () => {
				sinon.spy( model, 'applyOperation' );
				remove( div );

				expect( model.applyOperation.firstCall.args[ 0 ].type ).to.equal( 'detach' );
			} );

			it( 'should throw when trying to use detached writer', () => {
				const writer = new Writer( model, batch );

				expectToThrowCKEditorError( () => {
					writer.remove( range );
				}, /^writer-incorrect-use/, model );
			} );
		} );
	} );

	describe( 'rename()', () => {
		it( 'should rename given element', () => {
			const root = doc.createRoot();
			const p = new Element( 'p', null, new Text( 'abc' ) );

			root._appendChild( p );

			rename( p, 'h' );

			expect( root.maxOffset ).to.equal( 1 );
			expect( root.getChild( 0 ) ).to.have.property( 'name', 'h' );
		} );

		it( 'should rename in document fragment', () => {
			const docFrag = new DocumentFragment();
			const p = new Element( 'p' );

			docFrag._appendChild( p );

			rename( p, 'h' );

			expect( docFrag.maxOffset ).to.equal( 1 );
			expect( docFrag.getChild( 0 ) ).to.have.property( 'name', 'h' );
		} );

		it( 'should throw if not an Element instance is passed', () => {
			expectToThrowCKEditorError( () => {
				rename( new Text( 'abc' ), 'h' );
			}, /^writer-rename-not-element-instance/, model );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );
			const p = new Element( 'p', null, new Text( 'abc' ) );

			expectToThrowCKEditorError( () => {
				writer.rename( p, 'h' );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'split()', () => {
		let root, p;

		beforeEach( () => {
			root = doc.createRoot();

			p = new Element( 'p', { key: 'value' }, new Text( 'foobar' ) );

			root._insertChild( 0, p );
		} );

		it( 'should split foobar to foo and bar', () => {
			split( new Position( root, [ 0, 3 ] ) );

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

		it( 'should split inside document fragment', () => {
			const docFrag = new DocumentFragment();
			docFrag._appendChild( new Element( 'p', null, new Text( 'foobar' ) ) );

			split( new Position( docFrag, [ 0, 3 ] ) );

			expect( docFrag.maxOffset ).to.equal( 2 );

			expect( docFrag.getChild( 0 ).name ).to.equal( 'p' );
			expect( docFrag.getChild( 0 ).maxOffset ).to.equal( 3 );
			expect( docFrag.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );

			expect( docFrag.getChild( 1 ).name ).to.equal( 'p' );
			expect( docFrag.getChild( 1 ).maxOffset ).to.equal( 3 );
			expect( docFrag.getChild( 1 ).getChild( 0 ).data ).to.equal( 'bar' );
		} );

		it( 'should create an empty paragraph if we split at the end', () => {
			split( new Position( root, [ 0, 6 ] ) );

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
			expectToThrowCKEditorError( () => {
				split( new Position( root, [ 0 ] ) );
			}, /^writer-split-element-no-parent/, model );
		} );

		it( 'should throw if we try to split an element with no parent', () => {
			expectToThrowCKEditorError( () => {
				const element = createElement( 'p' );

				split( new Position( element, [ 0 ] ) );
			}, /^writer-split-element-no-parent/, model );
		} );

		it( 'should throw if we try to split a document fragment', () => {
			expectToThrowCKEditorError( () => {
				const documentFragment = createDocumentFragment();

				split( new Position( documentFragment, [ 0 ] ) );
			}, /^writer-split-element-no-parent/, model );
		} );

		it( 'should split elements to limitElement', () => {
			const div = new Element( 'div', null, p );
			const section = new Element( 'section', null, div );

			root._insertChild( 0, section );

			split( new Position( p, [ 3 ] ), section );

			expect( root.maxOffset ).to.equal( 1 );
			expect( section.maxOffset ).to.equal( 2 );

			expect( section.getChild( 0 ).name ).to.equal( 'div' );
			expect( section.getChild( 0 ).getChild( 0 ).name ).to.equal( 'p' );
			expect( section.getChild( 0 ).getChild( 0 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( count( section.getChild( 0 ).getChild( 0 ).getAttributes() ) ).to.equal( 1 );
			expect( section.getChild( 0 ).getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );

			expect( section.getChild( 1 ).name ).to.equal( 'div' );
			expect( section.getChild( 1 ).getChild( 0 ).name ).to.equal( 'p' );
			expect( section.getChild( 1 ).getChild( 0 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( count( section.getChild( 1 ).getChild( 0 ).getAttributes() ) ).to.equal( 1 );
			expect( section.getChild( 1 ).getChild( 0 ).getChild( 0 ).data ).to.equal( 'bar' );
		} );

		it( 'should throw when limitElement is not a position ancestor', () => {
			const div = new Element( 'div', null, p );
			const section = new Element( 'section', null, div );

			root._insertChild( 0, div );
			root._insertChild( 1, section );

			expectToThrowCKEditorError( () => {
				split( new Position( p, [ 3 ] ), section );
			}, /^writer-split-invalid-limit-element/, model );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );

			expectToThrowCKEditorError( () => {
				writer.split( new Position( root, [ 0, 3 ] ) );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'wrap()', () => {
		let root, range;

		beforeEach( () => {
			root = doc.createRoot();

			root._insertChild( 0, new Text( 'foobar' ) );

			range = new Range( new Position( root, [ 2 ] ), new Position( root, [ 4 ] ) );
		} );

		it( 'should wrap flat range with given element', () => {
			const p = new Element( 'p' );
			wrap( range, p );

			expect( root.maxOffset ).to.equal( 5 );
			expect( root.getChild( 0 ).data ).to.equal( 'fo' );
			expect( root.getChild( 1 ).name ).to.equal( 'p' );
			expect( root.getChild( 1 ).getChild( 0 ).data ).to.equal( 'ob' );
			expect( root.getChild( 2 ).data ).to.equal( 'ar' );
		} );

		it( 'should wrap flat range with an element of given name', () => {
			wrap( range, 'p' );

			expect( root.maxOffset ).to.equal( 5 );
			expect( root.getChild( 0 ).data ).to.equal( 'fo' );
			expect( root.getChild( 1 ).name ).to.equal( 'p' );
			expect( root.getChild( 1 ).getChild( 0 ).data ).to.equal( 'ob' );
			expect( root.getChild( 2 ).data ).to.equal( 'ar' );
		} );

		it( 'should wrap inside document fragment', () => {
			const docFrag = new DocumentFragment( new Text( 'foo' ) );

			wrap( Range._createIn( docFrag ), 'p' );

			expect( docFrag.maxOffset ).to.equal( 1 );
			expect( docFrag.getChild( 0 ).name ).to.equal( 'p' );
			expect( docFrag.getChild( 0 ).getChild( 0 ).data ).to.equal( 'foo' );
		} );

		it( 'should throw if range to wrap is not flat', () => {
			root._insertChild( 1, [ new Element( 'p', [], new Text( 'xyz' ) ) ] );
			const notFlatRange = new Range( new Position( root, [ 3 ] ), new Position( root, [ 6, 2 ] ) );

			expectToThrowCKEditorError( () => {
				wrap( notFlatRange, 'p' );
			}, /^writer-wrap-range-not-flat/, model );
		} );

		it( 'should throw if element to wrap with has children #1', () => {
			const p = new Element( 'p', [], new Text( 'a' ) );

			expectToThrowCKEditorError( () => {
				wrap( range, p );
			}, /^writer-wrap-element-not-empty/, model );
		} );

		it( 'should throw if element to wrap with has children #2', () => {
			const p = new Element( 'p' );
			root._insertChild( 0, p );

			expectToThrowCKEditorError( () => {
				wrap( range, p );
			}, /^writer-wrap-element-attached/, model );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );

			expectToThrowCKEditorError( () => {
				writer.wrap( range, 'p' );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'unwrap()', () => {
		let root, p;

		beforeEach( () => {
			root = doc.createRoot();

			p = new Element( 'p', [], new Text( 'xyz' ) );
			root._insertChild( 0, [ new Text( 'a' ), p, new Text( 'b' ) ] );
		} );

		it( 'should unwrap given element', () => {
			unwrap( p );

			expect( root.maxOffset ).to.equal( 5 );
			expect( root.getChild( 0 ).data ).to.equal( 'axyzb' );
		} );

		it( 'should unwrap inside document fragment', () => {
			const docFrag = new DocumentFragment( new Element( 'p', null, new Text( 'foo' ) ) );

			unwrap( docFrag.getChild( 0 ) );

			expect( docFrag.maxOffset ).to.equal( 3 );
			expect( docFrag.getChild( 0 ).data ).to.equal( 'foo' );
		} );

		it( 'should throw if element to unwrap has no parent', () => {
			const element = new Element( 'p' );

			expectToThrowCKEditorError( () => {
				unwrap( element );
			}, /^writer-unwrap-element-no-parent/, model );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );

			expectToThrowCKEditorError( () => {
				writer.unwrap( p );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'addMarker()', () => {
		let root, range;

		beforeEach( () => {
			root = doc.createRoot();
			root._appendChild( new Text( 'foo' ) );
			range = Range._createIn( root );
		} );

		it( 'should throw if options.usingOperation is not defined', () => {
			expectToThrowCKEditorError( () => {
				addMarker( 'name' );
			}, '^writer-addmarker-no-usingoperation', model );
		} );

		it( 'should throw if name and range is defined but options.usingOperation is not defined', () => {
			expectToThrowCKEditorError( () => {
				addMarker( 'name', { range } );
			}, '^writer-addmarker-no-usingoperation', model );
		} );

		it( 'should add marker to the document marker collection', () => {
			addMarker( 'name', { range, usingOperation: false } );

			expect( model.markers.get( 'name' ).getRange().isEqual( range ) ).to.be.true;
		} );

		it( 'should return marker if that was set directly', () => {
			const marker = addMarker( 'name', { range, usingOperation: false } );

			expect( model.markers.get( 'name' ) ).to.equal( marker );
		} );

		it( 'should return marker if that was set using operation API', () => {
			const marker = addMarker( 'name', { range, usingOperation: true } );

			expect( model.markers.get( 'name' ) ).to.equal( marker );
		} );

		it( 'should return marker with properly set managedUsingOperations (to true)', () => {
			const marker = addMarker( 'name', { range, usingOperation: true } );

			expect( marker.managedUsingOperations ).to.be.true;
		} );

		it( 'should return marker with properly set managedUsingOperations (to false)', () => {
			const marker = addMarker( 'name', { range, usingOperation: false } );

			expect( marker.managedUsingOperations ).to.be.false;
		} );

		it( 'should return marker with properly set affectsData (default to false)', () => {
			const marker = addMarker( 'name', { range, usingOperation: false } );

			expect( marker.affectsData ).to.be.false;
		} );

		it( 'should return marker with properly set affectsData (to false)', () => {
			const marker = addMarker( 'name', { range, usingOperation: false, affectsData: true } );

			expect( marker.affectsData ).to.be.true;
		} );

		it( 'should throw when trying to update existing marker in the document marker collection', () => {
			addMarker( 'name', { range, usingOperation: false } );

			const range2 = new Range( Position._createAt( root, 0 ), Position._createAt( root, 0 ) );

			expectToThrowCKEditorError( () => {
				addMarker( 'name', { range: range2, usingOperation: false } );
			}, 'writer-addmarker-marker-exists', model );
		} );

		it( 'should use operations when having set usingOperation to true', () => {
			const spy = sinon.spy();

			model.on( 'applyOperation', spy );

			addMarker( 'name', { range, usingOperation: true } );
			const op = batch.operations[ 0 ];

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ][ 0 ].type ).to.equal( 'marker' );
			expect( op.oldRange ).to.be.null;
			expect( op.newRange.isEqual( range ) ).to.be.true;
		} );

		it( 'should throw if marker with given name does not exist and range is not passed', () => {
			expectToThrowCKEditorError( () => {
				addMarker( 'name', { usingOperation: true } );
			}, 'writer-addmarker-no-range', model );
		} );

		it( 'should throw if marker is set directly and range is not passed', () => {
			expectToThrowCKEditorError( () => {
				addMarker( 'name', { usingOperation: false } );
			}, 'writer-addmarker-no-range', model );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const marker = addMarker( 'name', { range, usingOperation: false } );
			const writer = new Writer( model, batch );

			expectToThrowCKEditorError( () => {
				writer.addMarker( marker, null, { usingOperation: true } );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'updateMarker()', () => {
		let root, range;

		beforeEach( () => {
			root = doc.createRoot();
			root._appendChild( new Text( 'foo' ) );
			range = Range._createIn( root );
		} );

		it( 'should update managed marker\'s range by marker instance using operations', () => {
			const marker = addMarker( 'name', { range, usingOperation: true } );
			const range2 = new Range( Position._createAt( root, 0 ), Position._createAt( root, 0 ) );

			updateMarker( marker, { range: range2 } );

			expect( batch.operations.length ).to.equal( 2 );

			const op = batch.operations[ 1 ];

			expect( marker.getRange().isEqual( range2 ) ).to.be.true;
			expect( op.oldRange.isEqual( range ) ).to.be.true;
			expect( op.newRange.isEqual( range2 ) ).to.be.true;
		} );

		it( 'should update managed marker\'s range by marker name using operations', () => {
			const marker = addMarker( 'name', { range, usingOperation: true } );
			const range2 = new Range( Position._createAt( root, 0 ), Position._createAt( root, 0 ) );

			updateMarker( 'name', { range: range2 } );

			expect( batch.operations.length ).to.equal( 2 );

			const op = batch.operations[ 1 ];

			expect( marker.getRange().isEqual( range2 ) ).to.be.true;
			expect( op.oldRange.isEqual( range ) ).to.be.true;
			expect( op.newRange.isEqual( range2 ) ).to.be.true;
		} );

		it( 'should update managed marker\'s range by marker instance using operations and usingOperation explicitly passed', () => {
			const marker = addMarker( 'name', { range, usingOperation: true } );
			const range2 = new Range( Position._createAt( root, 0 ), Position._createAt( root, 0 ) );

			updateMarker( marker, { range: range2, usingOperation: true } );

			expect( batch.operations.length ).to.equal( 2 );

			const op = batch.operations[ 1 ];

			expect( marker.getRange().isEqual( range2 ) ).to.be.true;
			expect( op.oldRange.isEqual( range ) ).to.be.true;
			expect( op.newRange.isEqual( range2 ) ).to.be.true;
		} );

		it( 'should update managed marker\'s range by marker name using operations and usingOperation explicitly passed', () => {
			const marker = addMarker( 'name', { range, usingOperation: true } );
			const range2 = new Range( Position._createAt( root, 0 ), Position._createAt( root, 0 ) );

			updateMarker( 'name', { range: range2, usingOperation: true } );

			expect( batch.operations.length ).to.equal( 2 );

			const op = batch.operations[ 1 ];

			expect( marker.getRange().isEqual( range2 ) ).to.be.true;
			expect( op.oldRange.isEqual( range ) ).to.be.true;
			expect( op.newRange.isEqual( range2 ) ).to.be.true;
		} );

		it( 'should not use operations when updating marker which does not use operations', () => {
			const spy = sinon.spy();
			model.on( 'applyOperation', spy );

			const marker = addMarker( 'name', { range, usingOperation: false } );
			const range2 = new Range( Position._createAt( root, 0 ), Position._createAt( root, 0 ) );

			updateMarker( marker, { range: range2 } );

			sinon.assert.notCalled( spy );
		} );

		it( 'should create additional operation when marker type changes to not managed using operation', () => {
			const spy = sinon.spy();
			model.on( 'applyOperation', spy );

			addMarker( 'name', { range, usingOperation: true } );
			updateMarker( 'name', { usingOperation: false } );

			const marker = model.markers.get( 'name' );

			const op1 = batch.operations[ 0 ];
			const op2 = batch.operations[ 1 ];

			sinon.assert.calledTwice( spy );
			expect( spy.firstCall.args[ 1 ][ 0 ].type ).to.equal( 'marker' );
			expect( spy.secondCall.args[ 1 ][ 0 ].type ).to.equal( 'marker' );

			expect( op1.oldRange ).to.be.null;
			expect( op1.newRange.isEqual( range ) ).to.be.true;

			expect( op2.oldRange.isEqual( range ) ).to.be.true;
			expect( op2.newRange ).to.be.null;

			expect( marker.managedUsingOperations ).to.be.false;
		} );

		it( 'should create additional operation when marker type changes to not managed using operation and changing its range', () => {
			const spy = sinon.spy();
			model.on( 'applyOperation', spy );
			const range2 = new Range( Position._createAt( root, 0 ), Position._createAt( root, 0 ) );

			addMarker( 'name', { range, usingOperation: true } );
			updateMarker( 'name', { range: range2, usingOperation: false } );

			const marker = model.markers.get( 'name' );

			const op1 = batch.operations[ 0 ];
			const op2 = batch.operations[ 1 ];

			sinon.assert.calledTwice( spy );
			expect( spy.firstCall.args[ 1 ][ 0 ].type ).to.equal( 'marker' );
			expect( spy.secondCall.args[ 1 ][ 0 ].type ).to.equal( 'marker' );

			expect( op1.oldRange ).to.be.null;
			expect( op1.newRange.isEqual( range ) ).to.be.true;

			expect( op2.oldRange.isEqual( range ) ).to.be.true;
			expect( op2.newRange ).to.be.null;

			expect( marker.getRange().isEqual( range2 ) );

			expect( marker.managedUsingOperations ).to.be.false;
		} );

		it( 'should enable changing marker to be managed using operation', () => {
			const spy = sinon.spy();
			model.on( 'applyOperation', spy );

			addMarker( 'name', { range, usingOperation: false } );
			updateMarker( 'name', { usingOperation: true } );

			const marker = model.markers.get( 'name' );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ][ 0 ].type ).to.equal( 'marker' );

			expect( marker.managedUsingOperations ).to.be.true;
		} );

		it( 'should enable changing marker to be managed using operation while changing range', () => {
			const spy = sinon.spy();
			model.on( 'applyOperation', spy );
			const range2 = new Range( Position._createAt( root, 0 ), Position._createAt( root, 0 ) );

			addMarker( 'name', { range, usingOperation: false } );
			updateMarker( 'name', { range: range2, usingOperation: true } );

			const marker = model.markers.get( 'name' );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ][ 0 ].type ).to.equal( 'marker' );
			expect( marker.getRange().isEqual( range2 ) ).to.be.true;

			expect( marker.managedUsingOperations ).to.be.true;
		} );

		it( 'should allow changing affectsData property not using operations', () => {
			addMarker( 'name', { range, usingOperation: false } );
			updateMarker( 'name', { affectsData: false } );

			const marker = model.markers.get( 'name' );

			expect( marker.affectsData ).to.be.false;
		} );

		it( 'should allow changing affectsData property using operations', () => {
			addMarker( 'name', { range, usingOperation: true } );
			updateMarker( 'name', { affectsData: true } );

			const op1 = batch.operations[ 0 ];
			const op2 = batch.operations[ 1 ];
			const marker = model.markers.get( 'name' );

			expect( op1.affectsData ).to.be.false;
			expect( op2.affectsData ).to.be.true;

			expect( marker.affectsData ).to.be.true;
		} );

		it( 'should not change affectsData property if not provided', () => {
			const range2 = new Range( Position._createAt( root, 0 ), Position._createAt( root, 0 ) );

			addMarker( 'name', { range, affectsData: false, usingOperation: false } );
			updateMarker( 'name', { range: range2 } );

			const marker = model.markers.get( 'name' );

			expect( marker.affectsData ).to.be.false;
		} );

		it( 'should allow changing affectsData and usingOperation', () => {
			addMarker( 'name', { range, usingOperation: true } );
			updateMarker( 'name', { affectsData: true, usingOperation: false } );

			const op1 = batch.operations[ 0 ];
			const op2 = batch.operations[ 1 ];
			const marker = model.markers.get( 'name' );

			expect( op1.affectsData ).to.be.false;
			expect( op2.affectsData ).to.be.true;

			expect( marker.affectsData ).to.be.true;
		} );

		it( 'should allow changing affectsData and usingOperation #2', () => {
			const spy = sinon.spy();
			model.on( 'applyOperation', spy );

			addMarker( 'name', { range, usingOperation: false, affectsData: true } );
			updateMarker( 'name', { usingOperation: true, affectsData: false } );

			const marker = model.markers.get( 'name' );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ][ 0 ].type ).to.equal( 'marker' );

			expect( marker.affectsData ).to.be.false;
		} );

		it( 'should throw when range and usingOperations were not provided', () => {
			expectToThrowCKEditorError( () => {
				addMarker( 'name', { range, usingOperation: false } );
				updateMarker( 'name', {} );
			}, 'writer-updatemarker-wrong-options', model );
		} );

		it( 'should throw when marker provided by name does not exists', () => {
			expectToThrowCKEditorError( () => {
				updateMarker( 'name', { usingOperation: false } );
			}, 'writer-updatemarker-marker-not-exists', model );
		} );

		it( 'should only refresh (but warn()) the marker when there is no provided options to update', () => {
			const marker = addMarker( 'name', { range, usingOperation: true } );
			const spy = sinon.spy( model.markers, '_refresh' );
			const consoleWarnStub = testUtils.sinon.stub( console, 'warn' );

			updateMarker( marker );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, marker );
			sinon.assert.calledOnce( consoleWarnStub );
			sinon.assert.calledWithExactly( consoleWarnStub.firstCall,
				sinon.match( /^writer-updatemarker-reconvert-using-editingcontroller/ ),
				{ markerName: 'name' },
				sinon.match.string // Link to the documentation
			);

			updateMarker( 'name' );

			sinon.assert.calledTwice( spy );
			sinon.assert.calledWithExactly( spy.secondCall, marker );
			sinon.assert.calledTwice( consoleWarnStub );
			sinon.assert.calledWithExactly( consoleWarnStub.secondCall,
				sinon.match( /^writer-updatemarker-reconvert-using-editingcontroller/ ),
				{ markerName: 'name' },
				sinon.match.string // Link to the documentation
			);
		} );

		it( 'should throw when trying to use detached writer', () => {
			const marker = addMarker( 'name', { range, usingOperation: false } );
			const writer = new Writer( model, batch );

			expectToThrowCKEditorError( () => {
				writer.updateMarker( marker, { usingOperation: true } );
			}, /^writer-incorrect-use/, model );
		} );
	} );

	describe( 'removeMarker()', () => {
		let root, range;

		beforeEach( () => {
			root = doc.createRoot();
			root._appendChild( new Text( 'foo' ) );
			range = Range._createIn( root );
		} );

		it( 'should remove marker from the document marker collection', () => {
			addMarker( 'name', { range, usingOperation: false } );
			removeMarker( 'name' );

			expect( model.markers.get( 'name' ) ).to.be.null;
		} );

		it( 'should throw when trying to remove non existing marker', () => {
			expectToThrowCKEditorError( () => {
				removeMarker( 'name' );
			}, 'writer-removemarker-no-marker', model );
		} );

		it( 'should throw when trying to use detached writer', () => {
			const writer = new Writer( model, batch );

			expectToThrowCKEditorError( () => {
				writer.removeMarker( 'name' );
			}, /^writer-incorrect-use/, model );
		} );

		it( 'should accept marker instance', () => {
			addMarker( 'name', { range, usingOperation: false } );
			const marker = model.markers.get( 'name' );

			removeMarker( marker );

			expect( model.markers.get( 'name' ) ).to.be.null;
		} );

		it( 'should use MarkerOperation when marker was created using operation', () => {
			addMarker( 'name', { range, usingOperation: true } );

			const marker = model.markers.get( 'name' );
			const spy = sinon.spy();

			model.on( 'applyOperation', spy );

			removeMarker( marker );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ][ 0 ].type ).to.equal( 'marker' );
			expect( model.markers.get( 'name' ) ).to.be.null;
		} );
	} );

	describe( 'addRoot()', () => {
		it( 'should add an empty, attached root to the model and return it', () => {
			model.change( writer => {
				const root = writer.addRoot( 'new' );

				expect( model.document.getRoot( 'new' ) ).to.equal( root );
				expect( root.isAttached() ).to.be.true;
			} );
		} );

		it( 'should add a root with specified element name', () => {
			model.change( writer => {
				const root = writer.addRoot( 'new', 'div' );

				expect( root.name ).to.equal( 'div' );
			} );
		} );

		it( 'should re-attach the root if it was previously detached', () => {
			model.change( writer => {
				writer.addRoot( 'new' );
				writer.detachRoot( 'new' );
			} );

			model.change( writer => {
				const root = writer.addRoot( 'new' );

				expect( root.isAttached() ).to.be.true;
			} );
		} );

		it( 'should throw when root with such name already exists and is attached', () => {
			model.change( writer => {
				writer.addRoot( 'new' );

				expectToThrowCKEditorError( () => {
					writer.addRoot( 'new' );
				}, /^writer-addroot-root-exists/, model );
			} );
		} );

		it( 'should use RootOperation to modify the model', () => {
			model.change( writer => {
				const version = model.document.version;

				writer.addRoot( 'new', 'div' );

				const op = model.document.history.getOperation( version );

				expect( op.type ).to.equal( 'addRoot' );
				expect( op.rootName ).to.equal( 'new' );
				expect( op.elementName ).to.equal( 'div' );
				expect( op.baseVersion ).to.equal( version );
				expect( op.isAdd ).to.equal( true );
			} );
		} );
	} );

	describe( 'detachRoot()', () => {
		it( 'should detach the root from the model and remove all children, attributes and markers from it', () => {
			let root, p;

			model.change( writer => {
				root = writer.addRoot( 'new' );
				p = writer.createElement( 'paragraph' );
				writer.insert( p, root, 0 );
				writer.setAttribute( 'foo', true, root );
				writer.setAttribute( 'bar', false, root );
				writer.addMarker( 'newMarker', { usingOperation: true, affectsData: true, range: writer.createRangeIn( root ) } );
			} );

			model.change( writer => {
				writer.detachRoot( root );
			} );

			expect( root.isAttached() ).to.be.false;
			expect( root.isEmpty );
			expect( Array.from( root.getAttributes() ).length ).to.equal( 0 );
			expect( p.parent.rootName ).to.equal( '$graveyard' );
			expect( model.markers.get( 'newMarker' ) ).to.be.null;
		} );

		it( 'should not remove markers when root in range is different than the detached root', () => {
			let root;

			model.change( writer => {
				root = writer.addRoot( 'new' );
				const otherRoot = writer.addRoot( 'otherRoot' );
				writer.addMarker( 'newMarker', { usingOperation: true, affectsData: true, range: writer.createRangeIn( otherRoot ) } );
			} );

			model.change( writer => {
				writer.detachRoot( root );
			} );

			expect( model.markers.get( 'newMarker' ) ).not.to.be.null;
		} );

		it( 'should accept root name as a parameter', () => {
			model.change( writer => {
				writer.addRoot( 'new' );
				writer.detachRoot( 'new' );
			} );

			expect( model.document.getRoot( 'new' ).isAttached() ).to.be.false;
		} );

		it( 'should throw when trying to detach a non-existing root', () => {
			model.change( writer => {
				expectToThrowCKEditorError( () => {
					writer.detachRoot( 'foo' );
				}, /^writer-detachroot-no-root/, model );
			} );
		} );

		it( 'should throw when trying to detach an already detached root', () => {
			model.change( writer => {
				writer.addRoot( 'foo' );
				writer.detachRoot( 'foo' );

				expectToThrowCKEditorError( () => {
					writer.detachRoot( 'foo' );
				}, /^writer-detachroot-no-root/, model );
			} );
		} );

		it( 'should use RootOperation to modify the model', () => {
			model.change( writer => {
				writer.addRoot( 'new', 'div' );

				const version = model.document.version;

				writer.detachRoot( 'new' );

				const op = model.document.history.getOperation( version );

				expect( op.type ).to.equal( 'detachRoot' );
				expect( op.rootName ).to.equal( 'new' );
				expect( op.elementName ).to.equal( 'div' );
				expect( op.baseVersion ).to.equal( version );
				expect( op.isAdd ).to.equal( false );
			} );
		} );
	} );

	describe( 'setSelection()', () => {
		let root;

		beforeEach( () => {
			model.schema.register( 'p', { inheritAllFrom: '$block' } );
			model.schema.extend( 'p', { allowIn: '$root' } );

			root = doc.createRoot();
			root._appendChild( [
				new Element( 'p' ),
				new Element( 'p' ),
				new Element( 'p', [], new Text( 'foo' ) )
			] );
		} );

		it( 'should use DocumentSelection#_setTo method', () => {
			const firstParagraph = root.getNodeByPath( [ 1 ] );

			const setToSpy = sinon.spy( DocumentSelection.prototype, '_setTo' );
			setSelection( firstParagraph, 0 );

			expect( setToSpy.calledOnce ).to.be.true;
			setToSpy.restore();
		} );

		it( 'should change document selection ranges', () => {
			const range = new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 2, 2 ] ) );

			setSelection( range, { backward: true } );

			expect( model.document.selection._ranges.length ).to.equal( 1 );
			expect( model.document.selection._ranges[ 0 ].start.path ).to.deep.equal( [ 1, 0 ] );
			expect( model.document.selection._ranges[ 0 ].end.path ).to.deep.equal( [ 2, 2 ] );
			expect( model.document.selection.isBackward ).to.be.true;
		} );
	} );

	describe( 'setSelectionFocus()', () => {
		let root;

		beforeEach( () => {
			model.schema.register( 'p', { inheritAllFrom: '$block' } );
			model.schema.extend( 'p', { allowIn: '$root' } );

			root = doc.createRoot();
			root._appendChild( [
				new Element( 'p' ),
				new Element( 'p' ),
				new Element( 'p', [], new Text( 'foo' ) )
			] );
		} );

		it( 'should use DocumentSelection#_setFocus method', () => {
			const firstParagraph = root.getNodeByPath( [ 1 ] );

			const setFocusSpy = sinon.spy( DocumentSelection.prototype, '_setFocus' );
			setSelectionFocus( firstParagraph, 0 );

			expect( setFocusSpy.calledOnce ).to.be.true;
			setFocusSpy.restore();
		} );

		it( 'should change document selection ranges', () => {
			setSelection( new Position( root, [ 0, 0 ] ) );
			setSelectionFocus( new Position( root, [ 2, 2 ] ) );

			expect( model.document.selection._ranges.length ).to.equal( 1 );
			expect( model.document.selection._ranges[ 0 ].start.path ).to.deep.equal( [ 0, 0 ] );
			expect( model.document.selection._ranges[ 0 ].end.path ).to.deep.equal( [ 2, 2 ] );
		} );
	} );

	describe( 'setSelectionAttribute()', () => {
		const fooStoreAttrKey = DocumentSelection._getStoreAttributeKey( 'foo' );
		let root, rangeInEmptyP, emptyP;

		beforeEach( () => {
			model.schema.register( 'p', { inheritAllFrom: '$block' } );
			model.schema.extend( 'p', { allowIn: '$root' } );

			root = doc.createRoot();
			root._appendChild( [
				new Element( 'p', [], [] ),
				new Element( 'p' ),
				new Element( 'p', [], new Text( 'foo' ) )
			] );

			rangeInEmptyP = new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 0 ] ) );
			emptyP = root.getChild( 0 );
		} );

		it( 'should store attribute if the selection is in empty node', () => {
			setSelection( rangeInEmptyP );
			setSelectionAttribute( 'foo', 'bar' );

			expect( model.document.selection.getAttribute( 'foo' ) ).to.equal( 'bar' );

			expect( emptyP.getAttribute( fooStoreAttrKey ) ).to.equal( 'bar' );
		} );

		it( 'should be able to store attributes from the given object', () => {
			setSelection( rangeInEmptyP );
			setSelectionAttribute( { key1: 'foo', key2: 'bar' } );

			expect( model.document.selection.getAttribute( 'key1' ) ).to.equal( 'foo' );
			expect( model.document.selection.getAttribute( 'key2' ) ).to.equal( 'bar' );
		} );

		it( 'should be able to store attributes from the given iterable', () => {
			setSelection( rangeInEmptyP );
			setSelectionAttribute( new Map( [ [ 'key1', 'foo' ], [ 'key2', 'bar' ] ] ) );

			expect( model.document.selection.getAttribute( 'key1' ) ).to.equal( 'foo' );
			expect( model.document.selection.getAttribute( 'key2' ) ).to.equal( 'bar' );
		} );
	} );

	describe( 'removeSelectionAttribute()', () => {
		const fooStoreAttrKey = DocumentSelection._getStoreAttributeKey( 'foo' );
		let root, rangeInEmptyP, emptyP;

		beforeEach( () => {
			model.schema.register( 'p', { inheritAllFrom: '$block' } );
			model.schema.extend( 'p', { allowIn: '$root' } );

			root = doc.createRoot();
			root._appendChild( [
				new Element( 'p', [], [] ),
				new Element( 'p' ),
				new Element( 'p', [], new Text( 'foo' ) )
			] );

			rangeInEmptyP = new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 0 ] ) );
			emptyP = root.getChild( 0 );
		} );

		it( 'should remove stored attribute if the selection is in empty node', () => {
			setSelection( rangeInEmptyP );
			setSelectionAttribute( 'foo', 'bar' );
			removeSelectionAttribute( 'foo' );

			expect( model.document.selection.getAttribute( 'foo' ) ).to.be.undefined;

			expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.false;
		} );

		it( 'should remove all attributes from the given iterable', () => {
			setSelection( rangeInEmptyP );
			setSelectionAttribute( 'foo', 'bar' );
			setSelectionAttribute( 'foo2', 'bar2' );
			removeSelectionAttribute( [ 'foo', 'foo2' ] );

			expect( model.document.selection.getAttribute( 'foo' ) ).to.be.undefined;
			expect( model.document.selection.getAttribute( 'foo2' ) ).to.be.undefined;

			expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.false;
		} );

		it( 'should do nothing if attribute does not exist in the selection', () => {
			setSelection( rangeInEmptyP );
			setSelectionAttribute( 'foo', 'bar' );
			setSelectionAttribute( 'foo2', 'bar2' );
			removeSelectionAttribute( [ 'foo', 'baz' ] );

			expect( model.document.selection.getAttribute( 'foo' ) ).to.be.undefined;
			expect( model.document.selection.getAttribute( 'foo2' ) ).to.equal( 'bar2' );

			expect( emptyP.hasAttribute( fooStoreAttrKey ) ).to.be.false;
		} );
	} );

	describe( 'overrideSelectionGravity()', () => {
		it( 'should use DocumentSelection#_overrideGravity', () => {
			const overrideGravitySpy = sinon.spy( DocumentSelection.prototype, '_overrideGravity' );

			overrideSelectionGravity();

			sinon.assert.calledOnce( overrideGravitySpy );
			overrideGravitySpy.restore();
		} );

		it( 'should return the unique id', () => {
			expect( overrideSelectionGravity() ).to.be.a( 'string' );
		} );

		it( 'should not get attributes from the node before the caret when gravity is overridden', () => {
			const root = doc.createRoot();
			root._appendChild( [
				new Text( 'foo', { foo: true } ),
				new Text( 'bar', { foo: true, bar: true } ),
				new Text( 'biz', { foo: true } )
			] );

			setSelection( new Position( root, [ 6 ] ) );

			expect( Array.from( model.document.selection.getAttributeKeys() ) ).to.deep.equal( [ 'foo', 'bar' ] );

			overrideSelectionGravity();

			expect( Array.from( model.document.selection.getAttributeKeys() ) ).to.deep.equal( [ 'foo' ] );
			expect( model.document.selection.isGravityOverridden ).to.true;

			// Moving selection should not restore the gravity.
			setSelection( new Position( root, [ 5 ] ) );

			expect( Array.from( model.document.selection.getAttributeKeys() ) ).to.deep.equal( [ 'foo', 'bar' ] );
			expect( model.document.selection.isGravityOverridden ).to.true;
		} );
	} );

	describe( 'restoreSelectionGravity()', () => {
		it( 'should use DocumentSelection#_restoreGravity', () => {
			const overrideUid = overrideSelectionGravity();
			const restoreGravitySpy = sinon.spy( DocumentSelection.prototype, '_restoreGravity' );

			restoreSelectionGravity( overrideUid );

			sinon.assert.calledOnce( restoreGravitySpy );
			restoreGravitySpy.restore();
		} );

		it( 'should restore overridden gravity to default', () => {
			const root = doc.createRoot();
			root._appendChild( [
				new Text( 'foo', { foo: true } ),
				new Text( 'bar', { foo: true, bar: true } ),
				new Text( 'biz', { foo: true } )
			] );

			setSelection( new Position( root, [ 6 ] ) );

			const overrideUid = overrideSelectionGravity();

			expect( Array.from( model.document.selection.getAttributeKeys() ) ).to.deep.equal( [ 'foo' ] );

			restoreSelectionGravity( overrideUid );

			expect( Array.from( model.document.selection.getAttributeKeys() ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );
	} );

	describe( 'createPositionFromPath()', () => {
		it( 'should call model.createPositionFromPath()', () => {
			const stub = sinon.stub( model, 'createPositionFromPath' );

			model.change( writer => {
				writer.createPositionFromPath();
			} );

			sinon.assert.calledOnce( stub );
		} );
	} );

	describe( 'createPositionAt()', () => {
		it( 'should call model.createPositionAt()', () => {
			const stub = sinon.stub( model, 'createPositionAt' );

			model.change( writer => {
				writer.createPositionAt();
			} );

			sinon.assert.calledOnce( stub );
		} );
	} );

	describe( 'createPositionAfter()', () => {
		it( 'should call model.createPositionAfter()', () => {
			const stub = sinon.stub( model, 'createPositionAfter' );

			model.change( writer => {
				writer.createPositionAfter();
			} );

			sinon.assert.calledOnce( stub );
		} );
	} );

	describe( 'createPositionBefore()', () => {
		it( 'should call model.createPositionBefore()', () => {
			const stub = sinon.stub( model, 'createPositionBefore' );

			model.change( writer => {
				writer.createPositionBefore();
			} );

			sinon.assert.calledOnce( stub );
		} );
	} );

	describe( 'createRange()', () => {
		it( 'should call model.createRange()', () => {
			const stub = sinon.stub( model, 'createRange' );

			model.change( writer => {
				writer.createRange();
			} );

			sinon.assert.calledOnce( stub );
		} );
	} );

	describe( 'createRangeIn()', () => {
		it( 'should call model.createRangeIn()', () => {
			const stub = sinon.stub( model, 'createRangeIn' );

			model.change( writer => {
				writer.createRangeIn();
			} );

			sinon.assert.calledOnce( stub );
		} );
	} );

	describe( 'createRangeOn()', () => {
		it( 'should call model.createRangeOn()', () => {
			const stub = sinon.stub( model, 'createRangeOn' );

			model.change( writer => {
				writer.createRangeOn();
			} );

			sinon.assert.calledOnce( stub );
		} );
	} );

	describe( 'createSelection()', () => {
		it( 'should call model.createSelection()', () => {
			const stub = sinon.stub( model, 'createSelection' );

			model.change( writer => {
				writer.createSelection();
			} );

			sinon.assert.calledOnce( stub );
		} );
	} );

	function createText( data, attributes ) {
		return model.change( writer => {
			return writer.createText( data, attributes );
		} );
	}

	function createElement( name, attributes ) {
		return model.change( writer => {
			return writer.createElement( name, attributes );
		} );
	}

	function createDocumentFragment() {
		return model.change( writer => {
			return writer.createDocumentFragment();
		} );
	}

	function cloneElement( element, deep ) {
		return model.change( writer => {
			return writer.cloneElement( element, deep );
		} );
	}

	function insert( item, itemOrPosition, offset ) {
		model.enqueueChange( batch, writer => {
			writer.insert( item, itemOrPosition, offset );
		} );
	}

	function insertText( text, attributes, itemOrPosition, offset ) {
		model.enqueueChange( batch, writer => {
			writer.insertText( text, attributes, itemOrPosition, offset );
		} );
	}

	function insertElement( name, attributes, itemOrPosition, offset ) {
		model.enqueueChange( batch, writer => {
			writer.insertElement( name, attributes, itemOrPosition, offset );
		} );
	}

	function append( item, parent ) {
		model.enqueueChange( batch, writer => {
			writer.append( item, parent );
		} );
	}

	function appendText( text, attributes, parent ) {
		model.enqueueChange( batch, writer => {
			writer.appendText( text, attributes, parent );
		} );
	}

	function appendElement( name, attributes, parent ) {
		model.enqueueChange( batch, writer => {
			writer.appendElement( name, attributes, parent );
		} );
	}

	function setAttribute( key, value, itemOrRange ) {
		model.enqueueChange( batch, writer => {
			writer.setAttribute( key, value, itemOrRange );
		} );
	}

	function setAttributes( attributes, itemOrRange ) {
		model.enqueueChange( batch, writer => {
			writer.setAttributes( attributes, itemOrRange );
		} );
	}

	function removeAttribute( key, itemOrRange ) {
		model.enqueueChange( batch, writer => {
			writer.removeAttribute( key, itemOrRange );
		} );
	}

	function clearAttributes( itemOrRange ) {
		model.enqueueChange( batch, writer => {
			writer.clearAttributes( itemOrRange );
		} );
	}

	function move( range, itemOrPosition, offset ) {
		model.enqueueChange( batch, writer => {
			writer.move( range, itemOrPosition, offset );
		} );
	}

	function remove( itemOrRange ) {
		model.enqueueChange( batch, writer => {
			writer.remove( itemOrRange );
		} );
	}

	function merge( position ) {
		model.enqueueChange( batch, writer => {
			writer.merge( position );
		} );
	}

	function rename( element, newName ) {
		model.enqueueChange( batch, writer => {
			writer.rename( element, newName );
		} );
	}

	function split( position, limitElement ) {
		model.enqueueChange( batch, writer => {
			writer.split( position, limitElement );
		} );
	}

	function wrap( range, elementOrString ) {
		model.enqueueChange( batch, writer => {
			writer.wrap( range, elementOrString );
		} );
	}

	function unwrap( element ) {
		model.enqueueChange( batch, writer => {
			writer.unwrap( element );
		} );
	}

	function addMarker( name, options ) {
		let marker;

		model.enqueueChange( batch, writer => {
			marker = writer.addMarker( name, options );
		} );

		return marker;
	}

	function updateMarker( markerOrName, options ) {
		model.enqueueChange( batch, writer => {
			writer.updateMarker( markerOrName, options );
		} );
	}

	function removeMarker( markerOrName, options ) {
		model.enqueueChange( batch, writer => {
			writer.removeMarker( markerOrName, options );
		} );
	}

	function setSelection( selectable, optionsOrPlaceOrOffset, options ) {
		model.enqueueChange( batch, writer => {
			writer.setSelection( selectable, optionsOrPlaceOrOffset, options );
		} );
	}

	function setSelectionFocus( itemOrPosition, offset ) {
		model.enqueueChange( batch, writer => {
			writer.setSelectionFocus( itemOrPosition, offset );
		} );
	}

	function setSelectionAttribute( key, value ) {
		model.enqueueChange( batch, writer => {
			writer.setSelectionAttribute( key, value );
		} );
	}

	function removeSelectionAttribute( key ) {
		model.enqueueChange( batch, writer => {
			writer.removeSelectionAttribute( key );
		} );
	}

	function overrideSelectionGravity() {
		return model.change( writer => {
			return writer.overrideSelectionGravity();
		} );
	}

	function restoreSelectionGravity( overrideUid ) {
		model.change( writer => {
			writer.restoreSelectionGravity( overrideUid );
		} );
	}
} );
