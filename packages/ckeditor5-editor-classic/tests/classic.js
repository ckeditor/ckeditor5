/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: editor, browser-only */

'use strict';

import BoxedEditorUI from '/ckeditor5/ui/editorui/boxed/boxededitorui.js';
import BoxedEditorUIView from '/ckeditor5/ui/editorui/boxed/boxededitoruiview.js';

// import EditableUI from '/ckeditor5/ui/editableui/editableui.js';
// import InlineEditableUIView from '/ckeditor5/ui/editableui/inline/inlineeditableuiview.js';

// import StickyToolbarView from '/ckeditor5/ui/stickytoolbar/stickytoolbarview.js';

import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';

import ClassicEditor from '/ckeditor5/creator-classic/classic.js';

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import count from '/ckeditor5/utils/count.js';

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

	describe( 'create', () => {
		beforeEach( function() {
			return ClassicEditor.create( editorElement, {
					features: [ 'paragraph', 'basic-styles/bold', 'basic-styles/italic' ],
					toolbar: [ 'bold', 'italic' ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		it( 'create an instance which inherits from the ClassicEditor', () => {
			expect( editor ).to.be.instanceof( ClassicEditor );
		} );

		it( 'creates a single div editable root in the view', () => {
			expect( editor.editing.view.domRoots.size ).to.equal( 1 );
			expect( editor.editing.view.getRoot() ).to.have.property( 'name', 'div' );
		} );

		it( 'creates a single document root', () => {
			expect( count( editor.document.rootNames ) ).to.equal( 1 );
			expect( editor.document.getRoot() ).to.have.property( 'name', '$root' );
		} );

		it( 'creates the UI using BoxedEditorUI classes', () => {
			expect( editor.ui ).to.be.instanceof( BoxedEditorUI );
			expect( editor.ui.view ).to.be.instanceof( BoxedEditorUIView );
		} );

		it( 'inserts editor UI next to editor element', () => {
			expect( editor.ui.view.element.previousSibling ).to.equal( editorElement );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );
	} );

	describe( 'destroy', () => {
		beforeEach( function() {
			return ClassicEditor.create( editorElement, { features: [ 'paragraph' ] } )
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
	} );
} );
