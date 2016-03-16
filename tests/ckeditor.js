/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';

import CKEDITOR from '/ckeditor.js';
import Editor from '/ckeditor5/editor.js';
import Config from '/ckeditor5/utils/config.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

const content = document.getElementById( 'content' );
const editorConfig = { creator: 'creator-test' };

testUtils.createSinonSandbox();
testUtils.defineEditorCreatorMock( 'test' );

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

	describe( 'elements param', () => {
		const container = document.createElement( 'div' );
		let el1, el2;

		document.body.appendChild( container );

		beforeEach( () => {
			container.innerHTML = '';

			el1 = document.createElement( 'div' );
			el2 = document.createElement( 'div' );

			container.appendChild( el1 );
			container.appendChild( el2 );
		} );

		it( 'should work with a string', () => {
			return CKEDITOR.create( 'div', editorConfig ).then( ( editor ) => {
				assertElements( editor, document.querySelectorAll( 'div' ).length );
			} );
		} );

		it( 'should work with an HTMLElement', () => {
			return CKEDITOR.create( el1, editorConfig ).then( ( editor ) => {
				assertElements( editor, 1 );
			} );
		} );

		it( 'should work with a NodeList', () => {
			const elements = container.querySelectorAll( 'div' );

			return CKEDITOR.create( elements, editorConfig ).then( ( editor ) => {
				assertElements( editor, 2 );
			} );
		} );

		it( 'should work with an HTMLCollection', () => {
			const elements = container.getElementsByTagName( 'div' );

			return CKEDITOR.create( elements, editorConfig ).then( ( editor ) => {
				assertElements( editor, 2 );
			} );
		} );

		it( 'should work with an array', () => {
			const elements = Array.from( container.getElementsByTagName( 'div' ) );

			return CKEDITOR.create( elements, editorConfig ).then( ( editor ) => {
				assertElements( editor, 2 );
			} );
		} );

		it( 'should work with an object', () => {
			const elements = {
				editableA: el1,
				editableB: el2
			};

			return CKEDITOR.create( elements, editorConfig ).then( ( editor ) => {
				assertElements( editor, 2 );
			} );
		} );

		it( 'should be rejected on element not found (when string passed)', () => {
			let addSpy = testUtils.sinon.spy( CKEDITOR.instances, 'add' );

			return CKEDITOR.create( '.undefined' )
				.then( () => {
					throw new Error( 'It should not enter this function.' );
				} )
				.catch( ( error ) => {
					expect( error ).to.be.instanceof( CKEditorError );
					expect( error.message ).to.match( /^ckeditor5-create-no-elements:/ );

					// We need to make sure that create()'s execution is stopped.
					// Assertion based on a real mistake we made that reject() wasn't followed by a return.
					sinon.assert.notCalled( addSpy );
				} );
		} );

		it( 'should be rejected on an empty elements array-like obj', () => {
			return CKEDITOR.create( [] )
				.then( () => {
					throw new Error( 'It should not enter this function.' );
				} )
				.catch( ( error ) => {
					expect( error ).to.be.instanceof( CKEditorError );
					expect( error.message ).to.match( /^ckeditor5-create-no-elements:/ );
				} );
		} );

		it( 'should be rejected on an empty object', () => {
			return CKEDITOR.create( {} )
				.then( () => {
					throw new Error( 'It should not enter this function.' );
				} )
				.catch( ( error ) => {
					expect( error ).to.be.instanceof( CKEditorError );
					expect( error.message ).to.match( /^ckeditor5-create-no-elements:/ );
				} );
		} );

		it( 'should take names from the ids or data-editable attributes', () => {
			el1.id = 'foo';
			el2.dataset.editable = 'bar';

			return CKEDITOR.create( [ el1, el2 ], editorConfig )
				.then( ( editor ) => {
					expect( editor.elements.get( 'foo' ) ).to.equal( el1 );
					expect( editor.elements.get( 'bar' ) ).to.equal( el2 );
				} );
		} );

		it( 'should take names from the object keys', () => {
			el1.id = 'foo';
			el2.dataset.editable = 'bar';

			return CKEDITOR.create( { a: el1, b: el2 }, editorConfig )
				.then( ( editor ) => {
					expect( editor.elements.get( 'a' ) ).to.equal( el1 );
					expect( editor.elements.get( 'b' ) ).to.equal( el2 );
				} );
		} );

		it( 'should generate editableN names', () => {
			return CKEDITOR.create( [ el1, el2 ], editorConfig )
				.then( ( editor ) => {
					expect( Array.from( editor.elements.keys() ).join( ',' ) ).to.match( /^editable\d+,editable\d+$/ );
				} );
		} );

		function assertElements( editor, expectedSize ) {
			expect( editor.elements ).to.be.instanceOf( Map );
			expect( editor.elements ).to.have.property( 'size', expectedSize );
		}
	} );
} );

describe( 'config', () => {
	it( 'should be an instance of Config', () => {
		expect( CKEDITOR.config ).to.be.an.instanceof( Config );
	} );
} );
