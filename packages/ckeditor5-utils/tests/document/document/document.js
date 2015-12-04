/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/document',
	'document/rootelement',
	'document/batch',
	'ckeditorerror'
);

describe( 'Document', () => {
	let Document, RootElement, Batch, CKEditorError;

	before( () => {
		Document = modules[ 'document/document' ];
		RootElement = modules[ 'document/rootelement' ];
		Batch = modules[ 'document/batch' ];
		CKEditorError = modules.ckeditorerror;
	} );

	let document;

	beforeEach( () => {
		document = new Document();
	} );

	describe( 'constructor', () => {
		it( 'should create Document with no data and empty graveyard', () => {
			expect( document ).to.have.property( 'roots' ).that.is.instanceof( Map );
			expect( document.roots.size ).to.equal( 1 );
			expect( document._graveyard ).to.be.instanceof( RootElement );
			expect( document._graveyard.getChildCount() ).to.equal( 0 );
		} );
	} );

	describe( 'createRoot', () => {
		it( 'should create a new RootElement, add it to roots map and return it', () => {
			let root = document.createRoot( 'root' );

			expect( document.roots.size ).to.equal( 2 );
			expect( root ).to.be.instanceof( RootElement );
			expect( root.getChildCount() ).to.equal( 0 );
		} );

		it( 'should throw an error when trying to create a second root with the same name', () => {
			document.createRoot( 'root' );

			expect(
				() => {
					document.createRoot( 'root' );
				}
			).to.throw( CKEditorError, /document-createRoot-name-exists/ );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return a RootElement previously created with given name', () => {
			let newRoot = document.createRoot( 'root' );
			let getRoot = document.getRoot( 'root' );

			expect( getRoot ).to.equal( newRoot );
		} );

		it( 'should throw an error when trying to get non-existent root', () => {
			expect(
				() => {
					document.getRoot( 'root' );
				}
			).to.throw( CKEditorError, /document-createRoot-root-not-exist/ );
		} );
	} );

	describe( 'applyOperation', () => {
		it( 'should increase document version, execute operation and fire event with proper data', () => {
			const changeCallback = sinon.spy();
			const type = 't';
			const data = { data: 'x' };

			let operation = {
				type: type,
				baseVersion: 0,
				_execute: sinon.stub().returns( data )
			};

			document.on( 'change', changeCallback );
			document.applyOperation( operation );

			expect( document.version ).to.equal( 1 );
			sinon.assert.calledOnce( operation._execute );

			sinon.assert.calledOnce( changeCallback );
			expect( changeCallback.args[ 0 ][ 1 ] ).to.equal( type );
			expect( changeCallback.args[ 0 ][ 2 ] ).to.equal( data );
		} );

		it( 'should throw an error on the operation base version and the document version is different', () => {
			let operation = {
				baseVersion: 1
			};

			expect(
				() => {
					document.applyOperation( operation );
				}
			).to.throw( CKEditorError, /document-applyOperation-wrong-version/ );
		} );
	} );

	describe( 'batch', () => {
		it( 'should create a new batch with the document property', () => {
			const batch = document.batch();

			expect( batch ).to.be.instanceof( Batch );
			expect( batch ).to.have.property( 'doc' ).that.equals( document );
		} );
	} );
} );
