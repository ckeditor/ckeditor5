/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-include: ../_tools/tools.js */

'use strict';

const modules = bender.amd.require( 'ckeditor', 'editor', 'config' );

let content = document.getElementById( 'content' );
let editorConfig = { plugins: 'creator-test' };

bender.tools.createSinonSandbox();
bender.tools.core.defineEditorCreatorMock( 'test' );

beforeEach( function() {
	const CKEDITOR = modules.ckeditor;

	// Destroy all editor instances.
	while ( CKEDITOR.instances.length ) {
		CKEDITOR.instances.get( 0 ).destroy();
	}
} );

describe( 'create', function() {
	it( 'should return a promise', function() {
		const CKEDITOR = modules.ckeditor;

		expect( CKEDITOR.create( content, editorConfig ) ).to.be.instanceof( Promise );
	} );

	it( 'should create a new editor instance', function() {
		const CKEDITOR = modules.ckeditor;
		const Editor = modules.editor;

		return CKEDITOR.create( content, editorConfig ).then( function( editor ) {
			expect( editor ).to.be.instanceof( Editor );
			expect( editor.element ).to.equal( content );
		} );
	} );

	it( 'should create a new editor instance (using a selector)', function() {
		const CKEDITOR = modules.ckeditor;
		const Editor = modules.editor;

		return CKEDITOR.create( '.editor', editorConfig ).then( function( editor ) {
			expect( editor ).to.be.instanceof( Editor );
			expect( editor.element ).to.equal( document.querySelector( '.editor' ) );
		} );
	} );

	it( 'should set configurations on the new editor', function() {
		const CKEDITOR = modules.ckeditor;

		return CKEDITOR.create( content, { test: 1, plugins: 'creator-test' } ).then( function( editor ) {
			expect( editor.config.test ).to.equal( 1 );
		} );
	} );

	it( 'should add the editor to the `instances` collection', function() {
		const CKEDITOR = modules.ckeditor;

		return CKEDITOR.create( content, editorConfig ).then( function( editor ) {
			expect( CKEDITOR.instances ).to.have.length( 1 );
			expect( CKEDITOR.instances.get( 0 ) ).to.equal( editor );
		} );
	} );

	it( 'should remove the editor from the `instances` collection on `destroy` event', function() {
		const CKEDITOR = modules.ckeditor;
		let editor1, editor2;

		// Create the first editor.
		return CKEDITOR.create( content, editorConfig ).then( function( editor ) {
			editor1 = editor;

			// Create the second editor.
			return CKEDITOR.create( '.editor', editorConfig ).then( function( editor ) {
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
		const CKEDITOR = modules.ckeditor;

		let addSpy = bender.sinon.spy( CKEDITOR.instances, 'add' );

		return CKEDITOR.create( '.undefined' ).then( function() {
			throw new Error( 'It should not enter this function' );
		} ).catch( function( error ) {
			expect( error ).to.be.instanceof( Error );
			expect( error.message ).to.equal( 'Element not found' );
			// We need to make sure that create()'s execution is stopped.
			// Assertion based on a real mistake we made that reject() wasn't followed by a return.
			sinon.assert.notCalled( addSpy );
		} );
	} );
} );

describe( 'config', function() {
	it( 'should be an instance of Config', function() {
		const CKEDITOR = modules.ckeditor;
		const Config = modules.config;

		expect( CKEDITOR.config ).to.be.an.instanceof( Config );
	} );
} );
