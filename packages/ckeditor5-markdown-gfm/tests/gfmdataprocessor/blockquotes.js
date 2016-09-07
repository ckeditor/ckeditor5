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

	describe( 'blockquotes', () => {
		describe( 'toView', () => {
			it( 'should process single blockquotes', () => {
				const viewFragment = dataProcessor.toView( '> foo bar' );

				expect( stringify( viewFragment ) ).to.equal( '<blockquote><p>foo bar</p></blockquote>' );
			} );

			it( 'should process nested blockquotes', () => {
				const viewFragment = dataProcessor.toView( '> foo\n>\n> > bar\n>\n> foo\n' );

				expect( stringify( viewFragment ) ).to.equal( '<blockquote><p>foo</p><blockquote><p>bar</p></blockquote><p>foo</p></blockquote>' );
			} );

			it( 'should process list within a blockquote', () => {
				const viewFragment = dataProcessor.toView(
					'> A list within a blockquote:\n' +
					'> \n' +
					'> *	asterisk 1\n' +
					'> *	asterisk 2\n' +
					'> *	asterisk 3\n'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<blockquote>' +
						'<p>A list within a blockquote:</p>' +
						'<ul>' +
							'<li>asterisk 1</li>' +
							'<li>asterisk 2</li>' +
							'<li>asterisk 3</li>' +
						'</ul>' +
					'</blockquote>'
				);
			} );

			it( 'should process blockquotes with code inside', () => {
				const viewFragment = dataProcessor.toView(
					'> Example 1:\n' +
					'>\n' +
					'>     sub status {\n' +
					'>         print "working";\n' +
					'>     }\n' +
					'>\n' +
					'> Example 2:\n' +
					'>\n' +
					'>     sub status {\n' +
					'>         return "working";\n' +
					'>     }\n'
				);

				expect( stringify( viewFragment ) ).to.equal(
					'<blockquote>' +
						'<p>Example 1:</p>' +
						'<pre>' +
							'<code>' +
								'sub status {\n' +
								'    print "working";\n' +
								'}' +
							'</code>' +
						'</pre>' +
						'<p>Example 2:</p>' +
						'<pre>' +
							'<code>' +
								'sub status {\n' +
								'    return "working";\n' +
								'}' +
							'</code>' +
						'</pre>' +
					'</blockquote>'
				);
			} );
		} );
	} );
} );
