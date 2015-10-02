/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

var modules = bender.amd.require( 'ckeditorerror' );

describe( 'CKEditorError', function() {
	it( 'inherits from Error', function() {
		var CKEditorError = modules.ckeditorerror;
		var error = new CKEditorError( 'foo' );

		expect( error ).to.be.an.instanceOf( Error );
		expect( error ).to.be.an.instanceOf( CKEditorError );
	} );

	it( 'sets the name', function() {
		var CKEditorError = modules.ckeditorerror;
		var error = new CKEditorError( 'foo' );

		expect( error ).to.have.property( 'name', 'CKEditorError' );
	} );

	it( 'sets the message', function() {
		var CKEditorError = modules.ckeditorerror;
		var error = new CKEditorError( 'foo' );

		expect( error ).to.have.property( 'message', 'foo' );
		expect( error.data ).to.be.undefined;
	} );

	it( 'sets the message and data', function() {
		var CKEditorError = modules.ckeditorerror;
		var data = { bar: 1 };
		var error = new CKEditorError( 'foo', data );

		expect( error ).to.have.property( 'message', 'foo' );
		expect( error ).to.have.property( 'data', data );
	} );
} );