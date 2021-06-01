/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import GFMDataProcessor from '@ckeditor/ckeditor5-markdown-gfm/src/gfmdataprocessor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting';

import CodeBlockEditing from '../src/codeblockediting';

describe( 'CodeBlock - integration', () => {
	describe( 'with Markdown GFM', () => {
		function getEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ CodeBlockIntegration, CodeBlockEditing, Enter, Paragraph ]
				} );
		}

		// A simple plugin that enables the GFM data processor.
		class CodeBlockIntegration extends Plugin {
			constructor( editor ) {
				super( editor );
				editor.data.processor = new GFMDataProcessor( editor.data.viewDocument );
			}
		}

		it( 'should be loaded and returned from the editor (for plain text)', async () => {
			const editor = await getEditor(
				'```\n' +
				'test()\n' +
				'```'
			);

			expect( editor.getData() ).to.equal(
				'```plaintext\n' +
				'test()\n' +
				'```'
			);

			await editor.destroy();
		} );
		it( 'should be loaded and returned from the editor (for defined language)', async () => {
			const editor = await getEditor(
				'```javascript\n' +
				'test()\n' +
				'```'
			);

			expect( editor.getData() ).to.equal(
				'```javascript\n' +
				'test()\n' +
				'```'
			);

			await editor.destroy();
		} );
	} );

	describe( 'with ImageInline', () => {
		let editor;

		beforeEach( () => {
			return ClassicTestEditor
				.create( '', {
					plugins: [ ImageInlineEditing, CodeBlockEditing, Enter, Paragraph ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should remove inline images when executing the "codeBlock" command', () => {
			editor.setData( '<p>Foo<img src="/assets/sample.png">Bar.</p>' );
			editor.execute( 'codeBlock' );

			expect( editor.getData() ).to.equal(
				'<pre>' +
					'<code class="language-plaintext">FooBar.</code>' +
				'</pre>'
			);
		} );

		it( 'should remove inline images when upcasting the "codeBlock" element (the paragraph inside the code)', () => {
			editor.setData( '<pre><code><p>Foo<img src="/assets/sample.png">Bar.</p></code></pre>' );

			expect( editor.getData() ).to.equal(
				'<pre>' +
					'<code class="language-plaintext">FooBar.</code>' +
				'</pre>'
			);
		} );

		it( 'should remove inline images when upcasting the "codeBlock" element (without the paragraph)', () => {
			editor.setData( '<pre><code>Foo<img src="/assets/sample.png">Bar.</code></pre>' );

			expect( editor.getData() ).to.equal(
				'<pre>' +
					'<code class="language-plaintext">FooBar.</code>' +
				'</pre>'
			);
		} );
	} );
} );
