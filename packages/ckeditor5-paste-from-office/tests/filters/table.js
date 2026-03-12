/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	HtmlDataProcessor,
	ViewUpcastWriter,
	ViewDocument,
	StylesProcessor,
	addBorderStylesRules,
	addPaddingStylesRules
} from '@ckeditor/ckeditor5-engine';
import { transformTables } from '../../src/filters/table.js';

describe( 'PasteFromOffice - filters - transformTables', () => {
	let writer, viewDocument, htmlDataProcessor;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		writer = new ViewUpcastWriter( viewDocument );
		htmlDataProcessor = new HtmlDataProcessor( viewDocument );

		addBorderStylesRules( viewDocument.stylesProcessor );
		addPaddingStylesRules( viewDocument.stylesProcessor );
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

	describe( 'block table alignment [experimental]', () => {
		let writer, viewDocument, htmlDataProcessor;

		beforeEach( () => {
			viewDocument = new ViewDocument( new StylesProcessor() );
			writer = new ViewUpcastWriter( viewDocument );
			htmlDataProcessor = new HtmlDataProcessor( viewDocument );

			addBorderStylesRules( viewDocument.stylesProcessor );
			addPaddingStylesRules( viewDocument.stylesProcessor );
		} );

		afterEach( () => {
			viewDocument.destroy();
		} );

		it( 'should set left block alignment styles on table without align attribute and not wrapped in div', () => {
			const inputData =
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			// transformTables( documentFragment, writer, true ); // Simulate that TableProperties plugin is present.
			transformTables( documentFragment, writer, true, true ); // [experimental] Change to above in v48.

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<table style="border-style:none;margin-left:0;margin-right:auto;">' +
					'<tbody>' +
						'<tr>' +
							'<td style="border-style:none;">123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>'
			);
		} );

		it( 'should not set left block alignment styles if there is no TableProperties plugin', () => {
			const inputData =
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td>123</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';

			const documentFragment = htmlDataProcessor.toView( inputData );

			// transformTables( documentFragment, writer ); // Simulate that TableProperties plugin is absent.
			transformTables( documentFragment, writer, false, true ); // [experimental] Change to above in v48.

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

		it( 'should set right block alignment styles on table without align attribute and wrapped in div with align="right"', () => {
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

			// transformTables( documentFragment, writer, true ); // Simulate that TableProperties plugin is present.
			transformTables( documentFragment, writer, true, true ); // [experimental] Change to above in v48.

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div align="right">' +
					'<table style="border-style:none;margin-left:auto;margin-right:0;">' +
						'<tbody>' +
							'<tr>' +
								'<td style="border-style:none;">123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</div>'
			);
		} );

		it( 'should not set right block alignment styles if there is no TableProperties plugin', () => {
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

			// transformTables( documentFragment, writer ); // Simulate that TableProperties plugin is absent.
			transformTables( documentFragment, writer, false, true ); // [experimental] Change to above in v48.

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div align="right">' +
					'<table style="border-style:none;">' +
						'<tbody>' +
							'<tr>' +
								'<td style="border-style:none;">123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</div>'
			);
		} );

		it( 'should set center block alignment styles on table without align attribute and wrapped in div with align="center"', () => {
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

			// transformTables( documentFragment, writer, true ); // Simulate that TableProperties plugin is present.
			transformTables( documentFragment, writer, true, true ); // [experimental] Change to above in v48.

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div align="center">' +
					'<table style="border-style:none;margin-left:auto;margin-right:auto;">' +
						'<tbody>' +
							'<tr>' +
								'<td style="border-style:none;">123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</div>'
			);
		} );

		it( 'should not set center block alignment styles if there is no TableProperties plugin', () => {
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

			// transformTables( documentFragment, writer ); // Simulate that TableProperties plugin is absent.
			transformTables( documentFragment, writer, false, true ); // [experimental] Change to above in v48.

			expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
				'<div align="center">' +
					'<table style="border-style:none;">' +
						'<tbody>' +
							'<tr>' +
								'<td style="border-style:none;">123</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
				'</div>'
			);
		} );

		describe( 'in Safari', () => {
			it( 'should set right block alignment styles on table without align attribute' +
				'and wrapped in a span and div with align="right"', () => {
				const inputData =
					'<div align="right">' +
						'<span>' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td>123</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</span>' +
					'</div>';

				const documentFragment = htmlDataProcessor.toView( inputData );

				// transformTables( documentFragment, writer, true ); // Simulate that TableProperties plugin is present.
				transformTables( documentFragment, writer, true, true ); // [experimental] Change to above in v48.

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<div align="right">' +
						'<span>' +
							'<table style="border-style:none;margin-left:auto;margin-right:0;">' +
								'<tbody>' +
									'<tr>' +
										'<td style="border-style:none;">123</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</span>' +
					'</div>'
				);
			} );

			it( 'should set center block alignment styles on table without align attribute' +
				'and wrapped in a span and div with align="center"', () => {
				const inputData =
					'<div align="center">' +
						'<span>' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td>123</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</span>' +
					'</div>';

				const documentFragment = htmlDataProcessor.toView( inputData );

				// transformTables( documentFragment, writer, true ); // Simulate that TableProperties plugin is present.
				transformTables( documentFragment, writer, true, true ); // [experimental] Change to above in v48.

				expect( htmlDataProcessor.toData( documentFragment ) ).to.equal(
					'<div align="center">' +
						'<span>' +
							'<table style="border-style:none;margin-left:auto;margin-right:auto;">' +
								'<tbody>' +
									'<tr>' +
										'<td style="border-style:none;">123</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</span>' +
					'</div>'
				);
			} );
		} );
	} );
} );
