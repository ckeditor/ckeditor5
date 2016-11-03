/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-tags: editor, browser-only */

import ClassicEditorUI from 'ckeditor5/editor-classic/classiceditorui.js';
import BoxedEditorUIView from 'ckeditor5/ui/editorui/boxed/boxededitoruiview.js';

import HtmlDataProcessor from 'ckeditor5/engine/dataprocessor/htmldataprocessor.js';

import ClassicEditor from 'ckeditor5/editor-classic/classic.js';
import Paragraph from 'ckeditor5/paragraph/paragraph.js';
import Bold from 'ckeditor5/basic-styles/bold.js';

import testUtils from 'tests/core/_utils/utils.js';
import count from 'ckeditor5/utils/count.js';

testUtils.createSinonSandbox();

describe( 'ClassicEditor', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'constructor()', () => {
		beforeEach( () => {
			editor = new ClassicEditor( editorElement );
		} );

		it( 'creates a single div editable root in the view', () => {
			expect( editor.editing.view.getRoot() ).to.have.property( 'name', 'div' );
		} );

		it( 'creates a single document root', () => {
			expect( count( editor.document.getRootNames() ) ).to.equal( 1 );
			expect( editor.document.getRoot() ).to.have.property( 'name', '$root' );
		} );

		it( 'creates the UI using BoxedEditorUI classes', () => {
			expect( editor.ui ).to.be.instanceof( ClassicEditorUI );
			expect( editor.ui.view ).to.be.instanceof( BoxedEditorUIView );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );
	} );

	describe( 'create', () => {
		beforeEach( function() {
			return ClassicEditor.create( editorElement, {
					features: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		it( 'creates an instance which inherits from the ClassicEditor', () => {
			expect( editor ).to.be.instanceof( ClassicEditor );
		} );

		it( 'inserts editor UI next to editor element', () => {
			expect( editor.ui.view.element.previousSibling ).to.equal( editorElement );
		} );

		it( 'attaches editable UI as view\'s DOM root', () => {
			expect( editor.editing.view.getDomRoot() ).to.equal( editor.ui.editable.view.element );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );
	} );

	describe( 'destroy', () => {
		beforeEach( function() {
			return ClassicEditor.create( editorElement, { features: [ Paragraph ] } )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		it( 'sets the data back to the editor element', () => {
			editor.setData( '<p>foo</p>' );

			return editor.destroy()
				.then( () => {
					expect( editorElement.innerHTML ).to.equal( '<p>foo</p>' );
				} );
		} );

		it( 'restores the editor element', () => {
			expect( editor.element.style.display ).to.equal( 'none' );

			return editor.destroy()
				.then( () => {
					expect( editor.element.style.display ).to.equal( '' );
				} );
		} );
	} );
} );
