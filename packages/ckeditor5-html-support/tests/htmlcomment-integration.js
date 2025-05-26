/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';

import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting.js';

import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';

import HighlightEditing from '@ckeditor/ckeditor5-highlight/src/highlightediting.js';

import HtmlEmbedEditing from '@ckeditor/ckeditor5-html-embed/src/htmlembedediting.js';

import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting.js';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting.js';

import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting.js';

import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import LinkImageEditing from '@ckeditor/ckeditor5-link/src/linkimageediting.js';

import LegacyListEditing from '@ckeditor/ckeditor5-list/src/legacylist/legacylistediting.js';
import LegacyListPropertiesEditing from '@ckeditor/ckeditor5-list/src/legacylistproperties/legacylistpropertiesediting.js';
import LegacyTodoListEditing from '@ckeditor/ckeditor5-list/src/legacytodolist/legacytodolistediting.js';

import MediaEmbedEditing from '@ckeditor/ckeditor5-media-embed/src/mediaembedediting.js';

import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';

import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption.js';

import HtmlComment from '../src/htmlcomment.js';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';

describe( 'HtmlComment integration', () => {
	describe( 'integration with BlockQuote', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph, BlockQuoteEditing ]
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work if comment is in an empty blockquote', async () => {
			editor = await createEditor( '<blockquote><!-- c1 --></blockquote>' );

			expect( editor.getData() ).to.equal( '' );
		} );

		it( 'should work if comments are between tags', async () => {
			editor = await createEditor(
				'<!-- c1 -->' +
				'<blockquote>' +
					'<!-- c2 -->' +
					'<p>foobar</p>' +
					'<!-- c3 -->' +
				'</blockquote>' +
				'<!-- c4 -->'
			);

			expect( editor.getData() ).to.equal(
				'<!-- c1 -->' +
				'<blockquote>' +
					'<!-- c2 -->' +
					'<p>foobar</p>' +
					'<!-- c3 -->' +
				'</blockquote>' +
				'<!-- c4 -->'
			);
		} );
	} );

	describe( 'integration with CodeBlock', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph, CodeBlockEditing ]
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work if comment is in an empty code block', async () => {
			editor = await createEditor(
				'<pre>' +
					'<code class="language-plaintext">' +
						'<!-- c1 -->' +
					'</code>' +
				'</pre>'
			);

			expect( editor.getData() ).to.equal(
				'<pre>' +
					'<code class="language-plaintext">' +
						'<!-- c1 -->' +
						'&nbsp;' +
					'</code>' +
				'</pre>'
			);
		} );

		it( 'should work if comments are between tags', async () => {
			editor = await createEditor(
				'<!-- c1 -->' +
				'<pre>' +
					'<!-- c2 -->' +
					'<code class="language-plaintext">' +
						'<!-- c3 -->' +
						'Plain text' +
						'<!-- c4 -->' +
					'</code>' +
					'<!-- c5 -->' +
				'</pre>' +
				'<!-- c6 -->'
			);

			expect( editor.getData() ).to.equal(
				'<!-- c2 -->' +
				'<!-- c1 -->' +
				'<pre>' +
					'<code class="language-plaintext">' +
						'<!-- c3 -->' +
						'Plain text' +
						'<!-- c4 -->' +
					'</code>' +
				'</pre>' +
				'<!-- c6 -->' +
				'<!-- c5 -->'
			);
		} );
	} );

	describe( 'integration with Heading', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph, HeadingEditing ]
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work if comment is in an empty heading', async () => {
			editor = await createEditor(
				'<h1><!-- c1 --></h1>' +
				'<h2><!-- c2 --></h2>'
			);

			expect( editor.getData() ).to.equal(
				'<h2><!-- c1 -->&nbsp;</h2>' +
				'<h2><!-- c2 -->&nbsp;</h2>'
			);
		} );

		it( 'should work if comments are between tags', async () => {
			editor = await createEditor(
				'<!-- c1 -->' +
				'<h1>' +
					'<!-- c2 -->' +
					'Heading 1' +
					'<!-- c3 -->' +
				'</h1>' +
				'<!-- c4 -->' +
				'<h2>' +
					'<!-- c5 -->' +
					'Heading 2' +
					'<!-- c6 -->' +
				'</h2>' +
				'<!-- c7 -->'
			);

			expect( editor.getData() ).to.equal(
				'<!-- c1 -->' +
				'<h2>' +
					'<!-- c2 -->' +
					'Heading 1' +
					'<!-- c3 -->' +
				'</h2>' +
				'<!-- c4 -->' +
				'<h2>' +
					'<!-- c5 -->' +
					'Heading 2' +
					'<!-- c6 -->' +
				'</h2>' +
				'<!-- c7 -->'
			);
		} );
	} );

	describe( 'integration with Highlight', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph, HighlightEditing ]
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work if comment is in an empty highlight', async () => {
			editor = await createEditor(
				'<p>' +
					'<mark class="marker-yellow">' +
						'<!-- c1 -->' +
					'</mark>' +
				'</p>' +
				'<p>' +
					'<mark class="pen-red">' +
						'<!-- c2 -->' +
					'</mark>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<!-- c1 -->' +
					'&nbsp;' +
				'</p>' +
				'<p>' +
					'<!-- c2 -->' +
					'&nbsp;' +
				'</p>'
			);
		} );

		it( 'should work if comments are between tags', async () => {
			editor = await createEditor(
				'<p>' +
					'<!-- c1 -->' +
					'<mark class="marker-yellow">' +
						'<!-- c2 --> ' +
						'Yellow marker' +
						'<!-- c3 --> ' +
					'</mark>' +
					'<!-- c4 --> ' +
				'</p>' +
				'<p>' +
					'<!-- c5 -->' +
					'<mark class="pen-red">' +
						'<!-- c6 --> ' +
						'Red pen' +
						'<!-- c7 --> ' +
					'</mark>' +
					'<!-- c8 --> ' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<!-- c2 -->' +
					'<!-- c1 -->' +
					'<mark class="marker-yellow">' +
						'Yellow marker' +
						'<!-- c3 -->' +
						'&nbsp;' +
					'</mark>' +
					'<!-- c4 -->' +
				'</p>' +
				'<p>' +
					'<!-- c6 -->' +
					'<!-- c5 -->' +
					'<mark class="pen-red">' +
						'Red pen' +
						'<!-- c7 -->' +
						'&nbsp;' +
					'</mark>' +
					'<!-- c8 -->' +
				'</p>'
			);
		} );
	} );

	describe( 'integration with HtmlEmbed', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph, HtmlEmbedEditing ]
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work if comment is in an empty embedded HTML', async () => {
			editor = await createEditor(
				'<div class="raw-html-embed">' +
					'<!-- c1 -->' +
				'</div>'
			);

			expect( editor.getData() ).to.equal(
				'<div class="raw-html-embed">' +
					'<!-- c1 -->' +
				'</div>'
			);
		} );

		it( 'should work if comments are between tags', async () => {
			editor = await createEditor(
				'<!-- c1 -->' +
				'<div class="raw-html-embed">' +
					'<!-- c2 -->' +
					'<p>' +
						'Paragraph' +
					'</p>' +
					'<!-- c3 -->' +
				'</div>' +
				'<!-- c4 -->'
			);

			expect( editor.getData() ).to.equal(
				'<!-- c1 -->' +
				'<div class="raw-html-embed">' +
					'<!-- c2 -->' +
					'<p>' +
						'Paragraph' +
					'</p>' +
					'<!-- c3 -->' +
				'</div>' +
				'<!-- c4 -->'
			);
		} );
	} );

	describe( 'integration with Image', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph, ImageBlockEditing, ImageInlineEditing, ImageCaptionEditing ]
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work if comments are between block image tags', async () => {
			editor = await createEditor(
				'<!-- c1 -->' +
				'<figure class="image">' +
					'<!-- c2 -->' +
					'<img src="/assets/sample.png" alt="Example image">' +
					'<!-- c3 -->' +
					'<figcaption>' +
						'<!-- c4 -->' +
						'image caption' +
						'<!-- c5 -->' +
					'</figcaption>' +
					'<!-- c6 -->' +
				'</figure>' +
				'<!-- c7 -->'
			);

			expect( editor.getData() ).to.equal(
				'<!-- c1 -->' +
				'<figure class="image">' +
					'<!-- c3 -->' +
					'<!-- c2 -->' +
					'<img src="/assets/sample.png" alt="Example image">' +
					'<figcaption>' +
						'<!-- c4 -->' +
						'image caption' +
						'<!-- c5 -->' +
					'</figcaption>' +
					'<!-- c6 -->' +
				'</figure>' +
				'<!-- c7 -->'
			);
		} );

		it( 'should work if comment is in an empty image caption', async () => {
			editor = await createEditor(
				'<figure class="image">' +
					'<img src="/assets/sample.png" alt="Example image">' +
					'<figcaption>' +
						'<!-- c1 -->' +
					'</figcaption>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="image">' +
					'<img src="/assets/sample.png" alt="Example image">' +
					'<figcaption>' +
						'<!-- c1 -->' +
						'&nbsp;' +
					'</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should work if comments are between inline image tags', async () => {
			editor = await createEditor(
				'<!-- c1 -->' +
				'<p>' +
					'<!-- c2 -->' +
					'<img src="/assets/sample.png" alt="Example image">' +
					'<!-- c3 -->' +
				'</p>' +
				'<!-- c4 -->'
			);

			expect( editor.getData() ).to.equal(
				'<!-- c1 -->' +
				'<p>' +
					'<!-- c2 -->' +
					'<img src="/assets/sample.png" alt="Example image">' +
					'<!-- c3 -->' +
				'</p>' +
				'<!-- c4 -->'
			);
		} );
	} );

	describe( 'integration with Indent', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph, IndentEditing, IndentBlock ]
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work if comment is in an empty indented paragraph', async () => {
			editor = await createEditor(
				'<p style="margin:0 0 0 40px;">' +
					'<!-- c1 -->' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p style="margin-left:40px;">' +
					'<!-- c1 -->' +
					'&nbsp;' +
				'</p>'
			);
		} );

		it( 'should work if comments are between tags', async () => {
			editor = await createEditor(
				'<!-- c1 -->' +
				'<p style="margin:0 0 0 40px;">' +
					'<!-- c2 -->' +
					'Indented paragraph' +
					'<!-- c3 -->' +
				'</p>' +
				'<!-- c4 -->'
			);

			expect( editor.getData() ).to.equal(
				'<!-- c1 -->' +
				'<p style="margin-left:40px;">' +
					'<!-- c2 -->' +
					'Indented paragraph' +
					'<!-- c3 -->' +
				'</p>' +
				'<!-- c4 -->'
			);
		} );
	} );

	describe( 'integration with Link', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph, ImageBlockEditing, ImageInlineEditing, LinkEditing, LinkImageEditing ],
					link: {
						addTargetToExternalLinks: true
					}
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work if comment is in an empty link', async () => {
			editor = await createEditor(
				'<p>' +
					'<a href="path/to/resource">' +
						'<!-- c1 -->' +
					'</a>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal( '<p><!-- c1 -->&nbsp;</p>' );
		} );

		it( 'should work if comments are between tags', async () => {
			editor = await createEditor(
				'<p>' +
					'<!-- c1 -->' +
					'<a href="path/to/resource">' +
						'<!-- c2 -->' +
						'Link' +
						'<!-- c3 -->' +
					'</a>' +
					'<!-- c4 -->' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<!-- c2 -->' +
					'<!-- c1 -->' +
					'<a href="path/to/resource">' +
						'Link' +
					'</a>' +
					'<!-- c4 -->' +
					'<!-- c3 -->' +
				'</p>'
			);
		} );

		it( 'should work with image link', async () => {
			editor = await createEditor(
				'<p>' +
					'<a href="path/to/resource">' +
						'<!-- c1 -->' +
						'Link with inline image: ' +
						'<!-- c2 -->' +
						'<img src="/assets/sample.png" alt="Example image">' +
						'<!-- c3 -->' +
					'</a>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<!-- c1 -->' +
					'<a href="path/to/resource">' +
						'Link with inline image: ' +
						'<!-- c2 -->' +
						'<img src="/assets/sample.png" alt="Example image">' +
					'</a>' +
					'<!-- c3 -->' +
				'</p>'
			);
		} );

		it( 'should work with links with decorators', async () => {
			editor = await createEditor(
				'<p>' +
					'<a href="http://example.com">' +
						'<!-- c1 -->' +
						'External link with inline image: ' +
						'<!-- c2 -->' +
						'<img src="/assets/sample.png" alt="Example image">' +
						'<!-- c3 -->' +
					'</a>' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<!-- c1 -->' +
					'<a target="_blank" rel="noopener noreferrer" href="http://example.com">' +
						'External link with inline image: ' +
						'<!-- c2 -->' +
						'<img src="/assets/sample.png" alt="Example image">' +
					'</a>' +
					'<!-- c3 -->' +
				'</p>'
			);
		} );
	} );

	describe( 'integration with List', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph, LegacyListEditing, LegacyListPropertiesEditing, LegacyTodoListEditing ]
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work if comment is in an empty list item', async () => {
			editor = await createEditor(
				'<ol><li><!-- c1 --></li></ol>' +
				'<ul><li><!-- c2 --></li></ul>'
			);

			expect( editor.getData() ).to.equal(
				'<ol><li><!-- c1 -->&nbsp;</li></ol>' +
				'<ul><li><!-- c2 -->&nbsp;</li></ul>'
			);
		} );

		it( 'should work if comments are between tags', async () => {
			editor = await createEditor(
				'<!-- c1 -->' +
				'<ol>' +
					'<!-- c2 -->' +
					'<li>' +
						'<!-- c3 -->' +
						'Ordered list item' +
						'<!-- c4 -->' +
					'</li>' +
					'<!-- c5 -->' +
				'</ol>' +
				'<!-- c6 -->' +
				'<ul>' +
					'<!-- c7 -->' +
					'<li>' +
						'<!-- c8 -->' +
						'Bulleted list item' +
						'<!-- c9 -->' +
					'</li>' +
					'<!-- c10 -->' +
				'</ul>' +
				'<!-- c11 -->'
			);

			expect( editor.getData() ).to.equal(
				'<!-- c1 -->' +
				'<ol>' +
					'<li>' +
						'<!-- c3 -->' +
						'Ordered list item' +
						'<!-- c4 -->' +
					'</li>' +
				'</ol>' +
				'<!-- c6 -->' +
				'<ul>' +
					'<li>' +
						'<!-- c8 -->' +
						'Bulleted list item' +
						'<!-- c9 -->' +
					'</li>' +
				'</ul>' +
				'<!-- c11 -->'
			);
		} );

		it( 'should work with nested lists', async () => {
			editor = await createEditor(
				'<ul>' +
					'<li>' +
						'<!-- c1 -->' +
						'<ul>' +
							'<!-- c2 -->' +
							'<li>' +
								'<!-- c3 -->' +
								'List item' +
								'<!-- c4 -->' +
							'</li>' +
							'<!-- c6 -->' +
						'</ul>' +
						'<!-- c7 -->' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equal(
				'<ul>' +
					'<li>' +
						'<!-- c1 -->' +
						'<ul>' +
							'<li>' +
								'<!-- c3 -->' +
								'List item' +
								'<!-- c4 -->' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should work with a to-do list', async () => {
			editor = await createEditor(
				'<ul>' +
					'<li>' +
						'<!-- c1 -->' +
						'<input type="checkbox">' +
						'To-do list item 1' +
						'<!-- c2 -->' +
					'</li>' +
					'<li>' +
						'<!-- c3 -->' +
						'<input type="checkbox" checked="checked">' +
						'To-do list item 2' +
						'<!-- c4 -->' +
					'</li>' +
				'</ul>'
			);

			// Currently, if input element in a to-do list is preceded by a comment, a to-do list is not created.
			// See https://github.com/ckeditor/ckeditor5/issues/10129.
			//
			// expect( editor.getData() ).to.equal(
			// 	'<ul class="todo-list">' +
			// 		'<li>' +
			// 			'<label class="todo-list__label">' +
			// 				'<input type="checkbox" disabled="disabled">' +
			// 				'<span class="todo-list__label__description">' +
			// 					'<!-- c1 -->' +
			// 					'To-do list item 1' +
			// 					'<!-- c2 -->' +
			// 				'</span>' +
			// 			'</label>' +
			// 		'</li>' +
			// 		'<li>' +
			// 			'<label class="todo-list__label">' +
			// 				'<input type="checkbox" disabled="disabled" checked="checked">' +
			// 				'<span class="todo-list__label__description">' +
			// 					'<!-- c3 -->' +
			// 					'To-do list item 2' +
			// 					'<!-- c4 -->' +
			// 				'</span>' +
			// 			'</label>' +
			// 		'</li>' +
			// 	'</ul>'
			// );

			expect( editor.getData() ).to.equal(
				'<ul>' +
					'<li>' +
						'<!-- c1 -->' +
						'To-do list item 1' +
						'<!-- c2 -->' +
					'</li>' +
					'<li>' +
						'<!-- c3 -->' +
						'To-do list item 2' +
						'<!-- c4 -->' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should work with a list style', async () => {
			editor = await createEditor(
				'<ul style="list-style-type:circle;">' +
					'<li>' +
						'<!-- c1 -->' +
						'List item' +
						'<!-- c2 -->' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equal(
				'<ul style="list-style-type:circle;">' +
					'<li>' +
						'<!-- c1 -->' +
						'List item' +
						'<!-- c2 -->' +
					'</li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'integration with MediaEmbed', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph, MediaEmbedEditing ],
					mediaEmbed: {
						previewsInData: true,
						providers: [
							{
								name: 'example',
								url: /^example\.com\/(\w+)/,
								html: match => `example provider, id=${ match[ 1 ] }`
							}
						]
					}
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work if comment is in an empty media wrapper tag', async () => {
			editor = await createEditor( '<figure class="media"><!-- c1 --></figure>' );

			expect( editor.getData() ).to.equal( '' );
		} );

		it( 'should work if comment is in an empty non-semantic media', async () => {
			editor = await createEditor(
				'<figure class="media">' +
					'<div data-oembed-url="https://example.com/1234">' +
						'<!-- c1 -->' +
					'</div>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<!-- c1 -->' +
					'<div data-oembed-url="https://example.com/1234">' +
						'example provider, id=1234' +
					'</div>' +
				'</figure>'
			);
		} );

		it( 'should work if comments are between semantic media tags', async () => {
			editor = await createEditor(
				'<!-- c1 -->' +
				'<figure class="media">' +
					'<!-- c2 -->' +
					'<oembed url="https://example.com/1234" />' +
					'<!-- c3 -->' +
				'</figure>' +
				'<!-- c4 -->'
			);

			expect( editor.getData() ).to.equal(
				'<!-- c2 -->' +
				'<!-- c1 -->' +
				'<figure class="media">' +
					'<!-- c3 -->' +
					'<div data-oembed-url="https://example.com/1234">' +
						'example provider, id=1234' +
					'</div>' +
				'</figure>' +
				'<!-- c4 -->'
			);
		} );

		it( 'should work if comments are between non-semantic media tags', async () => {
			editor = await createEditor(
				'<!-- c1 -->' +
				'<figure class="media">' +
					'<!-- c2 -->' +
					'<div data-oembed-url="https://example.com/1234">' +
						'<!-- c3 -->' +
					'</div>' +
					'<!-- c4 -->' +
				'</figure>' +
				'<!-- c5 -->'
			);

			expect( editor.getData() ).to.equal(
				'<!-- c2 -->' +
				'<!-- c1 -->' +
				'<figure class="media">' +
					'<!-- c3 -->' +
					'<div data-oembed-url="https://example.com/1234">' +
						'example provider, id=1234' +
					'</div>' +
				'</figure>' +
				'<!-- c5 -->' +
				'<!-- c4 -->'
			);
		} );
	} );

	describe( 'integration with Paragraph', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph ]
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work if comment is in an empty paragraph', async () => {
			editor = await createEditor( '<p><!-- c1 --></p>' );

			expect( editor.getData() ).to.equal( '<p><!-- c1 -->&nbsp;</p>' );
		} );

		it( 'should work if comments are between tags', async () => {
			editor = await createEditor(
				'<!-- c1 -->' +
				'<p>' +
					'<!-- c2 -->' +
					'paragraph' +
					'<!-- c3 -->' +
				'</p>' +
				'<!-- c4 -->'
			);

			expect( editor.getData() ).to.equal(
				'<!-- c1 -->' +
				'<p>' +
					'<!-- c2 -->' +
					'paragraph' +
					'<!-- c3 -->' +
				'</p>' +
				'<!-- c4 -->'
			);
		} );

		it( 'should remove comments when the content including them is removed', async () => {
			editor = await createEditor(
				'<p>' +
					'<!-- comment 1 -->' +
					'Foo' +
					'<!-- comment 2 -->' +
				'</p>' +
				'<p>' +
					'<!-- comment 3 -->' +
					'Foo' +
					'<!-- comment 4 -->' +
				'</p>'
			);

			const model = editor.model;
			const root = model.document.getRoot();

			model.change( writer => {
				const firstParagraph = root.getChild( 0 );
				const secondParagraph = root.getChild( 1 );

				writer.setSelection( writer.createRange(
					writer.createPositionAt( firstParagraph, 'end' ),
					writer.createPositionAt( secondParagraph, 'end' )
				) );
			} );

			editor.execute( 'delete' );

			// The following output could be considered as the correct and expected one,
			// but currently the comment 4 is not removed, because it is not located at the limit element's boundary:
			// expect( editor.getData() ).to.equal(
			// 	'<p>' +
			// 		'<!-- comment 1 -->' +
			// 		'Foo' +
			// 		'<!-- comment 2 -->' +
			// 	'</p>'
			// );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<!-- comment 1 -->' +
					'Foo' +
					'<!-- comment 4 -->' +
					'<!-- comment 2 -->' +
				'</p>'
			);
		} );
	} );

	describe( 'integration with SourceEditing', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph, SourceEditing ]
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should display comments in the source editing mode', async () => {
			editor = await createEditor(
				'<p>' +
					'<!-- comment 1 -->' +
					'Foo' +
					'<!-- comment 2 -->' +
				'</p>'
			);

			const toggleSourceEditingModeButton = editor.ui.componentFactory.create( 'sourceEditing' );

			toggleSourceEditingModeButton.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			expect( textarea.value ).to.equal(
				'<p>\n' +
				'    <!-- comment 1 -->Foo<!-- comment 2 -->\n' +
				'</p>'
			);
		} );

		it( 'should add comments at non-boundary positions using the source editing mode', async () => {
			editor = await createEditor( '<p>Foo</p>' );

			const toggleSourceEditingModeButton = editor.ui.componentFactory.create( 'sourceEditing' );

			toggleSourceEditingModeButton.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			textarea.value = '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>';
			textarea.dispatchEvent( new Event( 'input' ) );

			toggleSourceEditingModeButton.fire( 'execute' );

			expect( editor.getData() ).to.equal( '<p><!-- comment 1 -->Foo<!-- comment 2 --></p>' );
		} );

		it( 'should add comments at boundary positions using the source editing mode', async () => {
			editor = await createEditor( '<p>Foo</p>' );

			const toggleSourceEditingModeButton = editor.ui.componentFactory.create( 'sourceEditing' );

			toggleSourceEditingModeButton.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			textarea.value = '<!-- comment 1 --><p>Foo</p><!-- comment 2 -->';
			textarea.dispatchEvent( new Event( 'input' ) );

			toggleSourceEditingModeButton.fire( 'execute' );

			expect( editor.getData() ).to.equal( '<!-- comment 1 --><p>Foo</p><!-- comment 2 -->' );
		} );

		it( 'should properly handle existing and newly added comments after exiting from the source editing mode', async () => {
			editor = await createEditor(
				'<!-- comment 1 -->' +
				'<p>' +
					'Foo' +
				'</p>' +
				'<!-- comment 2 -->'
			);

			const toggleSourceEditingModeButton = editor.ui.componentFactory.create( 'sourceEditing' );

			toggleSourceEditingModeButton.fire( 'execute' );

			const domRoot = editor.editing.view.getDomRoot();
			const textarea = domRoot.nextSibling.children[ 0 ];

			textarea.value = '<!-- comment 1 --><p><!-- comment 2 -->Foo<!-- comment 3 --></p><!-- comment 4 -->';
			textarea.dispatchEvent( new Event( 'input' ) );

			toggleSourceEditingModeButton.fire( 'execute' );

			expect( editor.getData() ).to.equal(
				'<!-- comment 1 -->' +
				'<p>' +
					'<!-- comment 2 -->' +
					'Foo' +
					'<!-- comment 3 -->' +
				'</p>' +
				'<!-- comment 4 -->'
			);
		} );
	} );

	describe( 'integration with Table', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph, TableEditing, TableCaption ]
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/10116.
		it( 'should work if comment is in an empty table cell', async () => {
			editor = await createEditor(
				'<table>' +
					'<tr>' +
						'<td>' +
							'<!-- c1 -->' +
						'</td>' +
					'</tr>' +
				'</table>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>' +
									'<!-- c1 -->' +
									'&nbsp;' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/10116.
		it( 'should work if comment is in table cell after empty paragraph', async () => {
			editor = await createEditor(
				'<table>' +
					'<tr>' +
						'<td>' +
							'<p></p>' +
							'<!-- c1 -->' +
						'</td>' +
					'</tr>' +
				'</table>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>' +
									'&nbsp;' +
									'<!-- c1 -->' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/10116.
		it( 'should work if comment is in table cell after non-empty paragraph', async () => {
			editor = await createEditor(
				'<table>' +
					'<tr>' +
						'<td>' +
							'<p>foobar</p>' +
							'<!-- c1 -->' +
						'</td>' +
					'</tr>' +
				'</table>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>' +
									'foobar' +
									'<!-- c1 -->' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);
		} );

		it( 'should work if comments are in a non-empty table cell', async () => {
			editor = await createEditor(
				'<table>' +
					'<tr>' +
						'<td>' +
							'<!-- c1 -->' +
							'table cell' +
							'<!-- c2 -->' +
						'</td>' +
						'<td colspan="2" rowspan="2">' +
							'<!-- c3 -->' +
							'table cell' +
							'<!-- c4 -->' +
						'</td>' +
					'</tr>' +
					'<tr>' +
						'<td>' +
							'<!-- c5 -->' +
							'table cell' +
							'<!-- c6 -->' +
						'</td>' +
					'</tr>' +
				'</table>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>' +
									'<!-- c1 -->' +
									'table cell' +
									'<!-- c2 -->' +
								'</td>' +
								'<td colspan="2" rowspan="2">' +
									'<!-- c3 -->' +
									'table cell' +
									'<!-- c4 -->' +
								'</td>' +
							'</tr>' +
							'<tr>' +
								'<td>' +
									'<!-- c5 -->' +
									'table cell' +
									'<!-- c6 -->' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);
		} );

		it( 'should work if comments are between tags', async () => {
			editor = await createEditor(
				'<!-- c1 -->' +
				'<table>' +
					'<!-- c2 -->' +
					'<thead>' +
						'<!-- c3 -->' +
						'<tr>' +
							'<!-- c4 -->' +
							'<th>table cell</th>' +
							'<!-- c5 -->' +
						'</tr>' +
						'<!-- c6 -->' +
					'</thead>' +
					'<!-- c7 -->' +
					'<tbody>' +
						'<!-- c8 -->' +
						'<tr>' +
							'<!-- c9 -->' +
							'<td>table cell</td>' +
							'<!-- c10 -->' +
						'</tr>' +
						'<!-- c11 -->' +
					'</tbody>' +
					'<!-- c12 -->' +
					'<tfoot>' +
						'<!-- c13 -->' +
						'<tr>' +
							'<!-- c14 -->' +
							'<td>table cell</td>' +
							'<!-- c15 -->' +
						'</tr>' +
						'<!-- c16 -->' +
					'</tfoot>' +
					'<!-- c17 -->' +
				'</table>' +
				'<!-- c18 -->'
			);

			expect( editor.getData() ).to.equal(
				'<!-- c1 -->' +
				'<figure class="table">' +
					'<table>' +
						'<thead>' +
							'<tr>' +
								'<!-- c4 -->' +
								'<th>table cell</th>' +
								'<!-- c5 -->' +
							'</tr>' +
						'</thead>' +
						'<tbody>' +
							'<tr>' +
								'<!-- c9 -->' +
								'<td>table cell</td>' +
								'<!-- c10 -->' +
							'</tr>' +
							'<tr>' +
								'<!-- c14 -->' +
								'<td>table cell</td>' +
								'<!-- c15 -->' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<!-- c17 -->' +
					'<!-- c16 -->' +
					'<!-- c13 -->' +
					'<!-- c12 -->' +
					'<!-- c11 -->' +
					'<!-- c8 -->' +
					'<!-- c7 -->' +
					'<!-- c6 -->' +
					'<!-- c3 -->' +
					'<!-- c2 -->' +
				'</figure>' +
				'<!-- c18 -->'
			);
		} );

		it( 'should work if comments are in table caption', async () => {
			editor = await createEditor(
				'<table>' +
					'<tr>' +
						'<td>table cell</td>' +
					'</tr>' +
					'<!-- c1 -->' +
					'<caption>' +
						'<!-- c2 -->' +
						'table caption' +
						'<!-- c3 -->' +
					'</caption>' +
					'<!-- c4 -->' +
				'</table>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>table cell</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<!-- c1 -->' +
					'<figcaption>' +
						'<!-- c2 -->' +
						'table caption' +
						'<!-- c3 -->' +
					'</figcaption>' +
					'<!-- c4 -->' +
				'</figure>'
			);
		} );

		it( 'should work if comment is in an empty table caption', async () => {
			editor = await createEditor(
				'<table>' +
					'<tr>' +
						'<td>table cell</td>' +
					'</tr>' +
					'<caption>' +
						'<!-- c1 -->' +
					'</caption>' +
				'</table>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>table cell</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<figcaption>' +
						'<!-- c1 -->' +
						'&nbsp;' +
					'</figcaption>' +
				'</figure>'
			);
		} );
	} );

	describe( 'integration with Undo', () => {
		let editor;

		function createEditor( initialData = '' ) {
			return ClassicTestEditor
				.create( initialData, {
					plugins: [ HtmlComment, Essentials, Paragraph ]
				} );
		}

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work if content with comments is removed and then restored', async () => {
			editor = await createEditor(
				'<p>' +
					'<!-- c1 -->' +
					'paragraph' +
					'<!-- c2 -->' +
				'</p>'
			);

			const model = editor.model;
			const root = model.document.getRoot();

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
			} );

			editor.execute( 'undo' );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<!-- c1 -->' +
					'paragraph' +
					'<!-- c2 -->' +
				'</p>'
			);
		} );
	} );

	describe( 'integration with Multi-root editor', () => {
		let editor;

		beforeEach( () => {
			return MultiRootEditor
				.create( {
					main: '<!-- c1 --><p><!-- c2 -->main<!-- c3 --></p><!-- c4 -->',
					second: '<!-- c1 --><p><!-- c2 -->second<!-- c3 --></p><!-- c4 -->'
				}, {
					plugins: [
						HtmlComment, Paragraph
					]
				} )
				.then( _editor => {
					editor = _editor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should work for multiple roots', async () => {
			expect( editor.getData( { rootName: 'main' } ) ).to.equal(
				'<!-- c1 -->' +
				'<p>' +
				'<!-- c2 -->' +
				'main' +
				'<!-- c3 -->' +
				'</p>' +
				'<!-- c4 -->'
			);

			expect( editor.getData( { rootName: 'second' } ) ).to.equal(
				'<!-- c1 -->' +
				'<p>' +
				'<!-- c2 -->' +
				'second' +
				'<!-- c3 -->' +
				'</p>' +
				'<!-- c4 -->'
			);
		} );
	} );
} );
