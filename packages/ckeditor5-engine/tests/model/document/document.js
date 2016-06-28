/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

'use strict';

import Document from '/ckeditor5/engine/model/document.js';
import Schema from '/ckeditor5/engine/model/schema.js';
import Composer from '/ckeditor5/engine/model/composer/composer.js';
import RootElement from '/ckeditor5/engine/model/rootelement.js';
import Batch from '/ckeditor5/engine/model/batch.js';
import Delta from '/ckeditor5/engine/model/delta/delta.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import count from '/ckeditor5/utils/count.js';
import { jsonParseStringify } from '/tests/engine/model/_utils/utils.js';

describe( 'Document', () => {
	let doc;

	beforeEach( () => {
		doc = new Document();
	} );

	describe( 'constructor', () => {
		it( 'should create Document with no data, empty graveyard and selection set to default range', () => {
			expect( doc ).to.have.property( '_roots' ).that.is.instanceof( Map );
			expect( doc._roots.size ).to.equal( 1 );
			expect( doc.graveyard ).to.be.instanceof( RootElement );
			expect( doc.graveyard.getChildCount() ).to.equal( 0 );
			expect( count( doc.selection.getRanges() ) ).to.equal( 1 );

			expect( doc.composer ).to.be.instanceof( Composer );
			expect( doc.schema ).to.be.instanceof( Schema );
		} );
	} );

	describe( 'rootNames', () => {
		it( 'should return empty iterator if no roots exist', () => {
			expect( count( doc.rootNames ) ).to.equal( 0 );
		} );

		it( 'should return an iterator of all roots without the graveyard', () => {
			doc.createRoot( '$root', 'a' );
			doc.createRoot( '$root', 'b' );

			expect( Array.from( doc.rootNames ) ).to.deep.equal( [ 'a', 'b' ] );
		} );
	} );

	describe( 'createRoot', () => {
		it( 'should create a new RootElement with default element and root names, add it to roots map and return it', () => {
			let root = doc.createRoot();

			expect( doc._roots.size ).to.equal( 2 );
			expect( root ).to.be.instanceof( RootElement );
			expect( root.getChildCount() ).to.equal( 0 );
			expect( root ).to.have.property( 'name', '$root' );
			expect( root ).to.have.property( 'rootName', 'main' );
		} );

		it( 'should create a new RootElement with custom element and root names, add it to roots map and return it', () => {
			let root = doc.createRoot( 'customElementName', 'customRootName' );

			expect( doc._roots.size ).to.equal( 2 );
			expect( root ).to.be.instanceof( RootElement );
			expect( root.getChildCount() ).to.equal( 0 );
			expect( root ).to.have.property( 'name', 'customElementName' );
			expect( root ).to.have.property( 'rootName', 'customRootName' );
		} );

		it( 'should throw an error when trying to create a second root with the same name', () => {
			doc.createRoot( '$root', 'rootName' );

			expect(
				() => {
					doc.createRoot( '$root', 'rootName' );
				}
			).to.throw( CKEditorError, /document-createRoot-name-exists/ );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return a RootElement previously created with given name', () => {
			let newRoot = doc.createRoot();
			let getRoot = doc.getRoot();

			expect( getRoot ).to.equal( newRoot );
		} );

		it( 'should throw an error when trying to get non-existent root', () => {
			expect(
				() => {
					doc.getRoot( 'root' );
				}
			).to.throw( CKEditorError, /document-getRoot-root-not-exist/ );
		} );
	} );

	describe( 'hasRoot', () => {
		it( 'should return true when Document has RootElement with given name', () => {
			doc.createRoot();

			expect( doc.hasRoot( 'main' ) ).to.be.true;
		} );

		it( 'should return false when Document does not have RootElement with given name', () => {
			expect( doc.hasRoot( 'noroot' ) ).to.be.false;
		} );
	} );

	describe( 'applyOperation', () => {
		it( 'should increase document version, execute operation and fire event with proper data', () => {
			const changeCallback = sinon.spy();
			const type = 't';
			const data = { data: 'x' };
			const batch = new Batch();
			const delta = new Delta();

			let operation = {
				type: type,
				baseVersion: 0,
				_execute: sinon.stub().returns( data )
			};

			delta.addOperation( operation );
			batch.addDelta( delta );

			doc.on( 'change', changeCallback );
			doc.applyOperation( operation );

			expect( doc.version ).to.equal( 1 );
			sinon.assert.calledOnce( operation._execute );

			sinon.assert.calledOnce( changeCallback );
			expect( changeCallback.args[ 0 ][ 1 ] ).to.equal( type );
			expect( changeCallback.args[ 0 ][ 2 ] ).to.equal( data );
			expect( changeCallback.args[ 0 ][ 3 ] ).to.equal( batch );
		} );

		it( 'should throw an error on the operation base version and the document version is different', () => {
			let operation = {
				baseVersion: 1
			};

			expect(
				() => {
					doc.applyOperation( operation );
				}
			).to.throw( CKEditorError, /document-applyOperation-wrong-version/ );
		} );
	} );

	describe( 'batch', () => {
		it( 'should create a new batch with the document property', () => {
			const batch = doc.batch();

			expect( batch ).to.be.instanceof( Batch );
			expect( batch ).to.have.property( 'doc' ).that.equals( doc );
		} );

		it( 'should set given batch type', () => {
			const batch = doc.batch( 'ignore' );

			expect( batch ).to.have.property( 'type' ).that.equals( 'ignore' );
		} );
	} );

	describe( 'enqueue', () => {
		it( 'should be executed immediately and fire changesDone event', () => {
			let order = [];

			doc.on( 'changesDone', () => order.push( 'done' ) );

			doc.enqueueChanges( () => order.push( 'enqueue1' ) );

			expect( order ).to.have.length( 2 );
			expect( order[ 0 ] ).to.equal( 'enqueue1' );
			expect( order[ 1 ] ).to.equal( 'done' );
		} );

		it( 'should fire done every time queue is empty', () => {
			let order = [];

			doc.on( 'changesDone', () => order.push( 'done' ) );

			doc.enqueueChanges( () => order.push( 'enqueue1' ) );
			doc.enqueueChanges( () => order.push( 'enqueue2' ) );

			expect( order ).to.have.length( 4 );
			expect( order[ 0 ] ).to.equal( 'enqueue1' );
			expect( order[ 1 ] ).to.equal( 'done' );
			expect( order[ 2 ] ).to.equal( 'enqueue2' );
			expect( order[ 3 ] ).to.equal( 'done' );
		} );

		it( 'should put callbacks in the proper order', () => {
			let order = [];

			doc.on( 'changesDone', () => order.push( 'done' ) );

			doc.enqueueChanges( () => {
				order.push( 'enqueue1 start' );
				doc.enqueueChanges( () => {
					order.push( 'enqueue2 start' );
					doc.enqueueChanges( () => order.push( 'enqueue4' ) );
					order.push( 'enqueue2 end' );
				} );

				doc.enqueueChanges( () => order.push( 'enqueue3' ) );

				order.push( 'enqueue1 end' );
			} );

			expect( order ).to.have.length( 7 );
			expect( order[ 0 ] ).to.equal( 'enqueue1 start' );
			expect( order[ 1 ] ).to.equal( 'enqueue1 end' );
			expect( order[ 2 ] ).to.equal( 'enqueue2 start' );
			expect( order[ 3 ] ).to.equal( 'enqueue2 end' );
			expect( order[ 4 ] ).to.equal( 'enqueue3' );
			expect( order[ 5 ] ).to.equal( 'enqueue4' );
			expect( order[ 6 ] ).to.equal( 'done' );
		} );
	} );

	it( 'should update selection attributes whenever selection gets updated', () => {
		sinon.spy( doc.selection, '_updateAttributes' );

		doc.selection.fire( 'change:range' );

		expect( doc.selection._updateAttributes.called ).to.be.true;
	} );

	it( 'should update selection attributes whenever changes to the document are applied', () => {
		sinon.spy( doc.selection, '_updateAttributes' );

		doc.fire( 'changesDone' );

		expect( doc.selection._updateAttributes.called ).to.be.true;
	} );

	describe( '_getDefaultRoot', () => {
		it( 'should return graveyard root if there are no other roots in the document', () => {
			expect( doc._getDefaultRoot() ).to.equal( doc.graveyard );
		} );

		it( 'should return the first root added to the document', () => {
			let rootA = doc.createRoot( '$root', 'rootA' );
			doc.createRoot( '$root', 'rootB' );
			doc.createRoot( '$root', 'rootC' );

			expect( doc._getDefaultRoot() ).to.equal( rootA );
		} );
	} );

	it( 'should be correctly converted to json', () => {
		expect( jsonParseStringify( doc ).selection ).to.equal( '[engine.model.LiveSelection]' );
	} );
} );
