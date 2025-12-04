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
// import { _getModelData } from '@ckeditor/ckeditor5-engine';

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
					[ '10', '12' ],
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
				], { headingColumns: 2 } )
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
					[ '00', '01' ],
					[ '10', '12' ],
					[ '20', '22' ]
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
