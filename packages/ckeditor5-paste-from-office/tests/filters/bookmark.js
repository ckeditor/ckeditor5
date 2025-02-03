/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import transformBookmarks from '../../src/filters/bookmark.js';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter.js';
import Document from '@ckeditor/ckeditor5-engine/src/view/document.js';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap.js';

describe( 'PasteFromOffice - filters - bookmark', () => {
	let writer, viewDocument;
	const htmlDataProcessor = new HtmlDataProcessor( new Document( new StylesProcessor() ) );

	before( () => {
		viewDocument = new Document();
		writer = new UpcastWriter( viewDocument );
	} );

	it( 'should move the text from the <a> element and place it right after', () => {
		performTest(
			'<a name="foo">' +
				'<span>text</span>' +
			'</a>',

			'<a name="foo"></a>' +
			'<span>text</span>'
		);
	} );

	it( 'should not move the text from the <a> element if it has `href`', () => {
		performTest(
			'<a name="foo" href="bar">' +
				'<span>text</span>' +
			'</a>',

			'<a name="foo" href="bar">' +
				'<span>text</span>' +
			'</a>'
		);
	} );

	it( 'should move the text from the <a> element and place it right after, when followed by another text', () => {
		performTest(
			'<a name="foo">' +
				'<span>text</span>' +
			'</a>' +
			'<span>more text</span>',

			'<a name="foo"></a>' +
			'<span>text</span>' +
			'<span>more text</span>'
		);
	} );

	it( 'should move the formatted text from the <a> element and place it right after', () => {
		performTest(
			'<a name="foo">' +
				'text' +
				'<strong>bold</strong>' +
			'</a>',

			'<a name="foo"></a>' +
			'text' +
			'<strong>bold</strong>'
		);
	} );

	it( 'should move the text from each <a> element and place it right after', () => {
		performTest(
			'<a name="foo">' +
				'<span>first</span>' +
			'</a>' +
			'<a name="bar">' +
				'<span>second</span>' +
			'</a>',

			'<a name="foo"></a>' +
			'<span>first</span>' +
			'<a name="bar"></a>' +
			'<span>second</span>'
		);
	} );

	it( 'should move the text from the <a> element and place it right after in content of block elements', () => {
		performTest(
			'<h2>header 2</h2>' +
			'<a name="foo">' +
				'<span>first</span>' +
			'</a>' +
			'<p>paragraph</p>',

			'<h2>header 2</h2>' +
			'<a name="foo"></a>' +
			'<span>first</span>' +
			'<p>paragraph</p>'
		);
	} );

	it( 'should move the text from the <a> element and place it right after, between paragraphs wrapped with block quote', () => {
		performTest(
			'<blockquote>' +
				'<p>paragraph 1</p>' +
				'<a name="foo">' +
					'<span>first</span>' +
				'</a>' +
				'<p>paragraph 2</p>' +
			'</blockquote>',

			'<blockquote>' +
				'<p>paragraph 1</p>' +
				'<a name="foo"></a>' +
				'<span>first</span>' +
				'<p>paragraph 2</p>' +
			'</blockquote>'
		);
	} );

	it( 'should move the <img> from the <a> element and place it right after', () => {
		performTest(
			'<a name="foo">' +
				'<img src="bar">' +
			'</a>',

			'<a name="foo"></a>' +
			'<img src="bar">'
		);
	} );

	it( 'should move the <img> and text from the <a> element and place it right after', () => {
		performTest(
			'<a name="foo">' +
				'text before <img src="bar"> text after' +
			'</a>',

			'<a name="foo"></a>' +
			'text before ' +
			'<img src="bar"> ' +
			'text after'
		);
	} );

	it( 'should move the text from the <a> element and place it right after, when in a first table cell', () => {
		performTest(
			'<table>' +
				'<tbody>' +
					'<tr>' +
						'<td>' +
							'<a name="foo">' +
								'<span>text</span>' +
							'</a>' +
						'</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>',

			'<table>' +
				'<tbody>' +
					'<tr>' +
						'<td>' +
							'<a name="foo"></a>' +
							'<span>text</span>' +
						'</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>'
		);
	} );

	it( 'should move the text from the <a> element and place it right after, when in a second table cell', () => {
		performTest(
			'<table>' +
				'<tbody>' +
					'<tr>' +
						'<td>' +
							'first cell' +
						'</td>' +
						'<td>' +
							'<a name="foo">' +
								'<span>text</span>' +
							'</a>' +
						'</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>',

			'<table>' +
				'<tbody>' +
					'<tr>' +
						'<td>' +
							'first cell' +
						'</td>' +
						'<td>' +
							'<a name="foo"></a>' +
							'<span>text</span>' +
						'</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>'
		);
	} );

	it( 'should move the text from the <a> element and place it right after, when `id` is used instead of `name`', () => {
		performTest(
			'<a id="foo">' +
				'<span>text</span>' +
			'</a>',

			'<a id="foo"></a>' +
			'<span>text</span>'
		);
	} );

	it( 'should move the text from the <a> element and place it right after, when both: `id` and `name` are present', () => {
		performTest(
			'<a id="foo" name="bar">' +
				'<span>text</span>' +
			'</a>',

			'<a id="foo" name="bar"></a>' +
			'<span>text</span>'
		);
	} );

	function performTest( inputData, expectedData ) {
		const documentFragment = htmlDataProcessor.toView( inputData );

		transformBookmarks( documentFragment, writer );

		expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( expectedData );
	}
} );
