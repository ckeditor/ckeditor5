/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { HtmlDataProcessor, ViewUpcastWriter, ViewDocument, StylesProcessor } from '@ckeditor/ckeditor5-engine';
import { replaceTabsWithinPreWithSpaces } from '../../src/filters/replacetabswithinprewithspaces.js';

const DEFAULT_TAB_FILLER = ' '.repeat( 8 );

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new ViewDocument( new StylesProcessor() ) );

	describe( 'replaceTabsWithinPreWithSpaces', () => {
		let writer, viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument();
			writer = new ViewUpcastWriter( viewDocument );
		} );

		it( 'should replace tabs with spaces within <div style="white-space: pre-wrap"> elements', () => {
			const inputData =
				'<div style="white-space: pre-wrap">\t123\t456</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			replaceTabsWithinPreWithSpaces( documentFragment, writer, DEFAULT_TAB_FILLER.length );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				`<div style="white-space:pre-wrap;">${ DEFAULT_TAB_FILLER }123${ DEFAULT_TAB_FILLER }456</div>`
			);
		} );

		it( 'should work for various tab widths', () => {
			const tabWidths = [ 2, 4, 8 ];

			for ( const tabWidth of tabWidths ) {
				const inputData =
					'<div style="white-space: pre-wrap">\t123\t456</div>';

				const documentFragment = htmlDataProcessor.toView( inputData );
				const filler = ' '.repeat( tabWidth );

				replaceTabsWithinPreWithSpaces( documentFragment, writer, tabWidth );

				const expectedOutput = `<div style="white-space:pre-wrap;">${ filler }123${ filler }456</div>`;
				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( expectedOutput );
			}
		} );

		it( 'should replace tabs in multiple text nodes within <div style="white-space: pre-wrap"> elements', () => {
			const inputData =
				'<div style="white-space: pre-wrap">123\t</div>' +
				'<div style="white-space: pre-wrap">\t456</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			replaceTabsWithinPreWithSpaces( documentFragment, writer, DEFAULT_TAB_FILLER.length );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				`<div style="white-space:pre-wrap;">123${ DEFAULT_TAB_FILLER }</div>` +
				`<div style="white-space:pre-wrap;">${ DEFAULT_TAB_FILLER }456</div>`
			);
		} );

		it( 'should not replace tabs outside <div style="white-space: pre-wrap"> elements (uses default pre formatting logic)', () => {
			const inputData =
				'<div>123\t456</div>' +
				'<p>\t123\t456</p>' +
				'<span>123\t456</span>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			replaceTabsWithinPreWithSpaces( documentFragment, writer, DEFAULT_TAB_FILLER.length );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div>123 456</div>' +
				'<p>123 456</p>' +
				'<span>123 456</span>'
			);
		} );

		it( 'should not replace tabs within <div> elements with other white-space styles (uses default pre formatting logic)', () => {
			const inputData =
				'<div style="white-space: nowrap">\t123\t456</div>' +
				'<div style="white-space: pre">\t123\t456</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			replaceTabsWithinPreWithSpaces( documentFragment, writer, DEFAULT_TAB_FILLER.length );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div style="white-space:nowrap;">123 456</div>' +
				'<div style="white-space:pre;">\t123\t456</div>'
			);
		} );

		it( 'should look for `white-space: pre-wrap` in the whole parent chain', () => {
			const inputData =
				'<div style="white-space: pre-wrap"><span>\t123\t456</span></div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			replaceTabsWithinPreWithSpaces( documentFragment, writer, DEFAULT_TAB_FILLER.length );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				`<div style="white-space:pre-wrap;"><span>${ DEFAULT_TAB_FILLER }123${ DEFAULT_TAB_FILLER }456</span></div>`
			);
		} );

		afterEach( () => {
			viewDocument.destroy();
		} );
	} );
} );
