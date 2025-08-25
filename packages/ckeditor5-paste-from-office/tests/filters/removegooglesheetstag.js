/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { HtmlDataProcessor, ViewUpcastWriter, ViewDocument, StylesProcessor } from '@ckeditor/ckeditor5-engine';
import { removeGoogleSheetsTag } from '../../src/filters/removegooglesheetstag.js';

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new ViewDocument( new StylesProcessor() ) );

	describe( 'removeGoogleSheetsTag', () => {
		let writer, viewDocument;

		before( () => {
			viewDocument = new ViewDocument();
			writer = new ViewUpcastWriter( viewDocument );
		} );

		it( 'should remove google sheets element', () => {
			const inputData =
				'<google-sheets-html-origin>' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'<google-sheets-html-origin>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			removeGoogleSheetsTag( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<table><tbody><tr><td>123</td></tr></tbody></table>' );
		} );
	} );
} );
