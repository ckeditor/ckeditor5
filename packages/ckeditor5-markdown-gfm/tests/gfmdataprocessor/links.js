/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import MarkdownDataProcessor from '/ckeditor5/markdown-gfm/gfmdataprocessor.js';
import { stringify } from '/tests/engine/_utils/view.js';

describe( 'GFMDataProcessor', () => {
	let dataProcessor;

	beforeEach( () => {
		dataProcessor = new MarkdownDataProcessor();
	} );

	describe( 'links', () => {
		describe( 'toView', () => {
			it( 'should autolink', () => {
				const viewFragment = dataProcessor.toView( 'Link: <http://example.com/>.' );

				expect( stringify( viewFragment ) ).to.equal( '<p>Link: <a href="http://example.com/">http://example.com/</a>.</p>' );
			} );

			it( 'should autolink #2', () => {
				const viewFragment = dataProcessor.toView( 'Link: http://example.com/.' );

				expect( stringify( viewFragment ) ).to.equal( '<p>Link: <a href="http://example.com/">http://example.com/</a>.</p>' );
			} );

			it( 'should autolink with params', () => {
				const viewFragment = dataProcessor.toView( 'Link: <http://example.com/?foo=1&bar=2>.' );

				expect( stringify( viewFragment ) ).to.equal(
					'<p>Link: <a href="http://example.com/?foo=1&bar=2">http://example.com/?foo=1&bar=2</a>.</p>'
				);
			} );

			it( 'should autolink inside list', () => {
				const viewFragment = dataProcessor.toView( '* <http://example.com/>' );

				expect( stringify( viewFragment ) ).to.equal(
					'<ul>' +
						'<li><a href="http://example.com/">http://example.com/</a></li>' +
					'</ul>'
				);
			} );

			it( 'should autolink inside blockquote', () => {
				const viewFragment = dataProcessor.toView( '> Blockquoted: <http://example.com/>' );

				expect( stringify( viewFragment ) ).to.equal(
					'<blockquote>' +
						'<p>Blockquoted: <a href="http://example.com/">http://example.com/</a></p>' +
					'</blockquote>'
				);
			} );

			it( 'should not autolink inside inline code', () => {
				const viewFragment = dataProcessor.toView( '`<http://example.com/>`' );

				expect( stringify( viewFragment ) ).to.equal( '<p><code><http://example.com/></code></p>' );
			} );

			it( 'should not autolink inside code block', () => {
				const viewFragment = dataProcessor.toView( '	<http://example.com/>' );

				expect( stringify( viewFragment ) ).to.equal( '<pre><code><http://example.com/></code></pre>' );
			} );

			it( 'should not process already linked #1', () => {
				const viewFragment = dataProcessor.toView( 'Already linked: <a href="http://example.com/">http://example.com/</a>' );

				expect( stringify( viewFragment ) ).to.equal( '<p>Already linked: <a href="http://example.com/">http://example.com/</a></p>' );
			} );

			it( 'should not process already linked #2', () => {
				const viewFragment = dataProcessor.toView( 'Already linked: [http://example.com/](http://example.com/)' );

				expect( stringify( viewFragment ) ).to.equal( '<p>Already linked: <a href="http://example.com/">http://example.com/</a></p>' );
			} );

			it( 'should not process already linked #3', () => {
				const viewFragment = dataProcessor.toView( 'Already linked: <a href="http://example.com/">**http://example.com/**</a>' );

				expect( stringify( viewFragment ) ).to.equal(
					'<p>Already linked: <a href="http://example.com/"><strong>http://example.com/</strong></a></p>'
				);
			} );

			it( 'should process inline links', () => {
				const viewFragment = dataProcessor.toView( '[URL](/url/)' );

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="/url/">URL</a></p>' );
			} );

			it( 'should process inline links with title', () => {
				const viewFragment = dataProcessor.toView( '[URL and title](/url/ "title")' );

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="/url/" title="title">URL and title</a></p>' );
			} );

			it( 'should process inline links with title preceded by two spaces', () => {
				const viewFragment = dataProcessor.toView( '[URL and title](/url/  "title preceded by two spaces")' );

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="/url/" title="title preceded by two spaces">URL and title</a></p>' );
			} );

			it( 'should process inline links with title preceded by tab', () => {
				const viewFragment = dataProcessor.toView( '[URL and title](/url/	"title preceded by tab")' );

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="/url/" title="title preceded by tab">URL and title</a></p>' );
			} );

			it( 'should process inline links with title that has spaces afterwards', () => {
				const viewFragment = dataProcessor.toView( '[URL and title](/url/ "title has spaces afterward"  )' );

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="/url/" title="title has spaces afterward">URL and title</a></p>' );
			} );

			it( 'should process inline links with spaces in URL', () => {
				const viewFragment = dataProcessor.toView( '[URL and title]( /url/has space )' );

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="/url/has space">URL and title</a></p>' );
			} );

			it( 'should process inline links with titles and spaces in URL', () => {
				const viewFragment = dataProcessor.toView( '[URL and title]( /url/has space/ "url has space and title")' );

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="/url/has space/" title="url has space and title">URL and title</a></p>' );
			} );

			it( 'should process empty link', () => {
				const viewFragment = dataProcessor.toView( '[Empty]()' );

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="">Empty</a></p>' );
			} );

			it( 'should process reference links', () => {
				const viewFragment = dataProcessor.toView(
					'Foo [bar] [1].\n' +
					'[1]: /url/  "Title"'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>Foo <a href="/url/" title="Title">bar</a>.</p>' );
			} );

			it( 'should process reference links - without space', () => {
				const viewFragment = dataProcessor.toView(
					'Foo [bar][1].\n' +
					'[1]: /url/  "Title"'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>Foo <a href="/url/" title="Title">bar</a>.</p>' );
			} );

			it( 'should process reference links - with newline', () => {
				const viewFragment = dataProcessor.toView(
					'Foo [bar]\n[1].\n' +
					'[1]: /url/  "Title"'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>Foo <a href="/url/" title="Title">bar</a>.</p>' );
			} );

			it( 'should process reference links - with embedded brackets', () => {
				const viewFragment = dataProcessor.toView(
					'With [embedded [brackets]] [b].\n' +
					'[b]: /url/'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>With <a href="/url/">embedded [brackets]</a>.</p>' );
			} );

			it( 'should process reference links - with reference indented once', () => {
				const viewFragment = dataProcessor.toView(
					'Indented [once][].\n' +
					' [once]: /url'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>Indented <a href="/url">once</a>.</p>' );
			} );

			it( 'should process reference links - with reference indented twice', () => {
				const viewFragment = dataProcessor.toView(
					'Indented [twice][].\n' +
					'  [twice]: /url'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>Indented <a href="/url">twice</a>.</p>' );
			} );

			it( 'should process reference links - with reference indented trice', () => {
				const viewFragment = dataProcessor.toView(
					'Indented [trice][].\n' +
					'   [trice]: /url'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>Indented <a href="/url">trice</a>.</p>' );
			} );

			it( 'should NOT process reference links - with reference indented four times', () => {
				const viewFragment = dataProcessor.toView(
					'Indented [four][] times.\n' +
					'    [four]: /url'
				);

				// GitHub renders it as:
				// <p>Indented [four][] times.<br>[four]: /url</p>
				expect( stringify( viewFragment ) ).to.equal( '<p>Indented [four][] times.</p><pre><code>[four]: /url</code></pre>' );
			} );

			it( 'should process reference links when title and reference are same #1', () => {
				const viewFragment = dataProcessor.toView(
					'[this] [this]\n' +
					'[this]: foo'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="foo">this</a></p>' );
			} );

			it( 'should process reference links when title and reference are same #2', () => {
				const viewFragment = dataProcessor.toView(
					'[this][this]\n' +
					'[this]: foo'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="foo">this</a></p>' );
			} );

			it( 'should process reference links when only title is provided and is same as reference #1', () => {
				const viewFragment = dataProcessor.toView(
					'[this] []\n' +
					'[this]: foo'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="foo">this</a></p>' );
			} );

			it( 'should process reference links when only title is provided and is same as reference #2', () => {
				const viewFragment = dataProcessor.toView(
					'[this][]\n' +
					'[this]: foo'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="foo">this</a></p>' );
			} );

			it( 'should process reference links when only title is provided and is same as reference #3', () => {
				const viewFragment = dataProcessor.toView(
					'[this]\n' +
					'[this]: foo'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="foo">this</a></p>' );
			} );

			it( 'should not process reference links when reference is not found #1', () => {
				const viewFragment = dataProcessor.toView(
					'[this] []'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>[this] []</p>' );
			} );

			it( 'should not process reference links when reference is not found #2', () => {
				const viewFragment = dataProcessor.toView(
					'[this][]'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>[this][]</p>' );
			} );

			it( 'should not process reference links when reference is not found #2', () => {
				const viewFragment = dataProcessor.toView(
					'[this]'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>[this]</p>' );
			} );

			it( 'should process reference links nested in brackets #1', () => {
				const viewFragment = dataProcessor.toView(
					'[a reference inside [this][]]\n' +
					'[this]: foo'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>[a reference inside <a href="foo">this</a>]</p>' );
			} );

			it( 'should process reference links nested in brackets #2', () => {
				const viewFragment = dataProcessor.toView(
					'[a reference inside [this]]\n' +
					'[this]: foo'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>[a reference inside <a href="foo">this</a>]</p>' );
			} );

			it( 'should not process reference links when title is same as reference but reference is different', () => {
				const viewFragment = dataProcessor.toView(
					'[this](/something/else/)\n' +
					'[this]: foo'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p><a href="/something/else/">this</a></p>' );
			} );

			it( 'should not process reference links suppressed by backslashes', () => {
				const viewFragment = dataProcessor.toView(
					'Suppress \\[this] and [this\\].\n' +
					'[this]: foo'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>Suppress [this] and [this].</p>' );
			} );

			it( 'should process reference links when used across multiple lines #1', () => {
				const viewFragment = dataProcessor.toView(
					'This is [multiline\nreference]\n' +
					'[multiline reference]: foo'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>This is <a href="foo">multiline<br></br>reference</a></p>' );
			} );

			it( 'should process reference links when used across multiple lines #2', () => {
				const viewFragment = dataProcessor.toView(
					'This is [multiline \nreference]\n' +
					'[multiline reference]: foo'
				);

				expect( stringify( viewFragment ) ).to.equal( '<p>This is <a href="foo">multiline<br></br>reference</a></p>' );
			} );
		} );
	} );
} );
