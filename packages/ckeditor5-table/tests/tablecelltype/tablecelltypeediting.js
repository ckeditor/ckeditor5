/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _getModelData, _getViewData, _setModelData } from '@ckeditor/ckeditor5-engine';

import { TableCellTypeEditing } from '../../src/tablecelltype/tablecelltypeediting.js';
import { TableCellTypeCommand } from '../../src/tablecelltype/commands/tablecelltypecommand.js';
import { TableEditing } from '../../src/tableediting.js';
import { modelTable, viewTable } from '../_utils/utils.js';

describe( 'TableCellTypeEditing', () => {
	let editor, model, schema;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableCellTypeEditing, Paragraph ],
			experimentalFlags: {
				tableCellTypeSupport: true
			}
		} );

		model = editor.model;
		schema = model.schema;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableCellTypeEditing.pluginName ).to.equal( 'TableCellTypeEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableCellTypeEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableCellTypeEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should require `TableEditing` plugin', () => {
		expect( TableCellTypeEditing.requires ).to.include( TableEditing );
	} );

	it( 'adds tableCellType command', () => {
		expect( editor.commands.get( 'tableCellType' ) ).to.be.instanceOf( TableCellTypeCommand );
	} );

	it( 'should not register attribute or any conversion when experimental flag is disabled', async () => {
		const testEditor = await VirtualTestEditor.create( {
			plugins: [ TableCellTypeEditing, Paragraph ]
		} );

		const testModel = testEditor.model;
		const testSchema = testModel.schema;

		expect( testSchema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellType' ) ).to.be.false;

		await testEditor.destroy();
	} );

	describe( 'schema', () => {
		it( 'should register tableCellType attribute in the schema', () => {
			expect( schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellType' ) ).to.be.true;
		} );

		it( 'should register tableCellType attribute as a formatting attribute', () => {
			expect( schema.getAttributeProperties( 'tableCellType' ).isFormatting ).to.be.true;
		} );
	} );

	describe( 'upcast conversion', () => {
		it( 'should upcast `th` to `tableCellType=header` attribute', () => {
			editor.setData(
				viewTable( [
					[ { contents: '00', isHeading: true }, '01' ],
					[ '10', '11' ]
				] )
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				modelTable( [
					[ { contents: '00', tableCellType: 'header' }, '01' ],
					[ '10', '11' ]
				] )
			);
		} );
	} );

	describe( 'editing', () => {
		it( 'should reconvert table cell when `tableCellType` attribute changes to `header`', () => {
			editor.setData(
				viewTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] )
			);

			const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

			model.change( writer => {
				writer.setAttribute( 'tableCellType', 'header', tableCell );
			} );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				viewTable( [
					[ { contents: '00', isHeading: true }, '01' ],
					[ '10', '11' ]
				], { asWidget: true } )
			);
		} );

		it( 'should reconvert table cell when removing `tableCellType` ', () => {
			editor.setData(
				viewTable( [
					[ { contents: '00', isHeading: true }, '01' ],
					[ '10', '11' ]
				] )
			);

			const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

			model.change( writer => {
				writer.removeAttribute( 'tableCellType', tableCell );
			} );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				viewTable( [
					[ { contents: '00' }, '01' ],
					[ '10', '11' ]
				], { asWidget: true } )
			);
		} );
	} );

	describe( 'inserting rows / columns', () => {
		describe( 'inserting rows to tables with heading columns', () => {
			it( 'should properly set `tableCellType=header` to first cell of heading columns ' +
					'when appending new row below (single header column)', () => {
				_setModelData( model, modelTable( [
					[
						{ contents: '00', tableCellType: 'header', isSelected: true },
						'01'
					]
				], { headingColumns: 1 } ) );

				editor.execute( 'insertTableRowBelow' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					modelTable( [
						[
							{ contents: '00', tableCellType: 'header' },
							'01'
						],
						[
							{ contents: '', tableCellType: 'header' },
							''
						]
					], { headingColumns: 1 } )
				);
			} );

			it( 'should properly set `tableCellType=header` to cells of heading columns ' +
					'when appending new row below (multiple header columns)', () => {
				_setModelData( model, modelTable( [
					[
						{ contents: '00', tableCellType: 'header', isSelected: true },
						{ contents: '01', tableCellType: 'header' },
						'02'
					]
				], { headingColumns: 2 } ) );

				editor.execute( 'insertTableRowBelow' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					modelTable( [
						[
							{ contents: '00', tableCellType: 'header' },
							{ contents: '01', tableCellType: 'header' },
							'02'
						],
						[
							{ contents: '', tableCellType: 'header' },
							{ contents: '', tableCellType: 'header' },
							''
						]
					], { headingColumns: 2 } )
				);
			} );

			it( 'should properly set `tableCellType=header` to first cell of heading columns ' +
					'when inserting new row above (single header column)', () => {
				_setModelData( model, modelTable( [
					[
						{ contents: '00', tableCellType: 'header', isSelected: true },
						'01'
					]
				], { headingColumns: 1 } ) );

				editor.execute( 'insertTableRowAbove' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					modelTable( [
						[
							{ contents: '', tableCellType: 'header' },
							''
						],
						[
							{ contents: '00', tableCellType: 'header' },
							'01'
						]
					], { headingColumns: 1 } )
				);
			} );

			it( 'should properly set `tableCellType=header` to cells of heading columns ' +
					'when inserting new row above (multiple header columns)', () => {
				_setModelData( model, modelTable( [
					[
						{ contents: '00', tableCellType: 'header', isSelected: true },
						{ contents: '01', tableCellType: 'header' },
						'02'
					]
				], { headingColumns: 2 } ) );

				editor.execute( 'insertTableRowAbove' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					modelTable( [
						[
							{ contents: '', tableCellType: 'header' },
							{ contents: '', tableCellType: 'header' },
							''
						],
						[
							{ contents: '00', tableCellType: 'header' },
							{ contents: '01', tableCellType: 'header' },
							'02'
						]
					], { headingColumns: 2 } )
				);
			} );
		} );

		describe( 'inserting columns to tables with heading rows', () => {
			it( 'should properly set `tableCellType=header` to second cell of heading row ' +
					'when appending new column to the right (single header row)', () => {
				_setModelData( model, modelTable( [
					[
						{ contents: '00', tableCellType: 'header', isSelected: true },
						{ contents: '01', tableCellType: 'header' }
					],
					[ '10', '11' ]
				], { headingRows: 1 } ) );

				editor.execute( 'insertTableColumnRight' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					modelTable( [
						[
							{ contents: '00', tableCellType: 'header' },
							{ contents: '', tableCellType: 'header' },
							{ contents: '01', tableCellType: 'header' }
						],
						[
							'10',
							'',
							'11'
						]
					], { headingRows: 1 } )
				);
			} );

			it( 'should properly set `tableCellType=header` to cells of heading rows ' +
					'when appending new column to the right (multiple header rows)', () => {
				_setModelData( model, modelTable( [
					[
						{ contents: '00', tableCellType: 'header', isSelected: true },
						{ contents: '01', tableCellType: 'header' }
					],
					[
						{ contents: '10', tableCellType: 'header' },
						{ contents: '11', tableCellType: 'header' }
					],
					[ '20', '21' ]
				], { headingRows: 2 } ) );

				editor.execute( 'insertTableColumnRight' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					modelTable( [
						[
							{ contents: '00', tableCellType: 'header' },
							{ contents: '', tableCellType: 'header' },
							{ contents: '01', tableCellType: 'header' }
						],
						[
							{ contents: '10', tableCellType: 'header' },
							{ contents: '', tableCellType: 'header' },
							{ contents: '11', tableCellType: 'header' }
						],
						[
							'20',
							'',
							'21'
						]
					], { headingRows: 2 } )
				);
			} );
		} );
	} );
} );
