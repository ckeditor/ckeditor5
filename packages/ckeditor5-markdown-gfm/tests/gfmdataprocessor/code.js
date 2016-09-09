/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import MarkdownDataProcessor from '/ckeditor5/markdown-gfm/gfmdataprocessor.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'GFMDataProcessor', () => {
	let dataProcessor;

	beforeEach( () => {
		dataProcessor = new MarkdownDataProcessor();
	} );

	describe( 'code', () => {
		describe( 'toView', () => {
			it( 'should process inline code', () => {
				const viewFragment = dataProcessor.toView( 'regular text and `inline code`' );

				expect( stringify( viewFragment ) ).to.equal( '<p>regular text and <code>inline code</code></p>' );
			} );

			it( 'should properly process backticks when combined', () => {
				const viewFragment = dataProcessor.toView( '`<fake a="` content of attribute `">`' );

				expect( stringify( viewFragment ) ).to.equal( '<p><code><fake a="</code> content of attribute <code>"></code></p>' );
			} );

			it( 'should properly process backticks inside code spans', () => {
				const viewFragment = dataProcessor.toView( '`` `backticks` ``' );

				// This should be checked - why there is a space after `bacticks`.
				expect( stringify( viewFragment ) ).to.equal( '<p><code>`backticks` </code></p>' );
			} );

			it( 'should process code blocks indented with tabs', () => {
				const viewFragment = dataProcessor.toView( '	code block' );

				expect( stringify( viewFragment ) ).to.equal( '<pre><code>code block</code></pre>' );
			} );

			it( 'should process code blocks indented with spaces', () => {
				const viewFragment = dataProcessor.toView( '    code block' );

				expect( stringify( viewFragment ) ).to.equal( '<pre><code>code block</code></pre>' );
			} );

			it( 'should process multi line code blocks indented with tabs', () => {
				const viewFragment = dataProcessor.toView( '	first line\n	second line' );

				expect( stringify( viewFragment ) ).to.equal( '<pre><code>first line\nsecond line</code></pre>' );
			} );

			it( 'should process multi line code blocks indented with spaces', () => {
				const viewFragment = dataProcessor.toView( '    first line\n    second line' );

				expect( stringify( viewFragment ) ).to.equal( '<pre><code>first line\nsecond line</code></pre>' );
			} );

			it( 'should process multi line code blocks with trailing spaces', () => {
				const viewFragment = dataProcessor.toView( '	the lines in this block  \n	all contain trailing spaces  ' );

				expect( stringify( viewFragment ) ).to.equal( '<pre><code>the lines in this block  \nall contain trailing spaces  </code></pre>' );
			} );

			it( 'should process code block with language name', () => {
				const viewFragment = dataProcessor.toView(
					'``` js\n' +
					'var a = \'hello\';\n' +
					'console.log(a + \' world\');\n' +
					'```'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<pre>' +
						'<code class="lang-js">' +
							'var a = \'hello\';\n' +
							'console.log(a + \' world\');' +
						'</code>' +
					'</pre>' );
			} );

			it( 'should process code block with language name and using ~~~ as delimiter', () => {
				const viewFragment = dataProcessor.toView(
					'~~~ bash\n' +
					'var a = \'hello\';\n' +
					'console.log(a + \' world\');\n' +
					'~~~'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<pre>' +
					'<code class="lang-bash">' +
					'var a = \'hello\';\n' +
					'console.log(a + \' world\');' +
					'</code>' +
					'</pre>' );
			} );

			it( 'should process code block with language name and using ``````` as delimiter', () => {
				const viewFragment = dataProcessor.toView(
					'``````` js\n' +
					'var a = \'hello\';\n' +
					'console.log(a + \' world\');\n' +
					'```````'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<pre>' +
					'<code class="lang-js">' +
					'var a = \'hello\';\n' +
					'console.log(a + \' world\');' +
					'</code>' +
					'</pre>' );
			} );

			it( 'should process code block with language name and using ~~~~~~~~~~ as delimiter', () => {
				const viewFragment = dataProcessor.toView(
					'~~~~~~~~~~ js\n' +
					'var a = \'hello\';\n' +
					'console.log(a + \' world\');\n' +
					'~~~~~~~~~~'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<pre>' +
					'<code class="lang-js">' +
					'var a = \'hello\';\n' +
					'console.log(a + \' world\');' +
					'</code>' +
					'</pre>' );
			} );

			it( 'should process empty code block', () => {
				const viewFragment = dataProcessor.toView(
					'``` js\n' +
					'```'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<pre>' +
						'<code class="lang-js">' +
						'</code>' +
					'</pre>' );
			} );

			it( 'should process code block with empty line', () => {
				const viewFragment = dataProcessor.toView(
					'``` js\n\n' +
					'```'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<pre>' +
					'<code class="lang-js">' +
					'</code>' +
					'</pre>'
				);
			} );

			it( 'should process nested code', () => {
				const viewFragment = dataProcessor.toView(
					'````` code `` code ``` `````'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<p><code>code `` code ``` </code></p>'
				);
			} );
		} );

		describe( 'toData', () => {
			it( 'should process inline code', () => {
				const viewFragment = parse( '<p>regular text and <code>inline code</code></p>' );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( 'regular text and `inline code`' );
			} );

			it( 'should properly process code blocks', () => {
				const viewFragment = parse( '<pre><code>code block</code></pre>' );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( '```\ncode block\n```' );
			} );

			it( 'should process code block with language name', () => {
				const viewFragment = parse( '<pre><code class="lang-js">code block</code></pre>' );

				expect( dataProcessor.toData( viewFragment ) ).to.equal(
					'``` js\n' +
					'code block\n' +
					'```'
				);
			} );
		} );
	} );
} );
