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

		it( 'should upcast whole table made of `th` except for first cell', () => {
			editor.setData(
				viewTable( [
					[
						'00',
						{ contents: '01', isHeading: true }
					],
					[
						{ contents: '10', isHeading: true },
						{ contents: '11', isHeading: true }
					]
				] )
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				modelTable( [
					[
						'00',
						{ contents: '01', tableCellType: 'header' }
					],
					[
						{ contents: '10', tableCellType: 'header' },
						{ contents: '11', tableCellType: 'header' }
					]
				] )
			);
		} );
	} );

	describe( 'downcast conversion', () => {
		it( 'should downcast `tableCellType=header` attribute to `th`', () => {
			_setModelData( model,
				modelTable( [
					[ { contents: '00', tableCellType: 'header' }, '01' ],
					[ '10', '11' ]
				] )
			);

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				viewTable( [
					[ { contents: '00', isHeading: true }, '01' ],
					[ '10', '11' ]
				], { asWidget: true } )
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

	describe( 'auto increment of heading attributes', () => {
		it( 'should increment headingRows when the next row is all headers', () => {
			_setModelData( model, modelTable( [
				[ { contents: '00', isSelected: true }, '01' ],
				[
					{ contents: '10', tableCellType: 'header' },
					{ contents: '11', tableCellType: 'header' }
				],
				[ '20', '21' ]
			] ) );

			const table = model.document.getRoot().getNodeByPath( [ 0 ] );

			editor.execute( 'setTableRowHeader' );

			expect( table.getAttribute( 'headingRows' ) ).to.equal( 2 );
			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '01', tableCellType: 'header' }
					],
					[
						{ contents: '10', tableCellType: 'header' },
						{ contents: '11', tableCellType: 'header' }
					],
					[ '20', '21' ]
				], { headingRows: 2 } )
			);
		} );

		it( 'should increment headingColumns when the next column is all headers', () => {
			_setModelData( model, modelTable( [
				[
					{ contents: '00', isSelected: true },
					{ contents: '01', tableCellType: 'header' },
					'02'
				],
				[
					'10',
					{ contents: '11', tableCellType: 'header' },
					'12'
				]
			] ) );

			const table = model.document.getRoot().getNodeByPath( [ 0 ] );

			editor.execute( 'setTableColumnHeader' );

			expect( table.getAttribute( 'headingColumns' ) ).to.equal( 2 );
			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '01', tableCellType: 'header' },
						'02'
					],
					[
						{ contents: '10', tableCellType: 'header' },
						{ contents: '11', tableCellType: 'header' },
						'12'
					]
				], { headingColumns: 2 } )
			);
		} );

		it( 'should stop incrementing headingRows when a row contains non-header cell', () => {
			_setModelData( model, modelTable( [
				[ { contents: '00', isSelected: true }, '01' ],
				[
					{ contents: '10', tableCellType: 'header' },
					{ contents: '11', tableCellType: 'header' }
				],
				[
					{ contents: '20', tableCellType: 'header' },
					'21'
				],
				[
					{ contents: '30', tableCellType: 'header' },
					{ contents: '31', tableCellType: 'header' }
				]
			] ) );

			const table = model.document.getRoot().getNodeByPath( [ 0 ] );

			editor.execute( 'setTableRowHeader' );

			expect( table.getAttribute( 'headingRows' ) ).to.equal( 2 );
		} );

		it( 'should stop incrementing headingColumns when a column contains non-header cell', () => {
			_setModelData( model, modelTable( [
				[
					{ contents: '00', isSelected: true },
					{ contents: '01', tableCellType: 'header' },
					{ contents: '02', tableCellType: 'header' },
					{ contents: '03', tableCellType: 'header' }
				],
				[
					'10',
					{ contents: '11', tableCellType: 'header' },
					'12',
					{ contents: '13', tableCellType: 'header' }
				]
			] ) );

			const table = model.document.getRoot().getNodeByPath( [ 0 ] );

			editor.execute( 'setTableColumnHeader' );

			expect( table.getAttribute( 'headingColumns' ) ).to.equal( 2 );
		} );

		it( 'should not increment if the next row is not all headers', () => {
			_setModelData( model, modelTable( [
				[ { contents: '00', isSelected: true }, '01' ],
				[
					{ contents: '10', tableCellType: 'header' },
					'11'
				]
			] ) );

			const table = model.document.getRoot().getNodeByPath( [ 0 ] );

			editor.execute( 'setTableRowHeader' );

			expect( table.getAttribute( 'headingRows' ) ).to.equal( 1 );
		} );

		it( 'should not increment heading attributes when other table attributes change', () => {
			schema.extend( 'table', { allowAttributes: 'foo' } );

			_setModelData( model, modelTable( [
				[ '00', '01' ],
				[
					{ contents: '10', tableCellType: 'header' },
					{ contents: '11', tableCellType: 'header' }
				],
				[ '20', '21' ]
			], { headingRows: 1 } ) );

			const table = model.document.getRoot().getNodeByPath( [ 0 ] );

			model.change( writer => {
				writer.setAttribute( 'foo', 'bar', table );
			} );

			expect( table.getAttribute( 'headingRows' ) ).to.equal( 1 );
		} );

		it( 'should not increment headingRows when decreasing it, even if the next row contains headers (due to headingColumns)', () => {
			_setModelData( model, modelTable( [
				[
					{ contents: '00', tableCellType: 'header' },
					{ contents: '01', tableCellType: 'header' }
				],
				[
					{ contents: '10', tableCellType: 'header', isSelected: true },
					{ contents: '11', tableCellType: 'header' }
				]
			], { headingRows: 2, headingColumns: 2 } ) );

			const table = model.document.getRoot().getNodeByPath( [ 0 ] );

			editor.execute( 'setTableRowHeader' );

			expect( table.getAttribute( 'headingRows' ) ).to.equal( 1 );
		} );

		it( 'should not increment headingColumns when decreasing it, even if the next column contains headers (due to headingRows)', () => {
			_setModelData( model, modelTable( [
				[
					{ contents: '00', tableCellType: 'header' },
					{ contents: '01', tableCellType: 'header', isSelected: true }
				],
				[
					{ contents: '10', tableCellType: 'header' },
					{ contents: '11', tableCellType: 'header' }
				]
			], { headingRows: 2, headingColumns: 2 } ) );

			const table = model.document.getRoot().getNodeByPath( [ 0 ] );

			editor.execute( 'setTableColumnHeader' );

			expect( table.getAttribute( 'headingColumns' ) ).to.equal( 1 );
		} );
	} );

	describe( 'syncing tableCellType with heading attributes', () => {
		it( 'should set `tableCellType=header` when increasing `headingRows`', () => {
			_setModelData( model, modelTable( [
				[ { contents: '00', isSelected: true }, '01' ],
				[ '10', '11' ]
			] ) );

			editor.execute( 'setTableRowHeader' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '01', tableCellType: 'header' }
					],
					[ '10', '11' ]
				], { headingRows: 1 } )
			);
		} );

		it( 'should remove `tableCellType` when decreasing `headingRows`', () => {
			_setModelData( model, modelTable( [
				[
					{ contents: '00', tableCellType: 'header', isSelected: true },
					{ contents: '01', tableCellType: 'header' }
				],
				[ '10', '11' ]
			], { headingRows: 1 } ) );

			editor.execute( 'setTableRowHeader' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] )
			);
		} );

		it( 'should set `tableCellType=header` when increasing `headingColumns`', () => {
			_setModelData( model, modelTable( [
				[ { contents: '00', isSelected: true }, '01' ],
				[ '10', '11' ]
			] ) );

			editor.execute( 'setTableColumnHeader' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						'01'
					],
					[
						{ contents: '10', tableCellType: 'header' },
						'11'
					]
				], { headingColumns: 1 } )
			);
		} );

		it( 'should remove `tableCellType` when removing `headingColumns`', () => {
			_setModelData( model, modelTable( [
				[
					{ contents: '00', tableCellType: 'header', isSelected: true },
					'01'
				],
				[
					{ contents: '10', tableCellType: 'header' },
					'11'
				]
			], { headingColumns: 1 } ) );

			editor.execute( 'setTableColumnHeader' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] )
			);
		} );
	} );
} );
