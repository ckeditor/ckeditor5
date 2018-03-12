/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import DecoupledDocumentEditor from '../src/ckeditor';
import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';

describe( 'DecoupledDocumentEditor build', () => {
	let editor, editorData;

	beforeEach( () => {
		editorData = '<p><strong>foo</strong> bar</p>';
	} );

	afterEach( () => {
		editor = null;
	} );

	describe( 'buid', () => {
		it( 'contains plugins', () => {
			expect( DecoupledDocumentEditor.build.plugins ).to.not.be.empty;
		} );

		it( 'contains config', () => {
			expect( DecoupledDocumentEditor.build.config.toolbar ).to.not.be.empty;
		} );
	} );

	describe( 'create()', () => {
		beforeEach( () => {
			return DecoupledDocumentEditor.create( editorData )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'creates an instance which inherits from the DecoupledDocumentEditor', () => {
			expect( editor ).to.be.instanceof( DecoupledDocumentEditor );
			expect( editor ).to.be.instanceof( DecoupledEditor );
		} );

		it( 'loads passed data', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );

		it( 'does not define the UI DOM structure', () => {
			expect( editor.ui.view.element ).to.be.null;
			expect( editor.ui.view.toolbar.element.parentElement ).to.be.null;
			expect( editor.ui.view.editable.element.parentElement ).to.be.null;
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( () => {
			return DecoupledDocumentEditor.create( editorData )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );
	} );

	describe( 'plugins', () => {
		beforeEach( () => {
			return DecoupledDocumentEditor.create( editorData )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'paragraph works', () => {
			const data = '<p>Some text inside a paragraph.</p>';

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'basic-styles work', () => {
			const data = [
				'<p>',
				'<strong>Test:strong</strong>',
				'<i>Test:i</i>',
				'</p>'
			].join( '' );

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'block-quote works', () => {
			const data = '<blockquote><p>Quote</p></blockquote>';

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'heading works', () => {
			const data = [
				'<h2>Heading 1.</h2>',
				'<h3>Heading 1.1</h3>',
				'<h4>Heading 1.1.1</h4>',
				'<h4>Heading 1.1.2</h4>',
				'<h3>Heading 1.2</h3>',
				'<h4>Heading 1.2.1</h4>',
				'<h2>Heading 2</h2>'
			].join( '' );

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'image works', () => {
			const data = '<figure class="image"><img src="./manual/sample.jpg"></figure>';

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'list works', () => {
			const data = [
				'<ul>',
				'<li>Item 1.</li>',
				'<li>Item 2.</li>',
				'</ul>',
				'<ol>',
				'<li>Item 1.</li>',
				'<li>Item 2.</li>',
				'</ol>'
			].join( '' );

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'link works', () => {
			const data = '<p><a href="//ckeditor.com">CKEditor.com</a></p>';

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );
	} );

	describe( 'config', () => {
		afterEach( () => {
			return editor.destroy();
		} );

		// https://github.com/ckeditor/ckeditor5/issues/572
		it( 'allows configure toolbar items through config.toolbar', () => {
			return DecoupledDocumentEditor
				.create( editorData, {
					toolbar: [ 'bold' ]
				} )
				.then( newEditor => {
					editor = newEditor;

					expect( editor.ui.view.toolbar.items.length ).to.equal( 1 );
				} );
		} );
	} );
} );
