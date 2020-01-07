/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';

import { defaultConversion, defaultSchema, modelTable } from './_utils/utils';

import TableWalker from '../src/tablewalker';

describe( 'TableWalker', () => {
	let editor, model, doc, root;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				root = doc.getRoot( 'main' );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
	} );

	function testWalker( tableData, expected, options ) {
		setData( model, modelTable( tableData ) );

		const iterator = new TableWalker( root.getChild( 0 ), options );

		const result = [];

		for ( const tableInfo of iterator ) {
			result.push( tableInfo );
		}

		const formattedResult = result.map( ( { row, column, isSpanned, cell, cellIndex } ) => {
			const result = {
				row,
				column,
				data: cell && cell.getChild( 0 ).getChild( 0 ).data,
				index: cellIndex
			};

			if ( isSpanned ) {
				result.isSpanned = true;
			}

			return result;
		} );

		expect( formattedResult ).to.deep.equal( expected );
	}

	it( 'should iterate over a table', () => {
		testWalker( [
			[ '00', '01' ],
			[ '10', '11' ]
		], [
			{ row: 0, column: 0, index: 0, data: '00' },
			{ row: 0, column: 1, index: 1, data: '01' },
			{ row: 1, column: 0, index: 0, data: '10' },
			{ row: 1, column: 1, index: 1, data: '11' }
		] );
	} );

	it( 'should properly output column indexes of a table that has colspans', () => {
		testWalker( [
			[ { colspan: 2, contents: '00' }, '13' ]
		], [
			{ row: 0, column: 0, index: 0, data: '00' },
			{ row: 0, column: 2, index: 1, data: '13' }
		] );
	} );

	it( 'should properly output column indexes of a table that has rowspans', () => {
		testWalker( [
			[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
			[ '12' ],
			[ '22' ],
			[ '30', '31', '32' ]
		], [
			{ row: 0, column: 0, index: 0, data: '00' },
			{ row: 0, column: 2, index: 1, data: '02' },
			{ row: 1, column: 2, index: 0, data: '12' },
			{ row: 2, column: 2, index: 0, data: '22' },
			{ row: 3, column: 0, index: 0, data: '30' },
			{ row: 3, column: 1, index: 1, data: '31' },
			{ row: 3, column: 2, index: 2, data: '32' }
		] );
	} );

	it( 'should properly output column indexes of a table that has multiple rowspans', () => {
		testWalker( [
			[ { rowspan: 3, contents: '11' }, '12', '13' ],
			[ { rowspan: 2, contents: '22' }, '23' ],
			[ '33' ],
			[ '41', '42', '43' ]
		], [
			{ row: 0, column: 0, index: 0, data: '11' },
			{ row: 0, column: 1, index: 1, data: '12' },
			{ row: 0, column: 2, index: 2, data: '13' },
			{ row: 1, column: 1, index: 0, data: '22' },
			{ row: 1, column: 2, index: 1, data: '23' },
			{ row: 2, column: 2, index: 0, data: '33' },
			{ row: 3, column: 0, index: 0, data: '41' },
			{ row: 3, column: 1, index: 1, data: '42' },
			{ row: 3, column: 2, index: 2, data: '43' }
		] );
	} );

	describe( 'option.startRow', () => {
		it( 'should start iterating from given row but with cell spans properly calculated', () => {
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '11' }, '13' ],
				[ '23' ],
				[ '33' ],
				[ '41', '42', '43' ]
			], [
				{ row: 2, column: 2, index: 0, data: '33' },
				{ row: 3, column: 0, index: 0, data: '41' },
				{ row: 3, column: 1, index: 1, data: '42' },
				{ row: 3, column: 2, index: 2, data: '43' }
			], { startRow: 2 } );
		} );
	} );

	describe( 'option.endRow', () => {
		it( 'should stopp iterating after given row but with cell spans properly calculated', () => {
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '11' }, '13' ],
				[ '23' ],
				[ '33' ],
				[ '41', '42', '43' ]
			], [
				{ row: 0, column: 0, index: 0, data: '11' },
				{ row: 0, column: 2, index: 1, data: '13' },
				{ row: 1, column: 2, index: 0, data: '23' },
				{ row: 2, column: 2, index: 0, data: '33' }
			], { endRow: 2 } );
		} );

		it( 'should iterate over given row only', () => {
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '11' }, '13' ],
				[ '23' ],
				[ '33' ],
				[ '41', '42', '43' ]
			], [
				{ row: 0, column: 0, index: 0, data: '11' },
				{ row: 0, column: 2, index: 1, data: '13' }
			], { endRow: 0 } );
		} );
	} );

	describe( 'option.includeSpanned', () => {
		it( 'should output spanned cells at the end of a table', () => {
			testWalker( [
				[ '00', { rowspan: 2, contents: '01' } ],
				[ '10' ]
			], [
				{ row: 0, column: 0, index: 0, data: '00' },
				{ row: 0, column: 1, index: 1, data: '01' },
				{ row: 1, column: 0, index: 0, data: '10' },
				{ row: 1, column: 1, index: 1, data: '01', isSpanned: true }
			], { includeSpanned: true } );
		} );

		it( 'should output spanned cells', () => {
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', { colspan: 2, contents: '31' } ]
			], [
				{ row: 0, column: 0, index: 0, data: '00' },
				{ row: 0, column: 1, index: 0, data: '00', isSpanned: true },
				{ row: 0, column: 2, index: 1, data: '02' },
				{ row: 1, column: 0, index: 0, data: '00', isSpanned: true },
				{ row: 1, column: 1, index: 0, data: '00', isSpanned: true },
				{ row: 1, column: 2, index: 0, data: '12' },
				{ row: 2, column: 0, index: 0, data: '00', isSpanned: true },
				{ row: 2, column: 1, index: 0, data: '00', isSpanned: true },
				{ row: 2, column: 2, index: 0, data: '22' },
				{ row: 3, column: 0, index: 0, data: '30' },
				{ row: 3, column: 1, index: 1, data: '31' },
				{ row: 3, column: 2, index: 1, data: '31', isSpanned: true }
			], { includeSpanned: true } );
		} );

		it( 'should output rowspanned cells at the end of a table row', () => {
			testWalker( [
				[ '00', { rowspan: 2, contents: '01' } ],
				[ '10' ]
			], [
				{ row: 0, column: 0, index: 0, data: '00' },
				{ row: 0, column: 1, index: 1, data: '01' },
				{ row: 1, column: 0, index: 0, data: '10' },
				{ row: 1, column: 1, index: 1, data: '01', isSpanned: true }
			], { includeSpanned: true } );
		} );

		it( 'should work with startRow & endRow options', () => {
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 1, column: 0, index: 0, data: '00', isSpanned: true },
				{ row: 1, column: 1, index: 0, data: '00', isSpanned: true },
				{ row: 1, column: 2, index: 0, data: '12' },
				{ row: 2, column: 0, index: 0, data: '00', isSpanned: true },
				{ row: 2, column: 1, index: 0, data: '00', isSpanned: true },
				{ row: 2, column: 2, index: 0, data: '22' }
			], { includeSpanned: true, startRow: 1, endRow: 2 } );
		} );

		it( 'should output rowspanned cells at the end of a table row with startRow & endRow options', () => {
			testWalker( [
				[ '00', { rowspan: 2, contents: '01' } ],
				[ '10' ],
				[ '20', '21' ]
			], [
				{ row: 0, column: 0, index: 0, data: '00' },
				{ row: 0, column: 1, index: 1, data: '01' },
				{ row: 1, column: 0, index: 0, data: '10' },
				{ row: 1, column: 1, index: 1, data: '01', isSpanned: true }
			], { startRow: 0, endRow: 1, includeSpanned: true } );
		} );
	} );

	describe( 'options.startColumn', () => {
		it( 'should output only cells on given column', () => {
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 3, column: 1, index: 1, data: '31' }
			], { column: 1 } );
		} );

		it( 'should output only cells on given column, includeSpanned = true', () => {
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 0, column: 1, index: 0, data: '00', isSpanned: true },
				{ row: 1, column: 1, index: 0, data: '00', isSpanned: true },
				{ row: 2, column: 1, index: 0, data: '00', isSpanned: true },
				{ row: 3, column: 1, index: 1, data: '31' }
			], { column: 1, includeSpanned: true } );
		} );
	} );
} );
