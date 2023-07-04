/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import removeXmlns from '../../src/filters/removexmlns';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import Document from '@ckeditor/ckeditor5-engine/src/view/document';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new Document( new StylesProcessor() ) );

	describe( 'removeXmlns', () => {
		let writer, viewDocument;

		before( () => {
			viewDocument = new Document();
			writer = new UpcastWriter( viewDocument );
		} );

		it( 'should remove "xmlns" attribute from Google Sheets table', () => {
			const inputData =
				'<table xmlns="http://www.w3.org/1999/xhtml">' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			removeXmlns( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<table><tbody><tr><td>123</td></tr></tbody></table>' );
		} );
	} );
} );
