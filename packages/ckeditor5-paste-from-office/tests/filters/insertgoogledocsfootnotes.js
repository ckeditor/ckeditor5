/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { HtmlDataProcessor, ViewUpcastWriter, ViewDocument, StylesProcessor } from '@ckeditor/ckeditor5-engine';
import { insertGoogleDocsFootnotes } from '../../src/filters/insertgoogledocsfootnotes.js';

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new ViewDocument( new StylesProcessor() ) );

	describe( 'insertGoogleDocsFootnotes', () => {
		let writer, viewDocument;

		before( () => {
			viewDocument = new ViewDocument();
			writer = new ViewUpcastWriter( viewDocument );
		} );

		it( 'should transform single Google Docs footnote', () => {
			const inputData = '<p>Hello World text.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Hello World text.#',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{ fs_id: 'footnote1' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: 'Test footnote content'
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>' +
					'Hello World text.' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-1" href="#gdocs-footnote-1"></a>' +
					'</sup>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="gdocs-footnote-1">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-1">^</a>' +
						'<div class="footnote-content">Test footnote content</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should transform multiple Google Docs footnotes', () => {
			const inputData = '<p>First text. Second text.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'First text.# Second text.#',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{ fs_id: 'footnote1' },
							{ fs_id: 'footnote2' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: 'First footnote content'
					},
					footnote2: {
						dsl_spacers: 'Second footnote content'
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>' +
					'First text.' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-1" href="#gdocs-footnote-1"></a>' +
					'</sup>' +
					' Second text.' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-2" href="#gdocs-footnote-2"></a>' +
					'</sup>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="gdocs-footnote-2">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-2">^</a>' +
						'<div class="footnote-content">Second footnote content</div>' +
					'</li>' +
					'<li class="footnote-definition" id="gdocs-footnote-1">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-1">^</a>' +
						'<div class="footnote-content">First footnote content</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should handle footnotes at the end of block elements', () => {
			const inputData = '<p>Paragraph text.</p><p>Second paragraph.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Paragraph text.#\nSecond paragraph.',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{ fs_id: 'footnote1' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: 'End of paragraph footnote'
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>' +
					'Paragraph text.' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-1" href="#gdocs-footnote-1"></a>' +
					'</sup>' +
				'</p>' +
				'<p>Second paragraph.</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="gdocs-footnote-1">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-1">^</a>' +
						'<div class="footnote-content">End of paragraph footnote</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should handle multiple footnotes at document end', () => {
			const inputData = '<p>Document text.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Document text.##',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{ fs_id: 'footnote1' },
							{ fs_id: 'footnote2' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: 'First end footnote'
					},
					footnote2: {
						dsl_spacers: 'Second end footnote'
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>' +
					'Document text.' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-1" href="#gdocs-footnote-1"></a>' +
					'</sup>' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-2" href="#gdocs-footnote-2"></a>' +
					'</sup>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="gdocs-footnote-2">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-2">^</a>' +
						'<div class="footnote-content">Second end footnote</div>' +
					'</li>' +
					'<li class="footnote-definition" id="gdocs-footnote-1">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-1">^</a>' +
						'<div class="footnote-content">First end footnote</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should handle footnotes with whitespace in template', () => {
			const inputData = '<p>Hello   World text.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Hello   World text.#',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{ fs_id: 'footnote1' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: 'Whitespace test footnote'
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>' +
					'Hello World text.' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-1" href="#gdocs-footnote-1"></a>' +
					'</sup>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="gdocs-footnote-1">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-1">^</a>' +
						'<div class="footnote-content">Whitespace test footnote</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should handle footnotes with empty content', () => {
			const inputData = '<p>Text with empty footnote.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Text with empty footnote.#',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{ fs_id: 'footnote1' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: ''
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>' +
					'Text with empty footnote.' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-1" href="#gdocs-footnote-1"></a>' +
					'</sup>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="gdocs-footnote-1">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-1">^</a>' +
						'<div class="footnote-content"></div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should handle footnotes with leading escaped characters', () => {
			const inputData = '<p>Text with escaped footnote.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Text with escaped footnote.#',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{ fs_id: 'footnote1' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: '\u0003Escaped footnote content'
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>' +
					'Text with escaped footnote.' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-1" href="#gdocs-footnote-1"></a>' +
					'</sup>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="gdocs-footnote-1">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-1">^</a>' +
						'<div class="footnote-content">Escaped footnote content</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should not process when no # markers in dsl_spacers', () => {
			const inputData = '<p>Simple text without footnotes.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Simple text without footnotes.',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{ fs_id: 'footnote1' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: 'Unused footnote content'
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>Simple text without footnotes.</p>'
			);
		} );

		it( 'should not process when no footnote styleslice present', () => {
			const inputData = '<p>Text with # marker.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Text with # marker.',
				dsl_styleslices: [
					{
						stsl_type: 'other',
						stsl_styles: []
					}
				],
				dsl_relateddocslices: {}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>Text with # marker.</p>'
			);
		} );

		it( 'should not process when footnote styleslice has no styles', () => {
			const inputData = '<p>Text with # marker.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Text with # marker.',
				dsl_styleslices: [
					{
						stsl_type: 'footnote'
					}
				],
				dsl_relateddocslices: {}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>Text with # marker.</p>'
			);
		} );

		it( 'should handle missing footnote definitions', () => {
			const inputData = '<p>Text with footnote.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Text with footnote.#',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{ fs_id: 'footnote1' }
						]
					}
				],
				dsl_relateddocslices: {}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>Text with footnote.</p>'
			);
		} );

		it( 'should handle styles with null values', () => {
			const inputData = '<p>Text with footnote.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Text with footnote.#',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							null,
							{ fs_id: 'footnote1' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: 'Valid footnote content'
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>' +
					'Text with footnote.' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-1" href="#gdocs-footnote-1"></a>' +
					'</sup>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="gdocs-footnote-1">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-1">^</a>' +
						'<div class="footnote-content">Valid footnote content</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should handle styles without fs_id property', () => {
			const inputData = '<p>Text with footnote.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Text with footnote.##',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{},
							{ fs_id: 'footnote1' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: 'Valid footnote content'
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>' +
					'Text with footnote.' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-1" href="#gdocs-footnote-1"></a>' +
					'</sup>' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-2" href="#gdocs-footnote-2"></a>' +
					'</sup>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="gdocs-footnote-2">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-2">^</a>' +
						'<div class="footnote-content"></div>' +
					'</li>' +
					'<li class="footnote-definition" id="gdocs-footnote-1">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-1">^</a>' +
						'<div class="footnote-content">Valid footnote content</div>' +
					'</li>' +
				'</ol>'
			);
		} );

		it( 'should handle actual # characters in content that do not represent footnotes', () => {
			const inputData = '<p>Use # as hashtag symbol.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Use # as hashtag symbol.',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{ fs_id: 'footnote1' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: 'Unused footnote content'
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>Use # as hashtag symbol.</p>'
			);
		} );

		it( 'should handle template/content misalignment gracefully', () => {
			const inputData = '<p>Different content length.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'Mismatched template length.#',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{ fs_id: 'footnote1' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: 'Footnote content'
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			// Should not break, but may not insert footnotes due to misalignment
			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>Different content length.</p>'
			);
		} );

		it( 'should handle complex document with multiple paragraphs and footnotes', () => {
			const inputData = '<p>First paragraph with text.</p><p>Second paragraph with more text.</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			const slice = {
				dsl_spacers: 'First paragraph# with text.\nSecond paragraph with more text.#',
				dsl_styleslices: [
					{
						stsl_type: 'footnote',
						stsl_styles: [
							{ fs_id: 'footnote1' },
							{ fs_id: 'footnote2' }
						]
					}
				],
				dsl_relateddocslices: {
					footnote1: {
						dsl_spacers: 'First footnote content'
					},
					footnote2: {
						dsl_spacers: 'Second footnote content'
					}
				}
			};

			insertGoogleDocsFootnotes( documentFragment, writer, slice );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<p>' +
					'First paragraph' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-1" href="#gdocs-footnote-1"></a>' +
					'</sup>' +
					' with text.' +
				'</p>' +
				'<p>' +
					'Second paragraph with more text.' +
					'<sup class="footnote">' +
						'<a id="ref-gdocs-footnote-2" href="#gdocs-footnote-2"></a>' +
					'</sup>' +
				'</p>' +
				'<ol class="footnotes">' +
					'<li class="footnote-definition" id="gdocs-footnote-2">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-2">^</a>' +
						'<div class="footnote-content">Second footnote content</div>' +
					'</li>' +
					'<li class="footnote-definition" id="gdocs-footnote-1">' +
						'<a class="footnote-backlink" href="#ref-gdocs-footnote-1">^</a>' +
						'<div class="footnote-content">First footnote content</div>' +
					'</li>' +
				'</ol>'
			);
		} );
	} );
} );
