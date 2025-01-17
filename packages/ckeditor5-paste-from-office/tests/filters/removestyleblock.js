/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';
import removeStyleBlock from '../../src/filters/removestyleblock.js';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter.js';
import Document from '@ckeditor/ckeditor5-engine/src/view/document.js';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap.js';

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new Document( new StylesProcessor() ) );

	describe( 'removeStyleBlock', () => {
		let writer, viewDocument;

		before( () => {
			viewDocument = new Document();
			writer = new UpcastWriter( viewDocument );
		} );

		it( 'should remove <style> element', () => {
			const inputData =
				'<style type="text/css"><!--td {border: 1px solid #cccccc;}br {mso-data-placement:same-cell;}--></style>' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			removeStyleBlock( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<table><tbody><tr><td>123</td></tr></tbody></table>' );
		} );

		it( 'works with multiple consecutive <style> tags', () => {
			const inputData =
				'<style type="text/css"><!--td {border: 1px solid #cccccc;}br {mso-data-placement:same-cell;}--></style>' +
				'<style type="text/css"><!--td {border: 1px solid #cccccc;}br {mso-data-placement:same-cell;}--></style>' +
				'<style type="text/css"><!--td {border: 1px solid #cccccc;}br {mso-data-placement:same-cell;}--></style>' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			removeStyleBlock( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<table><tbody><tr><td>123</td></tr></tbody></table>' );
		} );

		it( 'works with multiple non-consecutive <style> tags', () => {
			const inputData =
				'<style type="text/css"><!--td {border: 1px solid #cccccc;}br {mso-data-placement:same-cell;}--></style>' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
				'<style type="text/css"><!--td {border: 1px solid #cccccc;}br {mso-data-placement:same-cell;}--></style>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			removeStyleBlock( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal( '<table><tbody><tr><td>123</td></tr></tbody></table>' );
		} );
	} );
} );
