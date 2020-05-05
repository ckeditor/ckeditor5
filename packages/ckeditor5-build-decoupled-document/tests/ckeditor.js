/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import DecoupledEditor from '../src/ckeditor';
import BaseDecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import { describeMemoryUsage, testMemoryUsage } from '@ckeditor/ckeditor5-core/tests/_utils/memory';

describe( 'DecoupledEditor build', () => {
	let editor, editorData, editorElement;

	beforeEach( () => {
		editorData = '<p><strong>foo</strong> bar</p>';

		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = editorData;

		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();
		editor = null;
	} );

	describe( 'build', () => {
		it( 'contains plugins', () => {
			expect( DecoupledEditor.builtinPlugins ).to.not.be.empty;
		} );

		it( 'contains config', () => {
			expect( DecoupledEditor.defaultConfig.toolbar ).to.not.be.empty;
		} );
	} );

	describe( 'editor with data', () => {
		test( () => editorData );

		it( 'does not define the UI DOM structure', () => {
			return DecoupledEditor.create( editorData )
				.then( newEditor => {
					expect( newEditor.ui.view.element ).to.be.null;
					expect( newEditor.ui.view.toolbar.element.parentElement ).to.be.null;
					expect( newEditor.ui.view.editable.element.parentElement ).to.be.null;

					return newEditor.destroy();
				} );
		} );
	} );

	describe( 'editor with editable element', () => {
		test( () => editorElement );

		it( 'uses the provided editable element', () => {
			return DecoupledEditor.create( editorElement )
				.then( newEditor => {
					expect( newEditor.ui.view.editable.element.parentElement ).to.equal( document.body );

					return newEditor.destroy();
				} );
		} );
	} );

	describeMemoryUsage( () => {
		testMemoryUsage(
			'should not grow on multiple create/destroy',
			() => DecoupledEditor.create( document.querySelector( '#mem-editor' ) ) );
	} );

	function test( getEditorDataOrElement ) {
		describe( 'create()', () => {
			beforeEach( () => {
				return DecoupledEditor.create( getEditorDataOrElement() )
					.then( newEditor => {
						editor = newEditor;
					} );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			it( 'creates an instance which inherits from the DecoupledEditor', () => {
				expect( editor ).to.be.instanceof( BaseDecoupledEditor );
				expect( editor ).to.be.instanceof( BaseDecoupledEditor );
			} );

			it( 'loads passed data', () => {
				expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
			} );
		} );

		describe( 'destroy()', () => {
			beforeEach( () => {
				return DecoupledEditor.create( getEditorDataOrElement() )
					.then( newEditor => {
						editor = newEditor;
					} );
			} );
		} );

		describe( 'plugins', () => {
			beforeEach( () => {
				return DecoupledEditor.create( getEditorDataOrElement() )
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
					'<u>Test:u</u>',
					'<s>Test:s</s>',
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

			it( 'font size works', () => {
				const data = '<p><span class="text-big">foo</span></p>';

				editor.setData( data );
				expect( editor.getData() ).to.equal( data );
				expect( editor.model.document.selection.getAttribute( 'fontSize' ) ).to.equal( 'big' );
			} );

			it( 'font family works', () => {
				const data = '<p><span style="font-family:Georgia, serif;">foo</span></p>';

				editor.setData( data );
				expect( editor.getData() ).to.equal( data );
				expect( editor.model.document.selection.getAttribute( 'fontFamily' ) ).to.equal( 'Georgia' );
			} );

			it( 'font background color works', () => {
				const data = '<p><span style="background-color:hsl(60,75%,60%);">foo</span></p>';

				editor.setData( data );
				expect( editor.getData() ).to.equal( data );
				expect( editor.model.document.selection.getAttribute( 'fontBackgroundColor' ) ).to.equal( 'hsl(60,75%,60%)' );
			} );

			it( 'font color works', () => {
				const data = '<p><span style="color:hsl(0,75%,60%);">foo</span></p>';

				editor.setData( data );
				expect( editor.getData() ).to.equal( data );
				expect( editor.model.document.selection.getAttribute( 'fontColor' ) ).to.equal( 'hsl(0,75%,60%)' );
			} );

			it( 'alignment works', () => {
				const data = '<p style="text-align:right;">foo</p>';

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
				return DecoupledEditor
					.create( getEditorDataOrElement(), {
						toolbar: [ 'bold' ]
					} )
					.then( newEditor => {
						editor = newEditor;

						expect( editor.ui.view.toolbar.items.length ).to.equal( 1 );
					} );
			} );
		} );
	}
} );
