/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require( 'document/document', 'document/rootelement', 'ckeditorerror' );

describe( 'Document', function() {
	var Document, RootElement, CKEditorError;

	before( function() {
		Document = modules[ 'document/document' ];
		RootElement = modules[ 'document/rootelement' ];
		CKEditorError = modules.ckeditorerror;
	} );

	var document;

	beforeEach( function() {
		document = new Document();
	} );

	describe( 'constructor', function() {
		it( 'should create Document with no data', function() {
			expect( document ).to.have.property( 'roots' ).that.is.instanceof( Map );
			expect( document.roots.size ).to.be.equal( 1 );
			expect( document._graveyard ).to.be.instanceof( RootElement );
			expect( document._graveyard.getChildCount() ).to.be.equal( 0 );
		} );
	} );

	describe( 'createRoot', function() {
		it( 'should create a new RootElement, add it to roots map and return it', function() {
			var root = document.createRoot( 'root' );

			expect( document.roots.size ).to.be.equal( 2 );
			expect( root ).to.be.instanceof( RootElement );
			expect( root.getChildCount() ).to.be.equal( 0 );
		} );

		it( 'should throw an error when trying to create a second root with the same name', function() {
			document.createRoot( 'root' );

			expect( function() {
				document.createRoot( 'root' );
			} ).to.throw( CKEditorError, /document-createRoot-name-exists/ );
		} );
	} );

	describe( 'getRoot', function() {
		it( 'should return a RootElement previously created with given name', function() {
			var newRoot = document.createRoot( 'root' );
			var getRoot = document.getRoot( 'root' );

			expect( getRoot ).to.be.equal( newRoot );
		} );

		it( 'should throw an error when trying to get non-existent root', function() {
			expect( function() {
				document.getRoot( 'root' );
			} ).to.throw( CKEditorError, /document-createRoot-root-not-exist/ );
		} );
	} );

	describe( 'applyOperation', function() {
		it( 'should increase document version, execute operation and fire operationApplied', function() {
			var operationApplied = sinon.spy();
			var operation = {
				baseVersion: 0,
				_execute: sinon.spy()
			};

			document.on( 'operationApplied', operationApplied );

			document.applyOperation( operation );

			expect( document.version ).to.be.equal( 1 );
			sinon.assert.calledOnce( operationApplied );
			sinon.assert.calledOnce( operation._execute );
		} );

		it( 'should throw an error on the operation base version and the document version is different', function() {
			var operationApplied = sinon.spy();
			var operation = {
				baseVersion: 1
			};

			document.on( 'operationApplied', operationApplied );

			expect( function() {
				document.applyOperation( operation );
			} ).to.throw( CKEditorError, /document-applyOperation-wrong-version/ );
		} );
	} );
} );
