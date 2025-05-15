/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import transformBlockBrsToParagraphs from '../../src/filters/br.js';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter.js';
import Document from '@ckeditor/ckeditor5-engine/src/view/document.js';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap.js';

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new Document( new StylesProcessor() ) );

	describe( 'transformBlockBrsToParagraphs', () => {
		let writer, viewDocument;

		before( () => {
			viewDocument = new Document();
			writer = new UpcastWriter( viewDocument );
		} );

		it( 'should replace a single br element before a paragraph', () => {
			const inputData = '<br><p>foo</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<p></p><p>foo</p>' );
		} );

		it( 'should replace multiple br elements before a paragraph', () => {
			const inputData = '<br><br><p>foo</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<p></p><p></p><p>foo</p>' );
		} );

		it( 'should replace a single br element after a paragraph', () => {
			const inputData = '<p>foo</p><br>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<p>foo</p><p></p>' );
		} );

		it( 'should replace multiple br elements after a paragraph', () => {
			const inputData = '<p>foo</p><br><br>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<p>foo</p><p></p><p></p>' );
		} );

		it( 'should replace a single br element between paragraphs', () => {
			const inputData = '<p>foo</p><br><p>bar</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<p>foo</p><p></p><p>bar</p>' );
		} );

		it( 'should replace a single br element between mixed block elements', () => {
			const inputData = '<h2>foo</h2><br><p>bar</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<h2>foo</h2><p></p><p>bar</p>' );
		} );

		it( 'should replace a single br element between paragraphs wrapped with block quote', () => {
			const inputData = '<blockquote><p>foo</p><br><p>bar</p></blockquote>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<blockquote><p>foo</p><p></p><p>bar</p></blockquote>' );
		} );

		it( 'should replace multiple br elements between paragraphs', () => {
			const inputData = '<p>foo</p><br><br><p>bar</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<p>foo</p><p></p><p></p><p>bar</p>' );
		} );

		it( 'should replace a single wrapped br element between paragraphs', () => {
			const inputData = '<p>foo</p><strong><br></strong><p>bar</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<p>foo</p><strong><p></p></strong><p>bar</p>' );
		} );

		it( 'should remove a "Apple-interchange-newline" br element after a paragraph', () => {
			const inputData = '<p>foo</p><br class="Apple-interchange-newline">';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<p>foo</p>' );
		} );

		it( 'should not replace a br element at the end of a paragraph', () => {
			const inputData = '<p>foo<br></p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( inputData );
		} );

		it( 'should not replace a br element at the beginning of a paragraph', () => {
			const inputData = '<p><br>bar</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( inputData );
		} );

		it( 'should not replace a br element in the middle of a paragraph', () => {
			const inputData = '<p>foo<br>bar</p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( inputData );
		} );

		it( 'should not replace a br element if there is a text before it', () => {
			const inputData = '<p></p>foo<br>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( inputData );
		} );

		it( 'should not replace a br element if there is a text after it', () => {
			const inputData = '<br>foo<p></p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( inputData );
		} );

		it( 'should not replace a br element if there is an inline object before it', () => {
			const inputData = '<p></p><img src="foo"><br>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( inputData );
		} );

		it( 'should not replace a br element if there is an inline object after it', () => {
			const inputData = '<br><img src="foo"><p></p>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( inputData );
		} );

		it( 'should not replace a br element if there is no other content', () => {
			const inputData = '<br>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( inputData );
		} );

		it( 'should not replace a multiple br elements if there is no other content', () => {
			const inputData = '<br><br>';
			const documentFragment = htmlDataProcessor.toView( inputData );

			transformBlockBrsToParagraphs( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( inputData );
		} );
	} );
} );
