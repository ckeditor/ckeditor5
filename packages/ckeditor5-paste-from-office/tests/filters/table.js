/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';
import transformTables from '../../src/filters/table.js';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter.js';
import Document from '@ckeditor/ckeditor5-engine/src/view/document.js';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap.js';
import { addBorderRules, addPaddingRules } from '@ckeditor/ckeditor5-engine';

describe( 'PasteFromOffice - filters - transformTables', () => {
	let writer, viewDocument, htmlDataProcessor;

	beforeEach( () => {
		viewDocument = new Document( new StylesProcessor() );
		writer = new UpcastWriter( viewDocument );
		htmlDataProcessor = new HtmlDataProcessor( viewDocument );

		addBorderRules( viewDocument.stylesProcessor );
		addPaddingRules( viewDocument.stylesProcessor );
	} );

	afterEach( () => {
		viewDocument.destroy();
	} );

	describe( 'borders', () => {
		it( 'should inject border-style: none on table and cells without any border styles set', () => {
			const inputData =
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			transformTables( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<table style="border-style:none;">' +
					'<tbody>' +
						'<tr>' +
							'<td style="border-style:none;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);
		} );

		it( 'should inject border-left-style: none on table and cells without border left styles set', () => {
			const inputData =
				'<table style="border-top:2px dotted red;border-right:2px dotted red;border-bottom:2px dotted red;">' +
					'<tbody>' +
						'<tr>' +
							'<td style="border-top:2px dotted red;border-right:2px dotted red;border-bottom:2px dotted red;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			transformTables( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<table style="' +
						'border-bottom:2px dotted red;' +
						'border-left-style:none;' +
						'border-right:2px dotted red;' +
						'border-top:2px dotted red;' +
					'">' +
					'<tbody>' +
						'<tr>' +
							'<td style="' +
								'border-bottom:2px dotted red;' +
								'border-left-style:none;' +
								'border-right:2px dotted red;' +
								'border-top:2px dotted red;' +
							'">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);
		} );

		it( 'should inject border-top-style: none on table and cells without border top styles set', () => {
			const inputData =
				'<table style="border-left:2px dotted red;border-right:2px dotted red;border-bottom:2px dotted red;">' +
					'<tbody>' +
						'<tr>' +
							'<td style="border-left:2px dotted red;border-right:2px dotted red;border-bottom:2px dotted red;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			transformTables( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<table style="' +
						'border-bottom:2px dotted red;' +
						'border-left:2px dotted red;' +
						'border-right:2px dotted red;' +
						'border-top-style:none;' +
					'">' +
					'<tbody>' +
						'<tr>' +
							'<td style="' +
								'border-bottom:2px dotted red;' +
								'border-left:2px dotted red;' +
								'border-right:2px dotted red;' +
								'border-top-style:none;' +
							'">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);
		} );

		it( 'should inject border-right-style: none on table and cells without border right styles set', () => {
			const inputData =
				'<table style="border-left:2px dotted red;border-top:2px dotted red;border-bottom:2px dotted red;">' +
					'<tbody>' +
						'<tr>' +
							'<td style="border-left:2px dotted red;border-top:2px dotted red;border-bottom:2px dotted red;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			transformTables( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<table style="' +
						'border-bottom:2px dotted red;' +
						'border-left:2px dotted red;' +
						'border-right-style:none;' +
						'border-top:2px dotted red;' +
					'">' +
					'<tbody>' +
						'<tr>' +
							'<td style="' +
								'border-bottom:2px dotted red;' +
								'border-left:2px dotted red;' +
								'border-right-style:none;' +
								'border-top:2px dotted red;' +
							'">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);
		} );

		it( 'should inject border-bottom-style: none on table and cells without border bottom styles set', () => {
			const inputData =
				'<table style="border-left:2px dotted red;border-top:2px dotted red;border-right:2px dotted red;">' +
					'<tbody>' +
						'<tr>' +
							'<td style="border-left:2px dotted red;border-top:2px dotted red;border-right:2px dotted red;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			transformTables( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<table style="' +
						'border-bottom-style:none;' +
						'border-left:2px dotted red;' +
						'border-right:2px dotted red;' +
						'border-top:2px dotted red;' +
					'">' +
					'<tbody>' +
						'<tr>' +
							'<td style="' +
								'border-bottom-style:none;' +
								'border-left:2px dotted red;' +
								'border-right:2px dotted red;' +
								'border-top:2px dotted red;' +
							'">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);
		} );
	} );

	describe( 'length units', () => {
		it( 'should replace width and height style on table and cells to px', () => {
			const inputData =
				'<table style="width:300pt;height:100pt">' +
					'<tbody>' +
						'<tr>' +
							'<td style="width:200pt;height:50pt;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			transformTables( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<table style="border-style:none;height:133px;width:400px;">' +
					'<tbody>' +
						'<tr>' +
							'<td style="border-style:none;height:67px;width:267px;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);
		} );

		it( 'should replace border width style on table and cells to px', () => {
			const inputData =
				'<table style="border: 3pt solid red;">' +
					'<tbody>' +
						'<tr>' +
							'<td style="border: 1.5pt solid red;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			transformTables( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<table style="border:4px solid red;">' +
					'<tbody>' +
						'<tr>' +
							'<td style="border:2px solid red;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);
		} );

		it( 'should replace padding style on table cells to px', () => {
			const inputData =
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td style="padding: 5pt">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			transformTables( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<table style="border-style:none;">' +
					'<tbody>' +
						'<tr>' +
							'<td style="border-style:none;padding:7px;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);
		} );

		it( 'should not replace width and height style in % on table and cells to px', () => {
			const inputData =
				'<table style="width:100%;height:20%">' +
					'<tbody>' +
						'<tr>' +
							'<td style="width:50%;height:20%;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			transformTables( documentFragment, writer );

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<table style="border-style:none;height:20%;width:100%;">' +
					'<tbody>' +
						'<tr>' +
							'<td style="border-style:none;height:20%;width:50%;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);
		} );
	} );
} );
