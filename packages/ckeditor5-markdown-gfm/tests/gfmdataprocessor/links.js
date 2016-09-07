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
		} );
	} );
} );
