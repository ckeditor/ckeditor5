/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { testDataProcessor as test } from '../../tests/_utils/utils';

describe( 'GFMDataProcessor', () => {
	describe( 'code', () => {
		it( 'should process inline code', () => {
			test(
				'regular text and `inline code`',

				'<p>regular text and <code>inline code</code></p>'
			);
		} );

		it( 'should properly process multiple code', () => {
			test(
				'`this is code` and this is `too`',

				'<p><code>this is code</code> and this is <code>too</code></p>'
			);
		} );

		it( 'should process spaces inside inline code', () => {
			test(
				'regular text and` inline code`',

				'<p>regular text and<code>inline code</code></p>',

				// When converting back it will be normalized and spaces
				// at the beginning of inline code will be removed.
				'regular text and`inline code`'
			);
		} );

		it( 'should properly process backticks inside code spans #1', () => {
			test(
				'`` `backticks` ``',

				'<p><code>`backticks`</code></p>'
			);
		} );

		it( 'should properly process backticks inside code spans #2', () => {
			test(
				'`` some `backticks` inside ``',

				'<p><code>some `backticks` inside</code></p>'
			);
		} );

		it( 'should process code blocks indented with tabs', () => {
			test(
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
			test(
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
			test(
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
			test(
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
			test(
				'	the lines in this block  \n' +
				'	all contain trailing spaces  ',

				// GitHub is rendering as:
				// <pre><code>the lines in this block
				// all contain trailing spaces
				// </code></pre>

				'<pre><code>the lines in this block  \n' +
				'all contain trailing spaces  </code></pre>',

				// When converting back tabs are normalized to ```.
				'```\n' +
				'the lines in this block  \n' +
				'all contain trailing spaces  \n' +
				'```'
			);
		} );

		it( 'should process code block with language name', () => {
			test(
				'``` js\n' +
				'var a = \'hello\';\n' +
				'console.log(a + \' world\');\n' +
				'```',

				// GitHub is rendering as special html with syntax highlighting.
				// We will need to handle this separately by some feature.

				'<pre><code class="lang-js">var a = \'hello\';\n' +
				'console.log(a + \' world\');</code></pre>'
			);
		} );

		it( 'should process code block with language name and using ~~~ as delimiter', () => {
			test(
				'~~~ bash\n' +
				'#!/bin/bash\n' +
				'~~~',

				// GitHub is rendering as special html with syntax highlighting.
				// We will need to handle this separately by some feature.

				'<pre><code class="lang-bash">#!/bin/bash</code></pre>',

				// When converting back ~~~ are normalized to ```.

				'``` bash\n' +
				'#!/bin/bash\n' +
				'```'
			);
		} );

		it( 'should process code block with language name and using ``````` as delimiter', () => {
			test(
				'``````` js\n' +
				'var a = \'hello\';\n' +
				'console.log(a + \' world\');\n' +
				'```````',

				// GitHub is rendering as special html with syntax highlighting.
				// We will need to handle this separately by some feature.

				'<pre><code class="lang-js">var a = \'hello\';\n' +
				'console.log(a + \' world\');</code></pre>',

				// When converting back ``````` are normalized to ```.

				'``` js\n' +
				'var a = \'hello\';\n' +
				'console.log(a + \' world\');\n' +
				'```'
			);
		} );

		it( 'should process code block with language name and using ~~~~~~~~~~ as delimiter', () => {
			test(
				'~~~~~~~~~~ js\n' +
				'var a = \'hello\';\n' +
				'console.log(a + \' world\');\n' +
				'~~~~~~~~~~',

				// GitHub is rendering as special html with syntax highlighting.
				// We will need to handle this separately by some feature.

				'<pre><code class="lang-js">var a = \'hello\';\n' +
				'console.log(a + \' world\');</code></pre>',

				// When converting back ~~~~~~~~~~ are normalized to ```.

				'``` js\n' +
				'var a = \'hello\';\n' +
				'console.log(a + \' world\');\n' +
				'```'
			);
		} );

		it( 'should process empty code block', () => {
			test(
				'``` js\n' +
				'```',

				// GitHub is rendering as special html with syntax highlighting.
				// We will need to handle this separately by some feature.

				'<pre><code class="lang-js"></code></pre>',

				// When converting back, empty code blocks will be removed.
				// This might be an issue when switching from source to editor
				// but changing this cannot be done in to-markdown converters.
				''
			);
		} );

		it( 'should process code block with empty line', () => {
			test(
				'``` js\n' +
				'\n' +
				'```',

				// GitHub is rendering as special html with syntax highlighting.
				// We will need to handle this separately by some feature.

				'<pre><code class="lang-js"></code></pre>',

				// When converting back, empty code blocks will be removed.
				// This might be an issue when switching from source to editor
				// but changing this cannot be done in to-markdown converters.
				''
			);
		} );

		it( 'should process nested code', () => {
			test(
				'````` code `` code ``` `````',

				// GitHub is rendering as:
				// <p><code>code `` code ```</code></p>

				'<p><code>code `` code ```</code></p>',

				// When converting back ````` will be normalized to ``.
				'`` code `` code ``` ``'
			);
		} );
	} );
} );
