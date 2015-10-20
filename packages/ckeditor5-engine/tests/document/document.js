/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require( 'document/document', 'document/element', 'ckeditorerror' );

describe( 'constructor', function() {
	it( 'should create Document with no data', function() {
		var Document = modules[ 'document/document' ];
		var Element = modules[ 'document/element' ];

		var document = new Document();

		expect( document ).to.have.property( 'root' ).that.is.instanceof( Element );
		expect( document.root ).to.have.property( 'name' ).that.equal( 'root' );
	} );
} );

describe( 'applyOperation', function() {
	it( 'should increase document version, execute operation and fire operationApplied', function() {
		var Document = modules[ 'document/document' ];

		var document = new Document();
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
		var Document = modules[ 'document/document' ];
		var CKEditorError = modules.ckeditorerror;

		var document = new Document();
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