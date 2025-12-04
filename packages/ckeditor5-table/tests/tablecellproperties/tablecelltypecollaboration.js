/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// eslint-disable-next-line ckeditor5-rules/allow-imports-only-from-main-package-entry-point
import { Client, clearBuffer, expectClients, syncClients } from '@ckeditor/ckeditor5-engine/tests/model/operation/transform/utils.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { TableCellPropertiesEditing } from '../../src/tablecellproperties/tablecellpropertiesediting.js';
import { TableEditing } from '../../src/tableediting.js';
import { modelTable } from '../_utils/utils.js';

describe( 'collaboration', () => {
	let john, kate;

	beforeEach( async () => {
		const editorConfig = {
			plugins: [ TableEditing, TableCellPropertiesEditing, Paragraph ],
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

	it( 'should work properly if only one user sets header row', () => {
		const initialModel = modelTable( [
			[ '00[]', '1' ],
			[ '10', '12' ]
		] );

		john.setData( initialModel );
		kate.setData( initialModel );

		john.setSelection( [ 0, 0, 0, 0 ], [ 0, 0, 0, 1 ], { bufferOperations: true } );

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

		john.setSelection( [ 0, 0, 0, 0 ], [ 0, 0, 0, 1 ], { bufferOperations: true } );
		kate.setSelection( [ 0, 0, 0, 0 ], [ 0, 0, 0, 1 ], { bufferOperations: true } );

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

	// FIXME
	it.skip( 'should work properly if one user sets header row on first row and another on the second row at the same time', () => {
		const initialModel = modelTable( [
			[ '00[]', '1' ],
			[ '10', '12' ]
		] );

		john.setData( initialModel );
		kate.setData( initialModel );

		john.setSelection( [ 0, 0, 0, 0 ], [ 0, 0, 0, 1 ], { bufferOperations: true } );
		kate.setSelection( [ 0, 1, 0, 0 ], [ 0, 1, 0, 1 ], { bufferOperations: true } );

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
