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

	describe( 'tabs', () => {
		describe( 'toView', () => {
			it( 'should process list item with tabs', () => {
				const viewFragment = dataProcessor.toView( '+	this is a list item indented with tabs' );

				expect( stringify( viewFragment ) ).to.equal( '<ul><li>this is a list item indented with tabs</li></ul>' );
			} );

			it( 'should process list item with spaces', () => {
				const viewFragment = dataProcessor.toView( '+   this is a list item indented with spaces' );

				expect( stringify( viewFragment ) ).to.equal( '<ul><li>this is a list item indented with spaces</li></ul>' );
			} );

			it( 'should process code block indented by tab', () => {
				const viewFragment = dataProcessor.toView( '	this code block is indented by one tab' );

				expect( stringify( viewFragment ) ).to.equal( '<pre><code>this code block is indented by one tab</code></pre>' );
			} );

			it( 'should process code block indented by two tabs', () => {
				const viewFragment = dataProcessor.toView( '		this code block is indented by two tabs' );

				expect( stringify( viewFragment ) ).to.equal( '<pre><code>    this code block is indented by two tabs</code></pre>' );
			} );

			it( 'should process list items indented with tabs - code block', () => {
				const viewFragment = dataProcessor.toView( '	+	list item\n		next line' );

				expect( stringify( viewFragment ) ).to.equal( '<pre><code>+    list item\n    next line</code></pre>' );
			} );
		} );
	} );
} );
