/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import { setTableAlignment } from '../../src/filters/table';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import Document from '@ckeditor/ckeditor5-engine/src/view/document';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';

describe( 'PasteFromOffice - filters', () => {
	const htmlDataProcessor = new HtmlDataProcessor( new Document( new StylesProcessor() ) );

	describe( 'tableAlignmentFilter', () => {
		let writer, viewDocument;

		before( () => {
			viewDocument = new Document();
			writer = new UpcastWriter( viewDocument );
		} );

		it( 'should align table to left', () => {
			const inputData =
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			setTableAlignment( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<table align="left"><tbody><tr><td>123</td></tr></tbody></table>'
			);
		} );

		it( 'should return only text', () => {
			const inputData = 'text';

			const documentFragment = htmlDataProcessor.toView( inputData );

			setTableAlignment( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'text'
			);
		} );

		it( 'should align table to left when table allocated in div', () => {
			const inputData =
			'<div align="left">' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			setTableAlignment( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div align="left">' +
					'<table align="left">' +
						'<tbody>' +
							'<tr>' +
								'<td>123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</div>'
			);
		} );

		it( 'should align table to center', () => {
			const inputData =
				'<div align="center">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			setTableAlignment( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div align="center">' +
					'<table align="none">' +
						'<tbody>' +
							'<tr>' +
								'<td>123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</div>'
			);
		} );

		it( 'should align table to right', () => {
			const inputData =
				'<div align="right">' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td>123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			setTableAlignment( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div align="right">' +
					'<table align="right">' +
						'<tbody>' +
							'<tr>' +
								'<td>123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</div>'
			);
		} );

		it( 'should properly align tables', () => {
			const inputData =
			'<table>' +
				'<tbody>' +
					'<tr>' +
						'<td>123</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>' +
			'<div align="center">' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</div>' +
			'<div align="right">' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</div>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			setTableAlignment( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<table align="left">' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
				'<div align="center">' +
					'<table align="none">' +
						'<tbody>' +
							'<tr>' +
								'<td>123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</div>' +
				'<div align="right">' +
					'<table align="right">' +
						'<tbody>' +
							'<tr>' +
								'<td>123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</div>'
			);
		} );
	} );
} );
