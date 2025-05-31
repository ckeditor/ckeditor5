/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import GFMDataProcessor from '@ckeditor/ckeditor5-markdown-gfm/src/gfmdataprocessor.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting.js';
import ListEditing from '@ckeditor/ckeditor5-list/src/list/listediting.js';
import ListPropertiesEditing from '@ckeditor/ckeditor5-list/src/listproperties/listpropertiesediting.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import CodeBlockUI from '../src/codeblockui.js';
import CodeBlockEditing from '../src/codeblockediting.js';

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

	describe( 'integration with "usePreviousLanguageChoice=true"', () => {
		let editor;

		beforeEach( () => {
			return ClassicTestEditor
				.create( '', {
					plugins: [ CodeBlockEditing, CodeBlockUI, Enter, Paragraph ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should create a second code block with the same language as the first one', () => {
			const dropdown = editor.ui.componentFactory.create( 'codeBlock' );
			const codeBlock = dropdown.buttonView;

			dropdown.render();
			document.body.appendChild( dropdown.element );

			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdown.listView ).to.be.undefined;

			// Trigger list view creation (lazy init).
			dropdown.isOpen = true;
			dropdown.isOpen = false;

			const listView = dropdown.panelView.children.first;
			const cSharpButton = listView.items.get( 2 ).children.first;

			expect( cSharpButton.label ).to.equal( 'C#' );

			// Initial state.
			expect( getData( editor.model ) ).to.equal( '<paragraph>[]</paragraph>' );

			// Select a language from dropdown.
			cSharpButton.fire( 'execute' );
			expect( getData( editor.model ) ).to.equal( '<codeBlock language="cs">[]</codeBlock>' );

			// Click on the `codeBlock` button next to the dropdown. When selection is inside the `<codeBlock>` element,
			// the entire element should be replaced with the paragraph.
			codeBlock.fire( 'execute' );
			expect( getData( editor.model ) ).to.equal( '<paragraph>[]</paragraph>' );

			// Clicking the button once again should create the code block with the C# language instead of the default (plaintext).
			codeBlock.fire( 'execute' );
			expect( getData( editor.model ) ).to.equal( '<codeBlock language="cs">[]</codeBlock>' );

			dropdown.element.remove();
		} );
	} );

	describe( 'with ListEditing', () => {
		let editor, model;

		describe( 'when ListEditing is loaded', () => {
			beforeEach( async () => {
				editor = await ClassicTestEditor
					.create( '', {
						plugins: [
							CodeBlockEditing, ListEditing, ListPropertiesEditing, Enter, Paragraph, GeneralHtmlSupport
						],
						htmlSupport: {
							allow: [
								{ name: /./, attributes: true, styles: true, classes: true }
							]
						}
					} );

				model = editor.model;
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should allow all list attributes in the schema', () => {
				setData( model, '<codeBlock language="plaintext">[]foo</codeBlock>' );

				const codeBlock = model.document.getRoot().getChild( 0 );

				expect( model.schema.checkAttribute( codeBlock, 'listItemId' ), 'listItemId' ).to.be.true;
				expect( model.schema.checkAttribute( codeBlock, 'listType' ), 'listType' ).to.be.true;
				expect( model.schema.checkAttribute( codeBlock, 'listStyle' ), 'listStyle' ).to.be.true;
				expect( model.schema.checkAttribute( codeBlock, 'htmlLiAttributes' ), 'htmlLiAttributes' ).to.be.true;
				expect( model.schema.checkAttribute( codeBlock, 'htmlUlAttributes' ), 'htmlUlAttributes' ).to.be.true;
				expect( model.schema.checkAttribute( codeBlock, 'htmlOlAttributes' ), 'htmlOlAttributes' ).to.be.true;
			} );

			it( 'should disallow attributes that are not registered as list attributes', () => {
				setData( model, '<codeBlock language="plaintext">[]foo</codeBlock>' );

				const codeBlock = model.document.getRoot().getChild( 0 );

				expect( model.schema.checkAttribute( codeBlock, 'listReversed' ), 'listReversed' ).to.be.false;
				expect( model.schema.checkAttribute( codeBlock, 'listStart' ), 'listStart' ).to.be.false;
				expect( model.schema.checkAttribute( codeBlock, 'list' ), 'list' ).to.be.false;
				expect( model.schema.checkAttribute( codeBlock, 'fooList' ), 'fooList' ).to.be.false;
				expect( model.schema.checkAttribute( codeBlock, 'alist' ), 'alist' ).to.be.false;
				expect( model.schema.checkAttribute( codeBlock, 'alistb' ), 'alistb' ).to.be.false;
				expect( model.schema.checkAttribute( codeBlock, 'LISTbar' ), 'LISTbar' ).to.be.false;
			} );
		} );

		describe( 'when ListEditing is not loaded', () => {
			beforeEach( async () => {
				editor = await ClassicTestEditor
					.create( '', {
						plugins: [ CodeBlockEditing, Enter, Paragraph ]
					} );

				model = editor.model;
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should disallow all attributes starting with list* in the schema', () => {
				setData( model, '<codeBlock language="plaintext">[]foo</codeBlock>' );

				const codeBlock = model.document.getRoot().getChild( 0 );

				expect( model.schema.checkAttribute( codeBlock, 'listItemId' ), 'listItemId' ).to.be.false;
				expect( model.schema.checkAttribute( codeBlock, 'listType' ), 'listType' ).to.be.false;
				expect( model.schema.checkAttribute( codeBlock, 'listStart' ), 'listStart' ).to.be.false;
				expect( model.schema.checkAttribute( codeBlock, 'listFoo' ), 'listFoo' ).to.be.false;
			} );
		} );
	} );
} );
