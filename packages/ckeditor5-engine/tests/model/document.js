/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Model } from '../../src/model/model.js';
import { ModelDocument } from '../../src/model/document.js';
import { ModelRootElement } from '../../src/model/rootelement.js';
import { ModelText } from '../../src/model/text.js';
import { Batch } from '../../src/model/batch.js';
import { Collection, count } from '@ckeditor/ckeditor5-utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'Document', () => {
	let model, doc;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
	} );

	describe( 'constructor()', () => {
		it( 'should create Document with no data, empty graveyard and selection set to default range', () => {
			const doc = new ModelDocument( model );

			expect( doc ).toHaveProperty( 'model', model );
			expect( doc ).toHaveProperty( 'roots' );
			expect( doc.roots ).toBeInstanceOf( Collection );
			expect( doc.roots.length ).toBe( 1 );
			expect( doc.graveyard ).toBeInstanceOf( ModelRootElement );
			expect( doc.graveyard.maxOffset ).toBe( 0 );
			expect( count( doc.selection.getRanges() ) ).toBe( 1 );
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
				_execute: vi.fn().mockReturnValue( data ),
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

			expect( doc.version ).toBe( 1 );
			expect( doc.history.getOperations().length ).toBe( 1 );
			expect( operation._execute ).toHaveBeenCalledOnce();
		} );

		it( 'for non-document operation: should only execute operation', () => {
			operation.isDocumentOperation = false;

			model.applyOperation( operation );

			expect( doc.version ).toBe( 0 );
			expect( doc.history.getOperations().length ).toBe( 0 );
			expect( operation._execute ).toHaveBeenCalledOnce();
		} );

		it( 'should do nothing if operation event was cancelled', () => {
			model.on( 'applyOperation', evt => evt.stop(), { priority: 'highest' } );

			model.applyOperation( operation );

			expect( doc.version ).toBe( 0 );
			expect( operation._execute.mock.calls.length ).toBe( 0 );
		} );

		it( 'should throw an error on the operation base version and the document version is different', () => {
			const operation = {
				type: 't',
				baseVersion: 1,
				isDocumentOperation: true,
				_execute: vi.fn().mockReturnValue( data ),
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

			expect( model.document.version ).toBe( 20 );
		} );

		it( 'should set document.history.version', () => {
			model.document.version = 20;

			expect( model.document.history.version ).toBe( 20 );
		} );
	} );

	describe( 'getRootNames()', () => {
		it( 'should return empty array if no roots exist', () => {
			expect( count( doc.getRootNames() ) ).toBe( 0 );
		} );

		it( 'should return array with all roots without the graveyard', () => {
			doc.createRoot( '$root', 'a' );
			doc.createRoot( '$root', 'b' );

			expect( doc.getRootNames() ).toEqual( [ 'a', 'b' ] );
		} );

		it( 'should return only attached roots', () => {
			doc.createRoot( '$root', 'a' );
			const rootB = doc.createRoot( '$root', 'b' );

			rootB._isAttached = false;

			expect( doc.getRootNames() ).toEqual( [ 'a' ] );
		} );

		it( 'should return detached roots when `includeDetached` flag is set to `true`', () => {
			doc.createRoot( '$root', 'a' );
			const rootB = doc.createRoot( '$root', 'b' );

			rootB._isAttached = false;

			expect( doc.getRootNames( true ) ).toEqual( [ 'a', 'b' ] );
		} );

		it( 'should not return non-loaded roots', () => {
			doc.createRoot( '$root', 'a' );
			const rootB = doc.createRoot( '$root', 'b' );

			rootB._isLoaded = false;

			expect( doc.getRootNames() ).toEqual( [ 'a' ] );
			expect( doc.getRootNames( true ) ).toEqual( [ 'a' ] );
		} );
	} );

	describe( 'getRoots()', () => {
		it( 'should return empty iterator if no roots exist', () => {
			expect( count( doc.getRoots() ) ).toBe( 0 );
		} );

		it( 'should return an iterator of all roots without the graveyard', () => {
			const rootA = doc.createRoot( '$root', 'a' );
			const rootB = doc.createRoot( '$root', 'b' );

			expect( doc.getRoots() ).toEqual( [ rootA, rootB ] );
		} );

		it( 'should return only attached roots', () => {
			const rootA = doc.createRoot( '$root', 'a' );
			const rootB = doc.createRoot( '$root', 'b' );

			rootB._isAttached = false;

			expect( doc.getRoots() ).toEqual( [ rootA ] );
		} );

		it( 'should return detached roots when `includeDetached` flag is set to `true`', () => {
			const rootA = doc.createRoot( '$root', 'a' );
			const rootB = doc.createRoot( '$root', 'b' );

			rootB._isAttached = false;

			expect( doc.getRoots( true ) ).toEqual( [ rootA, rootB ] );
		} );

		it( 'should not return non-loaded roots', () => {
			const rootA = doc.createRoot( '$root', 'a' );
			const rootB = doc.createRoot( '$root', 'b' );

			rootA._isLoaded = false;

			expect( doc.getRoots() ).toEqual( [ rootB ] );
			expect( doc.getRoots( true ) ).toEqual( [ rootB ] );
		} );
	} );

	describe( 'createRoot()', () => {
		it(
			'should create a new ModelRootElement, attached, with default element and root names' +
			', add it to roots map and return it', () => {
				const root = doc.createRoot();

				expect( root.isAttached() ).toBe( true );
				expect( doc.roots.length ).toBe( 2 );
				expect( root ).toBeInstanceOf( ModelRootElement );
				expect( root.maxOffset ).toBe( 0 );
				expect( root ).toHaveProperty( 'name', '$root' );
				expect( root ).toHaveProperty( 'rootName', 'main' );
			} );

		it( 'should create a new ModelRootElement, attached, with custom element and root names, add it to roots map and return it', () => {
			const root = doc.createRoot( 'customElementName', 'customRootName' );

			expect( root.isAttached() ).toBe( true );
			expect( doc.roots.length ).toBe( 2 );
			expect( root ).toBeInstanceOf( ModelRootElement );
			expect( root.maxOffset ).toBe( 0 );
			expect( root ).toHaveProperty( 'name', 'customElementName' );
			expect( root ).toHaveProperty( 'rootName', 'customRootName' );
		} );

		it( 'should throw an error when trying to create a second root with the same name', () => {
			doc.createRoot( '$root', 'rootName' );

			expectToThrowCKEditorError( () => {
				doc.createRoot( '$root', 'rootName' );
			}, 'model-document-createroot-name-exists', model );
		} );
	} );

	describe( 'getRoot()', () => {
		it( 'should return a ModelRootElement with default "main" name', () => {
			const newRoot = doc.createRoot( 'main' );

			expect( doc.getRoot() ).toBe( newRoot );
		} );

		it( 'should return a ModelRootElement with custom name', () => {
			const newRoot = doc.createRoot( 'custom', 'custom' );

			expect( doc.getRoot( 'custom' ) ).toBe( newRoot );
		} );

		it( 'should return null when trying to get non-existent root', () => {
			expect( doc.getRoot( 'not-existing' ) ).toBeNull();
		} );

		it( 'should return a detached root', () => {
			const root = doc.createRoot( '$root', 'a' );

			root._isAttached = false;

			expect( doc.getRoot( 'a' ) ).toBe( root );
		} );
	} );

	describe( '_getDefaultRoot()', () => {
		it( 'should return graveyard root if there are no other roots in the document', () => {
			expect( doc._getDefaultRoot() ).toBe( doc.graveyard );
		} );

		it( 'should return the first root added to the document', () => {
			const rootA = doc.createRoot( '$root', 'rootA' );
			doc.createRoot( '$root', 'rootB' );
			doc.createRoot( '$root', 'rootC' );

			expect( doc._getDefaultRoot() ).toBe( rootA );
		} );
	} );

	it( 'should automatically remove elements or markers when added to a detached root', () => {
		let root, p;

		model.change( writer => {
			root = writer.addRoot( 'new' );
			writer.detachRoot( 'new' );
		} );

		model.change( writer => {
			p = writer.createElement( 'paragraph' );
			writer.insert( p, root, 0 );
		} );

		expect( root.isEmpty ).toBe( true );
		expect( p.parent.rootName ).toBe( '$graveyard' );

		model.change( writer => {
			writer.addMarker( 'newMarker', {
				usingOperation: true,
				affectsData: true,
				range: writer.createRangeIn( root )
			} );
		} );

		expect( model.markers.get( 'newMarker' ) ).toBeNull();
	} );

	describe( 'destroy()', () => {
		it( 'should destroy selection instance', () => {
			const spy = vi.spyOn( doc.selection, 'destroy' );

			doc.destroy();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should stop listening to events', () => {
			const spy = vi.fn();

			doc.listenTo( model, 'something', spy );

			model.fire( 'something' );

			expect( spy ).toHaveBeenCalledOnce();

			doc.destroy();

			model.fire( 'something' );

			// Still once.
			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'differ', () => {
		beforeEach( () => {
			doc.createRoot();
		} );

		it( 'should buffer document operations in differ', () => {
			vi.spyOn( doc.differ, 'bufferOperation' );

			model.change( writer => {
				writer.insertText( 'foo', doc.getRoot(), 0 );
			} );

			expect( doc.differ.bufferOperation ).toHaveBeenCalled();
		} );

		it( 'should not buffer changes not done on document', () => {
			vi.spyOn( doc.differ, 'bufferOperation' );

			model.change( writer => {
				const docFrag = writer.createDocumentFragment();
				writer.insertText( 'foo', docFrag, 0 );
			} );

			expect( doc.differ.bufferOperation ).not.toHaveBeenCalled();
		} );

		it( 'should buffer marker changes in differ', () => {
			vi.spyOn( doc.differ, 'bufferMarkerChange' );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( doc.getRoot(), 0 ) );
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			expect( doc.differ.bufferMarkerChange ).toHaveBeenCalled();
		} );

		it( 'should reset differ after change block is done', () => {
			model.change( writer => {
				writer.insertText( 'foo', doc.getRoot(), 0 );

				expect( doc.differ.getChanges().length > 0 ).toBe( true );
			} );

			expect( doc.differ.getChanges().length ).toBe( 0 );
		} );
	} );

	describe( 'registerPostFixer()', () => {
		beforeEach( () => {
			doc.createRoot();
		} );

		it( 'should add a callback that is fired after changes are done', () => {
			const spy = vi.fn();

			doc.registerPostFixer( spy );

			model.change( writer => {
				writer.insertText( 'foo', doc.getRoot(), 0 );
			} );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not fire callbacks if no changes on document were done', () => {
			const spy = vi.fn();

			doc.registerPostFixer( spy );

			model.change( writer => {
				const docFrag = writer.createDocumentFragment();

				writer.insertText( 'foo', docFrag, 0 );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should call all already processed callbacks again if a callback returned true', () => {
			const callA = vi.fn();

			const callB = vi.fn()
				.mockReturnValueOnce( true )
				.mockReturnValueOnce( false );
			const callC = vi.fn();

			doc.registerPostFixer( callA );
			doc.registerPostFixer( callB );
			doc.registerPostFixer( callC );

			model.change( writer => {
				writer.insertText( 'foo', doc.getRoot(), 0 );
			} );

			expect( callA ).toHaveBeenCalledTimes( 2 );
			expect( callB ).toHaveBeenCalledTimes( 2 );
			expect( callC ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'event change', () => {
		it( 'should be fired if there was a change in a document tree in a change block and have a batch as a param', () => {
			doc.createRoot();
			const spy = vi.fn();

			doc.on( 'change', ( evt, batch ) => {
				spy();
				expect( batch ).toBeInstanceOf( Batch );
			} );

			model.change( writer => {
				writer.insertText( 'foo', doc.getRoot(), 0 );
			} );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should be fired if there was a selection change in an (enqueue)change block', () => {
			const root = doc.createRoot();
			const spy = vi.fn();

			root._appendChild( new ModelText( 'foo' ) );

			doc.on( 'change', spy );

			model.change( writer => {
				writer.setSelection( root, 2 );
			} );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not be fired if writer was used on non-document tree', () => {
			const spy = vi.fn();

			doc.on( 'change', ( evt, batch ) => {
				spy();
				expect( batch ).toBeInstanceOf( Batch );
			} );

			model.change( writer => {
				const docFrag = writer.createDocumentFragment();
				writer.insertText( 'foo', docFrag, 0 );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'event change:data', () => {
		it( 'should be fired if there was a change in a document tree in a change block and have a batch as a param', () => {
			doc.createRoot();
			const spy = vi.fn();

			doc.on( 'change:data', ( evt, batch ) => {
				spy();
				expect( batch ).toBeInstanceOf( Batch );
			} );

			model.change( writer => {
				writer.insertText( 'foo', doc.getRoot(), 0 );
			} );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not be fired if only selection changes', () => {
			const root = doc.createRoot();
			const spy = vi.fn();

			root._appendChild( new ModelText( 'foo' ) );

			doc.on( 'change:data', spy );

			model.change( writer => {
				writer.setSelection( root, 2 );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should be fired if default marker operation is applied', () => {
			const root = doc.createRoot();
			const spy = vi.fn();

			root._appendChild( new ModelText( 'foo' ) );

			doc.on( 'change:data', spy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: true, affectsData: true } );
			} );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not be fired if the marker operation is applied and marker does not affect data', () => {
			const root = doc.createRoot();
			const spy = vi.fn();

			root._appendChild( new ModelText( 'foo' ) );

			doc.on( 'change:data', spy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: true } );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should be fired if the writer adds marker not managed by using operations', () => {
			const root = doc.createRoot();
			const spy = vi.fn();

			root._appendChild( new ModelText( 'foo' ) );

			doc.on( 'change:data', spy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: false, affectsData: true } );
			} );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not be fired if the writer adds marker not managed by using operations with affectsData set to false', () => {
			const root = doc.createRoot();
			const spy = vi.fn();

			root._appendChild( new ModelText( 'foo' ) );

			doc.on( 'change:data', spy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: false } );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should not be fired if writer was used on non-document tree', () => {
			const spy = vi.fn();

			doc.on( 'change:data', ( evt, batch ) => {
				spy();
				expect( batch ).toBeInstanceOf( Batch );
			} );

			model.change( writer => {
				const docFrag = writer.createDocumentFragment();
				writer.insertText( 'foo', docFrag, 0 );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should be fired when marker changes affecting data', () => {
			const root = doc.createRoot();
			root._appendChild( new ModelText( 'foo' ) );

			const changeDataSpy = vi.fn();
			const changeSpy = vi.fn();

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

			expect( changeSpy ).toHaveBeenCalledOnce();
			expect( changeDataSpy ).toHaveBeenCalledOnce();

			changeSpy.mockClear();
			changeDataSpy.mockClear();

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.updateMarker( 'name', { affectsData: false, range } );
			} );

			expect( changeSpy ).toHaveBeenCalledOnce();
			expect( changeDataSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not be fired when marker does not affect data', () => {
			const root = doc.createRoot();
			root._appendChild( new ModelText( 'foo' ) );

			const changeDataSpy = vi.fn();
			const changeSpy = vi.fn();

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

			expect( changeSpy ).toHaveBeenCalledOnce();
			expect( changeDataSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not be fired when the marker range does not change', () => {
			const root = doc.createRoot();
			root._appendChild( new ModelText( 'foo' ) );

			const changeDataSpy = vi.fn();

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: true, affectsData: true } );
			} );

			doc.on( 'change:data', changeDataSpy );

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.updateMarker( 'name', { range } );
			} );

			expect( changeDataSpy ).not.toHaveBeenCalled();
		} );

		// There are no strong preferences here.
		// This case is a bit artificial so perhaps it's better to stay on the safe side and fire the change:data event
		// even when the marker is empty. But if there is a problem with it, this behavior can be easily changed.
		it( 'should be fired when the marker updates range from null to null', () => {
			const root = doc.createRoot();
			root._appendChild( new ModelText( 'foo' ) );

			const changeDataSpy = vi.fn();

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

			expect( changeDataSpy ).not.toHaveBeenCalled();
		} );

		it( 'should be fired when the marker updates range from non-null range to null', () => {
			const root = doc.createRoot();
			root._appendChild( new ModelText( 'foo' ) );

			const changeDataSpy = vi.fn();

			model.change( writer => {
				const range = writer.createRange( writer.createPositionAt( root, 2 ), writer.createPositionAt( root, 4 ) );
				writer.addMarker( 'name', { range, usingOperation: true, affectsData: true } );
			} );

			doc.on( 'change:data', changeDataSpy );

			model.change( writer => {
				writer.updateMarker( 'name', { range: null, usingOperation: true } );
			} );

			expect( changeDataSpy ).not.toHaveBeenCalled();
		} );

		it( 'should be fired when the marker updates range from null to a non-null range', () => {
			const root = doc.createRoot();
			root._appendChild( new ModelText( 'foo' ) );

			const changeDataSpy = vi.fn();

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

			expect( changeDataSpy ).not.toHaveBeenCalled();
		} );
	} );

	it( 'should be correctly converted to json', () => {
		const serialized = doc.toJSON();

		expect( serialized.selection ).toBe( '[engine.model.DocumentSelection]' );
		expect( serialized.model ).toBe( '[engine.model.Model]' );
	} );
} );
