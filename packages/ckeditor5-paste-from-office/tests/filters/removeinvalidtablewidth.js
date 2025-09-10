/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { HtmlDataProcessor, ViewUpcastWriter, ViewDocument, StylesProcessor } from '@ckeditor/ckeditor5-engine';
import { removeInvalidTableWidth } from '../../src/filters/removeinvalidtablewidth.js';

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new ViewDocument( new StylesProcessor() ) );

	describe( 'removeInvalidTableWidth', () => {
		let writer, viewDocument;

		before( () => {
			viewDocument = new ViewDocument();
			writer = new ViewUpcastWriter( viewDocument );
		} );

		it( 'should remove "width:0px" from Google Sheets table', () => {
			const inputData =
				'<table style="width:0px">' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			removeInvalidTableWidth( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<table><tbody><tr><td>123</td></tr></tbody></table>' );
		} );

		it( 'should remove width="0" attribute from Word table', () => {
			const inputData =
				'<div align="center"><table width="0">' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table></div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			removeInvalidTableWidth( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div align="center"><table><tbody><tr><td>123</td></tr></tbody></table></div>'
			);
		} );

		it( 'should remove both style and attribute when width=0', () => {
			const inputData =
				'<table width="0" style="width:0px;">' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			removeInvalidTableWidth( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<table><tbody><tr><td>123</td></tr></tbody></table>' );
		} );
	} );
} );
