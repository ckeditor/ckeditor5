/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testDataProcessor } from '../_utils/utils.js';

describe( 'GFMDataProcessor', () => {
	describe( 'tabs', () => {
		it( 'should process list item with tabs', () => {
			testDataProcessor(
				'+	this is a list item indented with tabs',

				// GitHub will render it as (notice two spaces at the beginning of the list item):
				// <ul>
				// <li>  this is a list item indented with tabs</li>
				// </ul>
				'<ul>' +
				'<li>this is a list item indented with tabs</li>' +
				'</ul>',

				// After converting back list will be normalized to *.
				'*   this is a list item indented with tabs'
			);
		} );

		it( 'should process list item with spaces', () => {
			testDataProcessor(
				'+   this is a list item indented with spaces',

				// GitHub will render it as (notice two spaces at the beginning of the list item):
				// <ul>
				// <li>  this is a list item indented with spaces</li>
				// </ul>
				'<ul>' +
				'<li>this is a list item indented with spaces</li>' +
				'</ul>',

				// After converting back list will be normalized to *.
				'*   this is a list item indented with spaces'
			);
		} );

		it( 'should process code block indented by tab', () => {
			testDataProcessor(
				'	this code block is indented by one tab',

				'<pre><code>this code block is indented by one tab</code></pre>',

				// After converting back code block will be normalized to ``` representation.
				'```\n' +
				'this code block is indented by one tab\n' +
				'```'
			);
		} );

		it( 'should process code block indented by two tabs', () => {
			testDataProcessor(
				'		this code block is indented by two tabs',

				'<pre><code>    this code block is indented by two tabs</code></pre>',

				// After converting back code block will be normalized to ``` representation.
				'```\n' +
				'    this code block is indented by two tabs\n' +
				'```'
			);
		} );

		it( 'should process list items indented with tabs as code block', () => {
			testDataProcessor(
				'	+	list item\n' +
				'	next line',

				'<pre><code>+    list item\n' +
				'next line</code></pre>',

				// After converting back code block will be normalized to ``` representation.
				'```\n' +
				'+    list item\n' +
				'next line\n' +
				'```'
			);
		} );
	} );
} );
