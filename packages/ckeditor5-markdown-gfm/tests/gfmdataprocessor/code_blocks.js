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

	describe( 'code blocks', () => {
		describe( 'toView', () => {
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
		} );
	} );
} );
