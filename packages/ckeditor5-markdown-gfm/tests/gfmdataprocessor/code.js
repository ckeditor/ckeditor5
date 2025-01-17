/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testDataProcessor } from '../_utils/utils.js';

describe( 'GFMDataProcessor', () => {
	describe( 'code', () => {
		it( 'should process inline code', () => {
			testDataProcessor(
				'regular text and `inline code`',

				'<p>regular text and <code>inline code</code></p>'
			);
		} );

		it( 'should properly process multiple code', () => {
			testDataProcessor(
				'`this is code` and this is `too`',

				'<p><code>this is code</code> and this is <code>too</code></p>'
			);
		} );

		it( 'should process spaces inside inline code', () => {
			testDataProcessor(
				'regular text and` inline code`',

				'<p>regular text and<code> inline code</code></p>',

				// When converting back it will be normalized and spaces
				// at the beginning of inline code will be removed.
				'regular text and `inline code`'
			);
		} );

		it( 'should properly process backticks inside code spans #1', () => {
			testDataProcessor(
				'`` `backticks` ``',

				'<p><code>`backticks`</code></p>'
			);
		} );

		it( 'should properly process backticks inside code spans #2', () => {
			testDataProcessor(
				'``some `backticks` inside``',

				'<p><code>some `backticks` inside</code></p>'
			);
		} );

		it( 'should process code blocks indented with tabs', () => {
			testDataProcessor(
				'	code block',

				// GitHub is rendering as:
				// <pre><code>code block
				// </code></pre>
				'<pre><code>code block</code></pre>',

				// When converting back tabs are normalized to ```.
				'```\n' +
				'code block\n' +
				'```'
			);
		} );

		it( 'should process code blocks indented with spaces', () => {
			testDataProcessor(
				'    code block',

				// GitHub is rendering as:
				// <pre><code>code block
				// </code></pre>

				'<pre><code>code block</code></pre>',

				// When converting back tabs are normalized to ```.

				'```\n' +
				'code block\n' +
				'```'
			);
		} );

		it( 'should process multi line code blocks indented with tabs', () => {
			testDataProcessor(
				'	first line\n' +
				'	second line',

				// GitHub is rendering as:
				// <pre><code>first line
				// second line
				// </code></pre>

				'<pre><code>first line\n' +
				'second line</code></pre>',

				// When converting back tabs are normalized to ```.

				'```\n' +
				'first line\n' +
				'second line\n' +
				'```'
			);
		} );

		it( 'should process multi line code blocks indented with spaces', () => {
			testDataProcessor(
				'    first line\n' +
				'    second line',

				// GitHub is rendering as:
				// <pre><code>first line
				// second line
				// </code></pre>

				'<pre><code>first line\n' +
				'second line</code></pre>',

				// When converting back spaces are normalized to ```.

				'```\n' +
				'first line\n' +
				'second line\n' +
				'```'
			);
		} );

		it( 'should process multi line code blocks with trailing spaces', () => {
			testDataProcessor(
				'	the lines in this block  \n' +
				'	all contain trailing spaces  ',

				// GitHub is rendering as:
				// <pre><code>the lines in this block
				// all contain trailing spaces
				// </code></pre>

				'<pre><code>the lines in this block  \n' +
				'all contain trailing spaces  </code></pre>',

				// When converting back tabs are normalized to ```, while the test function remove trailing spaces.
				'```\n' +
				'the lines in this block\n' +
				'all contain trailing spaces\n' +
				'```'
			);
		} );

		it( 'should process code block with language name', () => {
			testDataProcessor(
				'```js\n' +
				'var a = \'hello\';\n' +
				'console.log(a + \' world\');\n' +
				'```',

				// GitHub is rendering as special html with syntax highlighting.
				// We will need to handle this separately by some feature.

				'<pre><code class="language-js">var a = \'hello\';\n' +
				'console.log(a + \' world\');</code></pre>'
			);
		} );

		it( 'should process code block with language name and using ~~~ as delimiter', () => {
			testDataProcessor(
				'~~~ bash\n' +
				'#!/bin/bash\n' +
				'~~~',

				// GitHub is rendering as special html with syntax highlighting.
				// We will need to handle this separately by some feature.

				'<pre><code class="language-bash">#!/bin/bash</code></pre>',

				// When converting back ~~~ are normalized to ```.

				'```bash\n' +
				'#!/bin/bash\n' +
				'```'
			);
		} );

		it( 'should process code block with language name and using ``````` as delimiter', () => {
			testDataProcessor(
				'```````js\n' +
				'var a = \'hello\';\n' +
				'console.log(a + \' world\');\n' +
				'```````',

				// GitHub is rendering as special html with syntax highlighting.
				// We will need to handle this separately by some feature.

				'<pre><code class="language-js">var a = \'hello\';\n' +
				'console.log(a + \' world\');</code></pre>',

				// When converting back ``````` are normalized to ```.

				'```js\n' +
				'var a = \'hello\';\n' +
				'console.log(a + \' world\');\n' +
				'```'
			);
		} );

		it( 'should process code block with language name and using ~~~~~~~~~~ as delimiter', () => {
			testDataProcessor(
				'~~~~~~~~~~ js\n' +
				'var a = \'hello\';\n' +
				'console.log(a + \' world\');\n' +
				'~~~~~~~~~~',

				// GitHub is rendering as special html with syntax highlighting.
				// We will need to handle this separately by some feature.

				'<pre><code class="language-js">var a = \'hello\';\n' +
				'console.log(a + \' world\');</code></pre>',

				// When converting back ~~~~~~~~~~ are normalized to ```.

				'```js\n' +
				'var a = \'hello\';\n' +
				'console.log(a + \' world\');\n' +
				'```'
			);
		} );

		it( 'should process empty code block', () => {
			testDataProcessor(
				'```js\n' +
				'```',

				// GitHub is rendering as special html with syntax highlighting.
				// We will need to handle this separately by some feature.

				'<pre><code class="language-js"></code></pre>',

				// When converting back, empty code blocks will be removed.
				// This might be an issue when switching from source to editor
				// but changing this cannot be done in to-markdown converters.
				''
			);
		} );

		it( 'should process code block with empty line', () => {
			testDataProcessor(
				'```js\n' +
				'\n' +
				'```',

				// GitHub is rendering as special html with syntax highlighting.
				// We will need to handle this separately by some feature.

				'<pre><code class="language-js"></code></pre>',

				// When converting back, empty code blocks will be removed.
				// This might be an issue when switching from source to editor
				// but changing this cannot be done in to-markdown converters.
				''
			);
		} );

		it( 'should process nested code', () => {
			testDataProcessor(
				'````` code `` code ``` `````',

				// GitHub is rendering as:
				// <p><code>code `` code ```</code></p>

				'<p><code>code `` code ```</code></p>',

				// When converting back ````` will be normalized to ``.
				'` code `` code ``` `'
			);
		} );

		it( 'should handle triple ticks inside code', () => {
			testDataProcessor(
				'````\n' +
				'```\n' +
				'Code\n' +
				'```\n' +
				'````',

				'<pre><code>' +
				'```\n' +
				'Code\n' +
				'```' +
				'</code></pre>'
			);
		} );

		it( 'should handle triple and quatruple ticks inside code', () => {
			testDataProcessor(
				'`````\n' +
				'````\n' +
				'```\n' +
				'Code\n' +
				'```\n' +
				'````\n' +
				'`````',

				'<pre><code>' +
				'````\n' +
				'```\n' +
				'Code\n' +
				'```\n' +
				'````' +
				'</code></pre>'
			);
		} );

		it( 'should support #registerRawContentMatcher()', () => {
			const viewFragment = testDataProcessor(
				[
					'```raw',
					'var a = \'hello\';',
					'console.log(a + \' world\');',
					'```'
				].join( '\n' ),

				'<pre><code class="language-raw"></code></pre>',

				'',

				{
					setup( processor ) {
						processor.registerRawContentMatcher( {
							name: 'code',
							classes: 'language-raw'
						} );
					}
				}
			);

			expect( viewFragment.getChild( 0 ).getChild( 0 ).getCustomProperty( '$rawContent' ) ).to.equal(
				[
					'var a = \'hello\';',
					'console.log(a + \' world\');'
				].join( '\n' )
			);
		} );
	} );
} );
