/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../src/model/model';
import Document from '../../src/model/document';
import RootElement from '../../src/model/rootelement';
import Text from '../../src/model/text';
import Batch from '../../src/model/batch';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import count from '@ckeditor/ckeditor5-utils/src/count';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'Document', () => {
	let model, doc;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
	} );

	describe( 'constructor()', () => {
		it( 'should create Document with no data, empty graveyard and selection set to default range', () => {
			const doc = new Document( model );

			expect( doc ).to.have.property( 'model' ).to.equal( model );
			expect( doc ).to.have.property( 'roots' ).that.is.instanceof( Collection );
			expect( doc.roots.length ).to.equal( 1 );
			expect( doc.graveyard ).to.be.instanceof( RootElement );
			expect( doc.graveyard.maxOffset ).to.equal( 0 );
			expect( count( doc.selection.getRanges() ) ).to.equal( 1 );
		} );
	} );

	describe( 'model#applyOperation listener', () => {
		let operation, data, batch;

		beforeEach( () => {
			data = { data: 'x' };

			operation = {
				type: 't',
				baseVersion: 0,
				isDocumentOperation: true,
				_execute: sinon.stub().returns( data ),
				_validate: () => {},
				toJSON() {
					// This method creates only a shallow copy, all nested objects should be defined separately.
					// See https://github.com/ckeditor/ckeditor5-engine/issues/1477.
					const json = Object.assign( {}, this );

					// Remove reference to the parent `Batch` to avoid circular dependencies.
					delete json.batch;

					return json;
				}
			};

			batch = new Batch();
			batch.addOperation( operation );
		} );

		it( 'for document operation: should increase document version and execute operation', () => {
			model.applyOperation( operation );

			expect( doc.version ).to.equal( 1 );
			expect( doc.history.getOperations().length ).to.equal( 1 );
			sinon.assert.calledOnce( operation._execute );
		} );

		it( 'for non-document operation: should only execute operation', () => {
			operation.isDocumentOperation = false;

			model.applyOperation( operation );

			expect( doc.version ).to.equal( 0 );
			expect( doc.history.getOperations().length ).to.equal( 0 );
			sinon.assert.calledOnce( operation._execute );
		} );

		it( 'should do nothing if operation event was cancelled', () => {
			model.on( 'applyOperation', evt => evt.stop(), { priority: 'highest' } );

			model.applyOperation( operation );

			expect( doc.version ).to.equal( 0 );
			expect( operation._execute.called ).to.be.false;
		} );

		it( 'should throw an error on the operation base version and the document version is different', () => {
			const operation = {
				type: 't',
				baseVersion: 1,
				isDocumentOperation: true,
				_execute: sinon.stub().returns( data ),
				_validate: () => {}
			};

			expectToThrowCKEditorError( () => {
				model.applyOperation( operation );
			}, 'model-document-history-addoperation-incorrect-version', model, {
				operation,
				historyVersion: 0
			} );
		} );
	} );

	describe( '#version', () => {
		it( 'should equal to document.history.version', () => {
			model.document.history.version = 20;

			expect( model.document.version ).to.equal( 20 );
		} );

		it( 'should set document.history.version', () => {
			model.document.version = 20;

			expect( model.document.history.version ).to.equal( 20 );
		} );
	} );

	describe( 'getRootNames()', () => {
		it( 'should return empty iterator if no roots exist', () => {
			expect( count( doc.getRootNames() ) ).to.equal( 0 );
		} );

		it( 'should return an iterator of all roots without the graveyard', () => {
			doc.createRoot( '$root', 'a' );
			doc.createRoot( '$root', 'b' );

			expect( Array.from( doc.getRootNames() ) ).to.deep.equal( [ 'a', 'b' ] );
		} );
	} );

	describe( 'createRoot()', () => {
		it( 'should create a new RootElement with default element and root names, add it to roots map and return it', () => {
			const root = doc.createRoot();

			expect( doc.roots.length ).to.equal( 2 );
			expect( root ).to.be.instanceof( RootElement );
			expect( root.maxOffset ).to.equal( 0 );
			expect( root ).to.have.property( 'name', '$root' );
			expect( root ).to.have.property( 'rootName', 'main' );
		} );

		it( 'should create a new RootElement with custom element and root names, add it to roots map and return it', () => {
			const root = doc.createRoot( 'customElementName', 'customRootName' );

			expect( doc.roots.length ).to.equal( 2 );
			expect( root ).to.be.instanceof( RootElement );
			expect( root.maxOffset ).to.equal( 0 );
			expect( root ).to.have.property( 'name', 'customElementName' );
			expect( root ).to.have.property( 'rootName', 'customRootName' );
		} );

		it( 'should throw an error when trying to create a second root with the same name', () => {
			doc.createRoot( '$root', 'rootName' );

			expectToThrowCKEditorError( () => {
				doc.createRoot( '$root', 'rootName' );
			}, 'model-document-createroot-name-exists', model );
		} );
	} );

	describe( 'getRoot()', () => {
		it( 'should return a RootElement with default "main" name', () => {
			const newRoot = doc.createRoot( 'main' );

			expect( doc.getRoot() ).to.equal( newRoot );
		} );

		it( 'should return a RootElement with custom name', () => {
			const newRoot = doc.createRoot( 'custom', 'custom' );

			expect( doc.getRoot( 'custom' ) ).to.equal( newRoot );
		} );

		it( 'should return null when trying to get non-existent root', () => {
			expect( doc.getRoot( 'not-existing' ) ).to.null;
		} );
	} );

	describe( '_getDefaultRoot()', () => {
		it( 'should return graveyard root if there are no other roots in the document', () => {
			expect( doc._getDefaultRoot() ).to.equal( doc.graveyard );
		} );

		it( 'should return the first root added to the document', () => {
			const rootA = doc.createRoot( '$root', 'rootA' );
			doc.createRoot( '$root', 'rootB' );
			doc.createRoot( '$root', 'rootC' );

			expect( doc._getDefaultRoot() ).to.equal( rootA );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy selection instance', () => {
			const spy = sinon.spy( doc.selection, 'destroy' );

			doc.destroy();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should stop listening to events', () => {
			const spy = sinon.spy();

			doc.listenTo( model, 'something', spy );

			model.fire( 'something' );

			sinon.assert.calledOnce( spy );

			doc.destroy();

			model.fire( 'something' );

			// Still once.
			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'differ', () => {
		beforeEach( () => {
			doc.createRoot();
		} );

		it( 'should buffer document operations in differ', () => {
			sinon.spy( doc.differ, 'bufferOperation' );

			model.change( writer => {
				writer.insertText( 'foo', doc.getRoot(), 0 );
			} );

			expect( doc.differ.bufferOperation.called ).to.be.true;
		} );

		it( 'should not buffer changes not done on document', () => {
			sinon.spy( doc.differ, 'bufferOperation' );

			model.change( writer => {
				const docFrag = writer.createDocumentFragment();
				writer.insertText( 'foo', docFrag, 0 );
			} );

			expect( doc.differ.bufferOperation.called ).to.be.false;
		} );

		it( 'should buffer marker changes in differ', () => {
			sinon.spy( doc.differ, 'bufferMarkerChange' );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( doc.getRoot(), 0 ) );
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			expect( doc.differ.bufferMarkerChange.called ).to.be.true;
		} );

		it( 'should reset differ after change block is done', () => {
			model.change( writer => {
				writer.insertText( 'foo', doc.getRoot(), 0 );

				expect( doc.differ.getChanges().length > 0 ).to.be.true;
			} );

			expect( doc.differ.getChanges().length ).to.equal( 0 );
		} );
	} );

	describe( 'registerPostFixer()', () => {
		beforeEach( () => {
			doc.createRoot();
		} );

		it( 'should add a callback that is fired after changes are done', () => {
			const spy = sinon.spy();

			doc.registerPostFixer( spy );

			model.change( writer => {
				writer.insertText( 'foo', doc.getRoot(), 0 );
			} );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should not fire callbacks if no changes on document were done', () => {
			const spy = sinon.spy();

			doc.registerPostFixer( spy );

			model.change( writer => {
				const docFrag = writer.createDocumentFragment();

				writer.insertText( 'foo', docFrag, 0 );
			} );

			expect( spy.called ).to.be.false;
		} );

		it( 'should call all already processed callbacks again if a callback returned true', () => {
			const callA = sinon.spy();

			const callB = sinon.stub();
			callB.onFirstCall().returns( true ).onSecondCall().returns( false );
			const callC = sinon.spy();

			doc.registerPostFixer( callA );
			doc.registerPostFixer( callB );
			doc.registerPostFixer( callC );

			model.change( writer => {
				writer.insertText( 'foo', doc.getRoot(), 0 );
			} );

			sinon.assert.calledTwice( callA );
			sinon.assert.calledTwice( callB );
			sinon.assert.calledOnce( callC );
		} );
	} );

	describe( 'event change', () => {
		it( 'should be fired if there was a change in a document tree in a change block and have a batch as a param', () => {
			doc.createRoot();
			const spy = sinon.spy();

			doc.on( 'change', ( evt, batch ) => {
				spy();
				expect( batch ).to.be.instanceof( Batch );
			} );

			model.change( writer => {
				writer.insertText( 'foo', doc.getRoot(), 0 );
			} );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should be fired if there was a selection change in an (enqueue)change block', () => {
			const root = doc.createRoot();
			const spy = sinon.spy();

			root._appendChild( new Text( 'foo' ) );

			doc.on( 'change', spy );

			model.change( writer => {
				writer.setSelection( root, 2 );
			} );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should not be fired if writer was used on non-document tree', () => {
			const spy = sinon.spy();

			doc.on( 'change', ( evt, batch ) => {
				spy();
				expect( batch ).to.be.instanceof( Batch );
			} );

			model.change( writer => {
				const docFrag = writer.createDocumentFragment();
				writer.insertText( 'foo', docFrag, 0 );
			} );

			sinon.assert.notCalled( spy );
		} );
	} );

	describe( 'event change:data', () => {
		it( 'should be fired if there was a change in a document tree in a change block and have a batch as a param', () => {
			doc.createRoot();
			const spy = sinon.spy();

			doc.on( 'change:data', ( evt, batch ) => {
				spy();
				expect( batch ).to.be.instanceof( Batch );
			} );

			model.change( writer => {
				writer.insertText( 'foo', doc.getRoot(), 0 );
			} );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should not be fired if only selection changes', () => {
			const root = doc.createRoot();
			const spy = sinon.spy();

			root._appendChild( new Text( 'foo' ) );

			doc.on( 'change:data', spy );

			model.change( writer => {
				writer.setSelection( root, 2 );
			} );

			sinon.assert.notCalled( spy );
		} );

		it( 'should be fired if default marker operation is applied', () => {
			const root = doc.createRoot();
			const spy = sinon.spy();

			root._appendChild( new Text( 'foo' ) );

			doc.on( 'change:data', spy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: true, affectsData: true } );
			} );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should not be fired if the marker operation is applied and marker does not affect data', () => {
			const root = doc.createRoot();
			const spy = sinon.spy();

			root._appendChild( new Text( 'foo' ) );

			doc.on( 'change:data', spy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: true } );
			} );

			sinon.assert.notCalled( spy );
		} );

		it( 'should be fired if the writer adds marker not managed by using operations', () => {
			const root = doc.createRoot();
			const spy = sinon.spy();

			root._appendChild( new Text( 'foo' ) );

			doc.on( 'change:data', spy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: false, affectsData: true } );
			} );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should not be fired if the writer adds marker not managed by using operations with affectsData set to false', () => {
			const root = doc.createRoot();
			const spy = sinon.spy();

			root._appendChild( new Text( 'foo' ) );

			doc.on( 'change:data', spy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: false } );
			} );

			sinon.assert.notCalled( spy );
		} );

		it( 'should not be fired if writer was used on non-document tree', () => {
			const spy = sinon.spy();

			doc.on( 'change:data', ( evt, batch ) => {
				spy();
				expect( batch ).to.be.instanceof( Batch );
			} );

			model.change( writer => {
				const docFrag = writer.createDocumentFragment();
				writer.insertText( 'foo', docFrag, 0 );
			} );

			sinon.assert.notCalled( spy );
		} );

		it( 'should be fired when marker changes affecting data', () => {
			const root = doc.createRoot();
			root._appendChild( new Text( 'foo' ) );

			const sandbox = sinon.createSandbox();
			const changeDataSpy = sandbox.spy();
			const changeSpy = sandbox.spy();

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: true } );
			} );

			doc.on( 'change:data', changeDataSpy );
			doc.on( 'change', changeSpy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 3 ) );
				writer.updateMarker( 'name', { range, affectsData: true } );
			} );

			sinon.assert.calledOnce( changeSpy );
			sinon.assert.calledOnce( changeDataSpy );

			sandbox.resetHistory();

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.updateMarker( 'name', { affectsData: false, range } );
			} );

			sinon.assert.calledOnce( changeSpy );
			sinon.assert.calledOnce( changeDataSpy );
		} );

		it( 'should not be fired when marker does not affect data', () => {
			const root = doc.createRoot();
			root._appendChild( new Text( 'foo' ) );

			const sandbox = sinon.createSandbox();
			const changeDataSpy = sandbox.spy();
			const changeSpy = sandbox.spy();

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: false, affectsData: false } );
			} );

			doc.on( 'change:data', changeDataSpy );
			doc.on( 'change', changeSpy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 3 ) );
				writer.updateMarker( 'name', { range } );
			} );

			sinon.assert.calledOnce( changeSpy );
			sinon.assert.notCalled( changeDataSpy );
		} );

		it( 'should not be fired when the marker range does not change', () => {
			const root = doc.createRoot();
			root._appendChild( new Text( 'foo' ) );

			const changeDataSpy = sinon.spy();

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: true, affectsData: true } );
			} );

			doc.on( 'change:data', changeDataSpy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.updateMarker( 'name', { range } );
			} );

			sinon.assert.notCalled( changeDataSpy );
		} );

		// There are no strong preferences here.
		// This case is a bit artificial so perhaps it's better to stay on the safe side and fire the change:data event
		// even when the marker is empty. But if there is a problem with it, this behavior can be easily changed.
		it( 'should be fired when the marker updates range from null to null', () => {
			const root = doc.createRoot();
			root._appendChild( new Text( 'foo' ) );

			const changeDataSpy = sinon.spy();

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: true, affectsData: true } );
			} );

			model.change( writer => {
				writer.updateMarker( 'name', { range: null, usingOperation: true } );
			} );

			doc.on( 'change:data', changeDataSpy );

			model.change( writer => {
				writer.updateMarker( 'name', { range: null, usingOperation: true } );
			} );

			sinon.assert.notCalled( changeDataSpy );
		} );

		it( 'should be fired when the marker updates range from non-null range to null', () => {
			const root = doc.createRoot();
			root._appendChild( new Text( 'foo' ) );

			const changeDataSpy = sinon.spy();

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: true, affectsData: true } );
			} );

			doc.on( 'change:data', changeDataSpy );

			model.change( writer => {
				writer.updateMarker( 'name', { range: null, usingOperation: true } );
			} );

			sinon.assert.notCalled( changeDataSpy );
		} );

		it( 'should be fired when the marker updates range from null to a non-null range', () => {
			const root = doc.createRoot();
			root._appendChild( new Text( 'foo' ) );

			const changeDataSpy = sinon.spy();

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: true, affectsData: true } );
			} );

			model.change( writer => {
				writer.updateMarker( 'name', { range: null, usingOperation: true } );
			} );

			doc.on( 'change:data', changeDataSpy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );

				writer.updateMarker( 'name', { range, usingOperation: true } );
			} );

			sinon.assert.notCalled( changeDataSpy );
		} );
	} );

	it( 'should be correctly converted to json', () => {
		const serialized = doc.toJSON();

		expect( serialized.selection ).to.equal( '[engine.model.DocumentSelection]' );
		expect( serialized.model ).to.equal( '[engine.model.Model]' );
	} );
} );
