/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import InlineEditor from '../src/ckeditor';
import BaseInlineEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
import { describeMemoryUsage, testMemoryUsage } from '@ckeditor/ckeditor5-core/tests/_utils/memory';

describe( 'InlineEditor build', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'buid', () => {
		it( 'contains plugins', () => {
			expect( InlineEditor.builtinPlugins ).to.not.be.empty;
		} );

		it( 'contains config', () => {
			expect( InlineEditor.defaultConfig.toolbar ).to.not.be.empty;
		} );
	} );

	describe( 'create()', () => {
		beforeEach( () => {
			return InlineEditor.create( editorElement )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'creates an instance which inherits from the InlineEditor', () => {
			expect( editor ).to.be.instanceof( InlineEditor );
			expect( editor ).to.be.instanceof( BaseInlineEditor );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( () => {
			return InlineEditor.create( editorElement )
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

	describe( 'plugins', () => {
		beforeEach( () => {
			return InlineEditor.create( editorElement )
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
			const data = '<figure class="image"><img src="/assets/sample.png"></figure>';

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

	describeMemoryUsage( () => {
		testMemoryUsage(
			'should not grow on multiple create/destroy',
			() => InlineEditor.create( document.querySelector( '#mem-editor' ) ) );
	} );
} );
