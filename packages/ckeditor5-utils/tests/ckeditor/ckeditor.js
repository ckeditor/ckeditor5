/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, beforeEach, document */

'use strict';

var modules = bender.amd.require( 'ckeditor', 'editor', 'promise' );

var content = document.getElementById( 'content' );

beforeEach( function() {
	var CKEDITOR = modules.ckeditor;

	// Destroy all editor instances.
	while ( CKEDITOR.instances.length ) {
		CKEDITOR.instances.get( 0 ).destroy();
	}
} );

describe( 'create', function() {
	it( 'should return a promise', function() {
		var CKEDITOR = modules.ckeditor;
		var Promise = modules.promise;

		expect( CKEDITOR.create( content ) ).to.be.instanceof( Promise );
	} );

	it( 'should create a new editor instance', function() {
		var CKEDITOR = modules.ckeditor;
		var Editor = modules.editor;

		return CKEDITOR.create( content ).then( function( editor ) {
			expect( editor ).to.be.instanceof( Editor );
			expect( editor.element ).to.equal( content );
		} );
	} );

	it( 'should create a new editor instance (using a selector)', function() {
		var CKEDITOR = modules.ckeditor;
		var Editor = modules.editor;

		return CKEDITOR.create( '.editor' ).then( function( editor ) {
			expect( editor ).to.be.instanceof( Editor );
			expect( editor.element ).to.equal( document.querySelector( '.editor' ) );
		} );
	} );

	it( 'should add the editor to the `instances` collection', function() {
		var CKEDITOR = modules.ckeditor;

		return CKEDITOR.create( content ).then( function( editor ) {
			expect( CKEDITOR.instances ).to.have.length( 1 );
			expect( CKEDITOR.instances.get( 0 ) ).to.equal( editor );
		} );
	} );

	it( 'should remove the editor from the `instances` collection on `destroy` event', function() {
		var CKEDITOR = modules.ckeditor;
		var editor1, editor2;

		// Create the first editor.
		return CKEDITOR.create( content ).then( function( editor ) {
			editor1 = editor;

			// Create the second editor.
			return CKEDITOR.create( content ).then( function( editor ) {
				editor2 = editor;

				// It should have 2 editors.
				expect( CKEDITOR.instances ).to.have.length( 2 );

				// Destroy one of them.
				editor1.destroy();

				// It should have 1 editor now.
				expect( CKEDITOR.instances ).to.have.length( 1 );

				// Ensure that the remaining is the right one.
				expect( CKEDITOR.instances.get( 0 ) ).to.equal( editor2 );
			} );
		} );
	} );

	it( 'should be rejected on element not found', function() {
		var CKEDITOR = modules.ckeditor;

		return CKEDITOR.create( '.undefined' ).then( function() {
			throw( 'It should not enter this function' );
		} ).catch( function( error ) {
			expect( error ).to.be.instanceof( Error );
			expect( error.message ).to.equal( 'Element not found' );
		} );
	} );
} );
