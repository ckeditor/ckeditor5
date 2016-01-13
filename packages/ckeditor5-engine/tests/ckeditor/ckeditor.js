/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import testUtils from '/tests/_utils/utils.js';
import coreTestUtils from '/tests/core/_utils/utils.js';

import CKEDITOR from '/ckeditor.js';
import Editor from '/ckeditor5/core/editor.js';
import Config from '/ckeditor5/core/config.js';

let content = document.getElementById( 'content' );
let editorConfig = { creator: 'creator-test' };

testUtils.createSinonSandbox();
coreTestUtils.defineEditorCreatorMock( 'test' );

beforeEach( () => {
	// Destroy all editor instances.
	while ( CKEDITOR.instances.length ) {
		CKEDITOR.instances.get( 0 ).destroy();
	}
} );

describe( 'create', () => {
	it( 'should return a promise', () => {
		expect( CKEDITOR.create( content, editorConfig ) ).to.be.instanceof( Promise );
	} );

	it( 'should create a new editor instance', () => {
		return CKEDITOR.create( content, editorConfig ).then( ( editor ) => {
			expect( editor ).to.be.instanceof( Editor );
			expect( editor.element ).to.equal( content );
		} );
	} );

	it( 'should create a new editor instance (using a selector)', () => {
		return CKEDITOR.create( '.editor', editorConfig ).then( ( editor ) => {
			expect( editor ).to.be.instanceof( Editor );
			expect( editor.element ).to.equal( document.querySelector( '.editor' ) );
		} );
	} );

	it( 'should set configurations on the new editor', () => {
		return CKEDITOR.create( content, { test: 1, creator: 'creator-test' } ).then( ( editor ) => {
			expect( editor.config.test ).to.equal( 1 );
		} );
	} );

	it( 'should add the editor to the `instances` collection', () => {
		return CKEDITOR.create( content, editorConfig ).then( ( editor ) => {
			expect( CKEDITOR.instances ).to.have.length( 1 );
			expect( CKEDITOR.instances.get( 0 ) ).to.equal( editor );
		} );
	} );

	it( 'should remove the editor from the `instances` collection on `destroy` event', () => {
		let editor1, editor2;

		// Create the first editor.
		return CKEDITOR.create( content, editorConfig ).then( ( editor ) => {
			editor1 = editor;

			// Create the second editor.
			return CKEDITOR.create( '.editor', editorConfig ).then( ( editor ) => {
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

	it( 'should be rejected on element not found', () => {
		let addSpy = testUtils.sinon.spy( CKEDITOR.instances, 'add' );

		return CKEDITOR.create( '.undefined' ).then( () => {
			throw new Error( 'It should not enter this function' );
		} ).catch( ( error ) => {
			expect( error ).to.be.instanceof( Error );
			expect( error.message ).to.equal( 'Element not found' );
			// We need to make sure that create()'s execution is stopped.
			// Assertion based on a real mistake we made that reject() wasn't followed by a return.
			sinon.assert.notCalled( addSpy );
		} );
	} );
} );

describe( 'config', () => {
	it( 'should be an instance of Config', () => {
		expect( CKEDITOR.config ).to.be.an.instanceof( Config );
	} );
} );
