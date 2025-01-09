/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';
import removeMsAttributes from '../../src/filters/removemsattributes.js';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter.js';
import Document from '@ckeditor/ckeditor5-engine/src/view/document.js';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap.js';

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new Document( new StylesProcessor() ) );

	describe( 'removeMsAttributes', () => {
		let writer, viewDocument;

		before( () => {
			viewDocument = new Document();
			writer = new UpcastWriter( viewDocument );
		} );

		it( 'should remove classes which starts with "mso"', () => {
			const inputData =
				'<table class="MsoNormalTable">' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			removeMsAttributes( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<table><tbody><tr><td>123</td></tr></tbody></table>' );
		} );

		it( 'should remove styles which starts with "mso"', () => {
			const inputData =
				'<table style="mso-yfti-firstrow:yes;mso-yfti-irow:0;mso-yfti-lastrow:yes;">' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			removeMsAttributes( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<table><tbody><tr><td>123</td></tr></tbody></table>' );
		} );

		it( 'should remove "w:sdt" element (and empty "o:p", and empty "w:sdtpr")', () => {
			const inputData =
				'<w:sdt title="Your Name:" sdttag="Your Name:" id="-1681114201">' +
					'<div>' +
						'<h1>' +
								'<span lang="EN-US">Microsoft Office User<o:p></o:p><w:sdtpr></w:sdtpr></span>' +
						'</h1>' +
					'</div>' +
				'</w:sdt>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			removeMsAttributes( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div>' +
					'<h1>' +
						'<span lang="EN-US">Microsoft Office User</span>' +
					'</h1>' +
				'</div>'
			);
		} );
	} );
} );
