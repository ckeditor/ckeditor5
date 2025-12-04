/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// eslint-disable-next-line ckeditor5-rules/allow-imports-only-from-main-package-entry-point
import { Client, clearBuffer, expectClients, syncClients } from '@ckeditor/ckeditor5-engine/tests/model/operation/transform/utils.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { TableCellPropertiesEditing } from '../../src/tablecellproperties/tablecellpropertiesediting.js';
import { TableEditing } from '../../src/tableediting.js';
import { TableSelection } from '../../src/tableselection.js';
import { modelTable } from '../_utils/utils.js';

describe( 'collaboration', () => {
	let john, kate;

	beforeEach( async () => {
		const editorConfig = {
			plugins: [ TableEditing, TableCellPropertiesEditing, Paragraph, TableSelection ],
			experimentalFlags: {
				tableCellTypeSupport: true
			}
		};

		[ john, kate ] = await Promise.all( [
			Client.get( 'john', { editorConfig } ),
			Client.get( 'kate', { editorConfig } )
		] );
	} );

	afterEach( async () => {
		clearBuffer();

		await Promise.all( [ john.destroy(), kate.destroy() ] );
	} );

	describe( 'header rows', () => {
		it( 'should work properly if only one user sets header row', () => {
			const initialModel = modelTable( [
				[ '00[]', '1' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );

			syncClients();

			john._processExecute( 'setTableRowHeader' );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '1', tableCellType: 'header' }
					],
					[ '10', '12' ]
				], { headingRows: 1 } )
			);
		} );

		it( 'should work properly if both users set header row on the first row at the same time', () => {
			const initialModel = modelTable( [
				[ '00[]', '1' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );
			selectCells( kate, [ 0, 0 ], [ 0, 0 ] );

			syncClients();

			john._processExecute( 'setTableRowHeader' );
			kate._processExecute( 'setTableRowHeader' );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '1', tableCellType: 'header' }
					],
					[ '10', '12' ]
				], { headingRows: 1 } )
			);
		} );

		it( 'should work properly if john sets header row on first row and kate on the second row at the same time', () => {
			const initialModel = modelTable( [
				[ '00[]', '1' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );
			selectCells( kate, [ 1, 0 ], [ 1, 1 ] );

			syncClients();

			john._processExecute( 'setTableRowHeader' );
			kate._processExecute( 'setTableRowHeader' );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '1', tableCellType: 'header' }
					],
					[
						{ contents: '10', tableCellType: 'header' },
						{ contents: '12', tableCellType: 'header' }
					]
				], { headingRows: 2 } )
			);
		} );

		it( 'should work properly if john sets header row on both rows and kate removes first header row at the same time', () => {
			const initialModel = modelTable( [
				[
					{ contents: '00', tableCellType: 'header' },
					{ contents: '01', tableCellType: 'header' }
				],
				[ '10[]', '12' ],
				[ '20', '22' ]
			], { headingRows: 1 } );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 1, 1 ] );
			selectCells( kate, [ 0, 0 ], [ 0, 1 ] );

			syncClients();

			john._processExecute( 'setTableRowHeader' );
			kate._processExecute( 'setTableRowHeader', { forceValue: false } );

			syncClients();

			expectClients(
				modelTable( [
					[ '00', '01' ],
					[ { contents: '10', tableCellType: 'header' }, { contents: '12', tableCellType: 'header' } ],
					[ '20', '22' ]
				] )
			);
		} );

		it( 'should work properly if john sets header row and kate unsets it at the same time', () => {
			const initialModel = modelTable( [
				[ '00[]', '1' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );
			selectCells( kate, [ 0, 0 ], [ 0, 0 ] );

			syncClients();

			john._processExecute( 'setTableRowHeader' );
			kate._processExecute( 'setTableRowHeader', { forceValue: false } );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '1', tableCellType: 'header' }
					],
					[ '10', '12' ]
				], { headingRows: 1 } )
			);
		} );

		it( 'should work properly if john sets 2 header rows and kate sets 1 header row at the same time', () => {
			const initialModel = modelTable( [
				[ '00[]', '1' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 1, 1 ] );
			selectCells( kate, [ 0, 0 ], [ 0, 1 ] );

			syncClients();

			john._processExecute( 'setTableRowHeader' );
			kate._processExecute( 'setTableRowHeader' );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '1', tableCellType: 'header' }
					],
					[
						{ contents: '10', tableCellType: 'header' },
						{ contents: '12', tableCellType: 'header' }
					]
				], { headingRows: 2 } )
			);
		} );

		it( 'should work properly if john sets header row and kate sets cell type to data on a cell in that row', () => {
			const initialModel = modelTable( [
				[ '00[]', '01' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );
			selectCells( kate, [ 0, 0 ], [ 0, 0 ] );

			syncClients();

			john._processExecute( 'setTableRowHeader' );
			kate._processExecute( 'tableCellType', { value: 'data' } );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '01', tableCellType: 'header' }
					],
					[ '10', '12' ]
				], { headingRows: 1 } )
			);
		} );

		it( 'should work properly if john sets header row and kate sets header column', () => {
			const initialModel = modelTable( [
				[ '00[]', '01' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );
			selectCells( kate, [ 0, 0 ], [ 0, 0 ] );

			syncClients();

			john._processExecute( 'setTableRowHeader' );
			kate._processExecute( 'setTableColumnHeader' );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '01', tableCellType: 'header' }
					],
					[
						{ contents: '10', tableCellType: 'header' },
						'12'
					]
				], { headingRows: 1, headingColumns: 1 } )
			);
		} );

		it( 'should work properly if john unsets header row and kate sets cell type to header on a cell in that row', () => {
			const initialModel = modelTable( [
				[
					{ contents: '00', tableCellType: 'header' },
					{ contents: '01', tableCellType: 'header' }
				],
				[ '10[]', '12' ]
			], { headingRows: 1 } );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );
			selectCells( kate, [ 0, 0 ], [ 0, 0 ] );

			syncClients();

			john._processExecute( 'setTableRowHeader', { forceValue: false } );
			kate._processExecute( 'tableCellType', { value: 'header' } );

			syncClients();

			expectClients(
				modelTable( [
					[ '00', '01' ],
					[ '10', '12' ]
				] )
			);
		} );
	} );

	describe( 'header columns', () => {
		it( 'should work properly if only one user sets header column', () => {
			const initialModel = modelTable( [
				[ '00[]', '1' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );

			syncClients();

			john._processExecute( 'setTableColumnHeader' );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						'1'
					],
					[
						{ contents: '10', tableCellType: 'header' },
						'12'
					]
				], { headingColumns: 1 } )
			);
		} );

		it( 'should work properly if both users set header column on the first column at the same time', () => {
			const initialModel = modelTable( [
				[ '00[]', '1' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );
			selectCells( kate, [ 0, 0 ], [ 0, 0 ] );

			syncClients();

			john._processExecute( 'setTableColumnHeader' );
			kate._processExecute( 'setTableColumnHeader' );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						'1'
					],
					[
						{ contents: '10', tableCellType: 'header' },
						'12'
					]
				], { headingColumns: 1 } )
			);
		} );

		it( 'should work properly if john sets header column on first column and kate on the second column at the same time', () => {
			const initialModel = modelTable( [
				[ '00[]', '1' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );
			selectCells( kate, [ 0, 1 ], [ 1, 1 ] );

			syncClients();

			john._processExecute( 'setTableColumnHeader' );
			kate._processExecute( 'setTableColumnHeader' );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '1', tableCellType: 'header' }
					],
					[
						{ contents: '10', tableCellType: 'header' },
						{ contents: '12', tableCellType: 'header' }
					]
				], { headingColumns: 1, headingRows: 2 } )
			);
		} );

		it( 'should work properly if john sets header column on both columns and kate removes first header column at the same time', () => {
			const initialModel = modelTable( [
				[
					{ contents: '00[]', tableCellType: 'header' },
					'01'
				],
				[
					{ contents: '10', tableCellType: 'header' },
					'12'
				],
				[
					{ contents: '20', tableCellType: 'header' },
					'22'
				]
			], { headingColumns: 1 } );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 1, 1 ] );
			selectCells( kate, [ 0, 0 ], [ 1, 0 ] );

			syncClients();

			john._processExecute( 'setTableColumnHeader' );
			kate._processExecute( 'setTableColumnHeader', { forceValue: false } );

			syncClients();

			expectClients(
				modelTable( [
					[ '00', { contents: '01', tableCellType: 'header' } ],
					[ '10', { contents: '12', tableCellType: 'header' } ],
					[ '20', { contents: '22', tableCellType: 'header' } ]
				] )
			);
		} );

		it( 'should work properly if john sets header column and kate unsets it at the same time', () => {
			const initialModel = modelTable( [
				[ '00[]', '1' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );
			selectCells( kate, [ 0, 0 ], [ 0, 0 ] );

			syncClients();

			john._processExecute( 'setTableColumnHeader' );
			kate._processExecute( 'setTableColumnHeader', { forceValue: false } );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						'1'
					],
					[
						{ contents: '10', tableCellType: 'header' },
						'12'
					]
				], { headingColumns: 1 } )
			);
		} );

		it( 'should work properly if john sets 2 header columns and kate sets 1 header column at the same time', () => {
			const initialModel = modelTable( [
				[ '00[]', '1' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 1, 1 ] );
			selectCells( kate, [ 0, 0 ], [ 1, 0 ] );

			syncClients();

			john._processExecute( 'setTableColumnHeader' );
			kate._processExecute( 'setTableColumnHeader' );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '1', tableCellType: 'header' }
					],
					[
						{ contents: '10', tableCellType: 'header' },
						{ contents: '12', tableCellType: 'header' }
					]
				], { headingColumns: 2 } )
			);
		} );

		it( 'should work properly if john sets header column and kate sets cell type to data on a cell in that column', () => {
			const initialModel = modelTable( [
				[ '00[]', '01' ],
				[ '10', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );
			selectCells( kate, [ 0, 0 ], [ 0, 0 ] );

			syncClients();

			john._processExecute( 'setTableColumnHeader' );
			kate._processExecute( 'tableCellType', { value: 'data' } );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						'01'
					],
					[
						{ contents: '10', tableCellType: 'header' },
						'12'
					]
				], { headingColumns: 1 } )
			);
		} );
	} );

	describe( 'cell type', () => {
		it( 'should work properly if john set cell type and kate does nothing', () => {
			const initialModel = modelTable( [
				[ '00', '01' ],
				[ '10', '12[]' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );

			syncClients();

			john._processExecute( 'tableCellType', { value: 'header' } );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						'01'
					],
					[ '10', '12' ]
				] )
			);
		} );

		it( 'should work properly if john set cell type to header and kate set cell type on different cells at the same time', () => {
			const initialModel = modelTable( [
				[ '00', '01' ],
				[ '10', '12[]' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 0, 0 ], [ 0, 0 ] );
			selectCells( kate, [ 1, 1 ], [ 1, 1 ] );

			syncClients();

			john._processExecute( 'tableCellType', { value: 'header' } );
			kate._processExecute( 'tableCellType', { value: 'header' } );

			syncClients();

			expectClients(
				modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						'01'
					],
					[
						'10',
						{ contents: '12', tableCellType: 'header' }
					]
				] )
			);
		} );

		it( 'should work properly if john set cell type to header and ' +
				'kate set cell type to data at the same time on the same cells', () => {
			const initialModel = modelTable( [
				[ '00', '01' ],
				[ '10[]', '12' ]
			] );

			john.setData( initialModel );
			kate.setData( initialModel );

			selectCells( john, [ 1, 0 ], [ 1, 0 ] );
			selectCells( kate, [ 1, 0 ], [ 1, 0 ] );

			syncClients();

			kate._processExecute( 'tableCellType', { value: 'data' } );
			john._processExecute( 'tableCellType', { value: 'header' } );

			syncClients();

			expectClients(
				modelTable( [
					[ '00', '01' ],
					[ { tableCellType: 'header', contents: '10' }, '12' ]
				] )
			);
		} );

		describe( 'setting whole row', () => {
			it( 'should work properly if john set cell type to header on whole row and ' +
					'kate set cell type to data on first cell at the same time (first row)', () => {
				const initialModel = modelTable( [
					[ '00', '01' ],
					[ '10[]', '12' ]
				] );

				john.setData( initialModel );
				kate.setData( initialModel );

				selectCells( john, [ 0, 0 ], [ 0, 1 ] );
				selectCells( kate, [ 0, 0 ], [ 0, 0 ] );

				syncClients();

				kate._processExecute( 'tableCellType', { value: 'data' } );
				john._processExecute( 'tableCellType', { value: 'header' } );

				syncClients();

				expectClients(
					modelTable( [
						[
							{ tableCellType: 'header', contents: '00' },
							{ tableCellType: 'header', contents: '01' }
						],
						[ '10', '12' ]
					], { headingRows: 1 } )
				);
			} );

			it( 'should work properly if john set cell type to header on whole row and ' +
					'kate set cell type to data on first cell at the same time (second row)', () => {
				const initialModel = modelTable( [
					[ '00', '01' ],
					[ '10[]', '12' ]
				] );

				john.setData( initialModel );
				kate.setData( initialModel );

				selectCells( john, [ 1, 0 ], [ 1, 1 ] );
				selectCells( kate, [ 1, 0 ], [ 1, 0 ] );

				syncClients();

				kate._processExecute( 'tableCellType', { value: 'data' } );
				john._processExecute( 'tableCellType', { value: 'header' } );

				syncClients();

				expectClients(
					modelTable( [
						[ '00', '01' ],
						[
							{ tableCellType: 'header', contents: '10' },
							{ tableCellType: 'header', contents: '12' }
						]
					] )
				);
			} );

			it( 'should work properly if john set cell type to header on the first row and ' +
					'kate set cell type to header on second row at the same time', () => {
				const initialModel = modelTable( [
					[ '00', '01' ],
					[ '10[]', '12' ]
				] );

				john.setData( initialModel );
				kate.setData( initialModel );

				selectCells( john, [ 0, 0 ], [ 0, 1 ] );
				selectCells( kate, [ 1, 0 ], [ 1, 1 ] );

				syncClients();

				kate._processExecute( 'tableCellType', { value: 'header' } );
				john._processExecute( 'tableCellType', { value: 'header' } );

				syncClients();

				expectClients(
					modelTable( [
						[
							{ tableCellType: 'header', contents: '00' },
							{ tableCellType: 'header', contents: '01' }
						],
						[
							{ tableCellType: 'header', contents: '10' },
							{ tableCellType: 'header', contents: '12' }
						]
					], { headingRows: 2 } )
				);
			} );
		} );

		describe( 'setting whole column', () => {
			it( 'should work properly if john set cell type to header on whole column and ' +
					'kate set cell type to data on first cell at the same time (first column)', () => {
				const initialModel = modelTable( [
					[ '00', '01' ],
					[ '10[]', '12' ]
				] );

				john.setData( initialModel );
				kate.setData( initialModel );

				selectCells( john, [ 0, 0 ], [ 1, 0 ] );
				selectCells( kate, [ 0, 0 ], [ 0, 0 ] );

				syncClients();

				kate._processExecute( 'tableCellType', { value: 'data' } );
				john._processExecute( 'tableCellType', { value: 'header' } );

				syncClients();

				expectClients(
					modelTable( [
						[
							{ tableCellType: 'header', contents: '00' },
							'01'
						],
						[
							{ tableCellType: 'header', contents: '10' },
							'12'
						]
					], { headingColumns: 1 } )
				);
			} );

			it( 'should work properly if john set cell type to header on whole column and ' +
					'kate set cell type to data on first cell at the same time (second column)', () => {
				const initialModel = modelTable( [
					[ '00', '01' ],
					[ '10[]', '12' ]
				] );

				john.setData( initialModel );
				kate.setData( initialModel );

				selectCells( john, [ 0, 1 ], [ 1, 1 ] );
				selectCells( kate, [ 0, 1 ], [ 0, 1 ] );

				syncClients();

				kate._processExecute( 'tableCellType', { value: 'data' } );
				john._processExecute( 'tableCellType', { value: 'header' } );

				syncClients();

				expectClients(
					modelTable( [
						[
							'00',
							{ tableCellType: 'header', contents: '01' }
						],
						[
							'10',
							{ tableCellType: 'header', contents: '12' }
						]
					] )
				);
			} );

			it( 'should work properly if john set cell type to header on the first column and ' +
					'kate set cell type to header on second column at the same time', () => {
				const initialModel = modelTable( [
					[ '00', '01' ],
					[ '10[]', '12' ]
				] );

				john.setData( initialModel );
				kate.setData( initialModel );

				selectCells( john, [ 0, 0 ], [ 1, 0 ] );
				selectCells( kate, [ 0, 1 ], [ 1, 1 ] );

				syncClients();

				kate._processExecute( 'tableCellType', { value: 'header' } );
				john._processExecute( 'tableCellType', { value: 'header' } );

				syncClients();

				expectClients(
					modelTable( [
						[
							{ tableCellType: 'header', contents: '00' },
							{ tableCellType: 'header', contents: '01' }
						],
						[
							{ tableCellType: 'header', contents: '10' },
							{ tableCellType: 'header', contents: '12' }
						]
					], { headingColumns: 1, headingRows: 2 } )
				);
			} );
		} );
	} );
} );

function selectCells( client, start, end ) {
	const { model } = client.editor;
	const table = model.document.getRoot().getChild( 0 );

	const startCell = table.getChild( start[ 0 ] ).getChild( start[ 1 ] );
	const endCell = table.getChild( end[ 0 ] ).getChild( end[ 1 ] );

	const tableSelection = client.editor.plugins.get( 'TableSelection' );

	tableSelection.setCellSelection( startCell, endCell );
}
