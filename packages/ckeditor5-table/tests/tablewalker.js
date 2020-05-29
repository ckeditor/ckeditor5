/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

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

	function testWalker( tableData, expected, options, skip ) {
		setData( model, modelTable( tableData ) );

		const walker = new TableWalker( root.getChild( 0 ), options );

		if ( skip !== undefined ) {
			walker.skipRow( skip );
		}

		const result = [ ...walker ];

		const formattedResult = result.map( tableSlot => {
			const { cell, row, column, isAnchor, cellWidth, cellHeight, cellAnchorRow, cellAnchorColumn } = tableSlot;

			return {
				row,
				column,
				data: cell && cell.getChild( 0 ).getChild( 0 ).data,
				index: tableSlot.getPositionBefore().offset,
				...( cellAnchorRow != row ? { anchorRow: cellAnchorRow } : null ),
				...( cellAnchorColumn != column ? { anchorColumn: cellAnchorColumn } : null ),
				...( isAnchor ? { isAnchor } : null ),
				...( cellWidth > 1 ? { width: cellWidth } : null ),
				...( cellHeight > 1 ? { height: cellHeight } : null )
			};
		} );

		expect( formattedResult ).to.deep.equal( expected );
	}

	it( 'should iterate over a table', () => {
		// +----+----+
		// | 00 | 01 |
		// +----+----+
		// | 10 | 11 |
		// +----+----+
		testWalker( [
			[ '00', '01' ],
			[ '10', '11' ]
		], [
			{ row: 0, column: 0, index: 0, data: '00', isAnchor: true },
			{ row: 0, column: 1, index: 1, data: '01', isAnchor: true },
			{ row: 1, column: 0, index: 0, data: '10', isAnchor: true },
			{ row: 1, column: 1, index: 1, data: '11', isAnchor: true }
		] );
	} );

	it( 'should properly output column indexes of a table that has col-spans', () => {
		// +----+----+----+
		// | 00      | 13 |
		// +----+----+----+
		testWalker( [
			[ { colspan: 2, contents: '00' }, '13' ]
		], [
			{ row: 0, column: 0, index: 0, data: '00', isAnchor: true, width: 2 },
			{ row: 0, column: 2, index: 1, data: '13', isAnchor: true }
		] );
	} );

	it( 'should properly output column indexes of a table that has row-spans', () => {
		// +----+----+----+
		// | 00      | 02 |
		// +         +----+
		// |         | 12 |
		// +         +----+
		// |         | 22 |
		// +----+----+----+
		// | 30 | 31 | 32 |
		// +----+----+----+
		testWalker( [
			[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
			[ '12' ],
			[ '22' ],
			[ '30', '31', '32' ]
		], [
			{ row: 0, column: 0, index: 0, data: '00', isAnchor: true, width: 2, height: 3 },
			{ row: 0, column: 2, index: 1, data: '02', isAnchor: true },
			{ row: 1, column: 2, index: 0, data: '12', isAnchor: true },
			{ row: 2, column: 2, index: 0, data: '22', isAnchor: true },
			{ row: 3, column: 0, index: 0, data: '30', isAnchor: true },
			{ row: 3, column: 1, index: 1, data: '31', isAnchor: true },
			{ row: 3, column: 2, index: 2, data: '32', isAnchor: true }
		] );
	} );

	it( 'should properly output column indexes of a table that has multiple row-spans', () => {
		// +----+----+----+
		// | 11 | 12 | 13 |
		// +    +----+----+
		// |    | 22 | 23 |
		// +    +    +----+
		// |    |    | 33 |
		// +----+----+----+
		// | 41 | 42 | 43 |
		// +----+----+----+
		testWalker( [
			[ { rowspan: 3, contents: '11' }, '12', '13' ],
			[ { rowspan: 2, contents: '22' }, '23' ],
			[ '33' ],
			[ '41', '42', '43' ]
		], [
			{ row: 0, column: 0, index: 0, data: '11', isAnchor: true, height: 3 },
			{ row: 0, column: 1, index: 1, data: '12', isAnchor: true },
			{ row: 0, column: 2, index: 2, data: '13', isAnchor: true },
			{ row: 1, column: 1, index: 0, data: '22', isAnchor: true, height: 2 },
			{ row: 1, column: 2, index: 1, data: '23', isAnchor: true },
			{ row: 2, column: 2, index: 0, data: '33', isAnchor: true },
			{ row: 3, column: 0, index: 0, data: '41', isAnchor: true },
			{ row: 3, column: 1, index: 1, data: '42', isAnchor: true },
			{ row: 3, column: 2, index: 2, data: '43', isAnchor: true }
		] );
	} );

	describe( 'option.startRow', () => {
		it( 'should start iterating from given row but with cell spans properly calculated', () => {
			// +----+----+----+
			// | 11      | 13 |
			// +         +----+
			// |         | 23 |
			// +         +----+
			// |         | 33 |
			// +----+----+----+
			// | 41 | 42 | 43 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '11' }, '13' ],
				[ '23' ],
				[ '33' ],
				[ '41', '42', '43' ]
			], [
				{ row: 2, column: 2, index: 0, data: '33', isAnchor: true },
				{ row: 3, column: 0, index: 0, data: '41', isAnchor: true },
				{ row: 3, column: 1, index: 1, data: '42', isAnchor: true },
				{ row: 3, column: 2, index: 2, data: '43', isAnchor: true }
			], { startRow: 2 } );
		} );

		it( 'should start iterating from given row, includeAllSlots = true', () => {
			// +----+----+----+
			// | 11      | 13 |
			// +         +----+
			// |         | 23 |
			// +         +----+
			// |         | 33 |
			// +----+----+----+
			// | 41 | 42 | 43 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '11' }, '13' ],
				[ '23' ],
				[ '33' ],
				[ '41', '42', '43' ]
			], [
				{ row: 2, column: 0, index: 0, data: '11', width: 2, height: 3, anchorRow: 0 },
				{ row: 2, column: 1, index: 0, data: '11', width: 2, height: 3, anchorRow: 0, anchorColumn: 0 },
				{ row: 2, column: 2, index: 0, data: '33', isAnchor: true },
				{ row: 3, column: 0, index: 0, data: '41', isAnchor: true },
				{ row: 3, column: 1, index: 1, data: '42', isAnchor: true },
				{ row: 3, column: 2, index: 2, data: '43', isAnchor: true }
			], { startRow: 2, includeAllSlots: true } );
		} );
	} );

	describe( 'option.endRow', () => {
		it( 'should stop iterating after given row but with cell spans properly calculated', () => {
			// +----+----+----+
			// | 11      | 13 |
			// +         +----+
			// |         | 23 |
			// +         +----+
			// |         | 33 |
			// +----+----+----+
			// | 41 | 42 | 43 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '11' }, '13' ],
				[ '23' ],
				[ '33' ],
				[ '41', '42', '43' ]
			], [
				{ row: 0, column: 0, index: 0, data: '11', isAnchor: true, width: 2, height: 3 },
				{ row: 0, column: 2, index: 1, data: '13', isAnchor: true },
				{ row: 1, column: 2, index: 0, data: '23', isAnchor: true },
				{ row: 2, column: 2, index: 0, data: '33', isAnchor: true }
			], { endRow: 2 } );
		} );

		it( 'should iterate over given row only', () => {
			// +----+----+----+
			// | 11      | 13 |
			// +         +----+
			// |         | 23 |
			// +         +----+
			// |         | 33 |
			// +----+----+----+
			// | 41 | 42 | 43 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '11' }, '13' ],
				[ '23' ],
				[ '33' ],
				[ '41', '42', '43' ]
			], [
				{ row: 0, column: 0, index: 0, data: '11', isAnchor: true, width: 2, height: 3 },
				{ row: 0, column: 2, index: 1, data: '13', isAnchor: true }
			], { endRow: 0 } );
		} );

		it( 'should stop iterating after given row, includeAllSlots = true', () => {
			// +----+----+----+
			// | 11      | 13 |
			// +         +----+
			// |         | 23 |
			// +         +----+
			// |         | 33 |
			// +----+----+----+
			// | 41 | 42 | 43 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '11' }, '13' ],
				[ '23' ],
				[ '33' ],
				[ '41', '42', '43' ]
			], [
				{ row: 0, column: 0, index: 0, data: '11', width: 2, height: 3, isAnchor: true },
				{ row: 0, column: 1, index: 0, data: '11', width: 2, height: 3, anchorColumn: 0 },
				{ row: 0, column: 2, index: 1, data: '13', isAnchor: true },
				{ row: 1, column: 0, index: 0, data: '11', width: 2, height: 3, anchorRow: 0 },
				{ row: 1, column: 1, index: 0, data: '11', width: 2, height: 3, anchorRow: 0, anchorColumn: 0 },
				{ row: 1, column: 2, index: 0, data: '23', isAnchor: true }
			], { endRow: 1, includeAllSlots: true } );
		} );
	} );

	describe( 'options.row', () => {
		it( 'should iterate given row', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +         +----+
			// |         | 22 |
			// +----+----+----+
			// | 30 | 31 | 32 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 1, column: 2, index: 0, data: '12', isAnchor: true }
			], { row: 1 } );
		} );

		it( 'should iterate given row, includeAllSlots = true', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +         +----+
			// |         | 22 |
			// +----+----+----+
			// | 30 | 31 | 32 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 1, column: 0, index: 0, data: '00', width: 2, height: 3, anchorRow: 0 },
				{ row: 1, column: 1, index: 0, data: '00', width: 2, height: 3, anchorRow: 0, anchorColumn: 0 },
				{ row: 1, column: 2, index: 0, data: '12', isAnchor: true }
			], { row: 1, includeAllSlots: true } );
		} );
	} );

	describe( 'options.startColumn', () => {
		it( 'should not return the slots before startColumn', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +         +----+
			// |         | 22 |
			// +----+----+----+
			// | 30 | 31 | 32 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 0, column: 2, index: 1, data: '02', isAnchor: true },
				{ row: 1, column: 2, index: 0, data: '12', isAnchor: true },
				{ row: 2, column: 2, index: 0, data: '22', isAnchor: true },
				{ row: 3, column: 1, index: 1, data: '31', isAnchor: true },
				{ row: 3, column: 2, index: 2, data: '32', isAnchor: true }
			], { startColumn: 1 } );
		} );

		it( 'should not return the slots before startColumn, includeAllSlots = true', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +         +----+
			// |         | 22 |
			// +----+----+----+
			// | 30 | 31 | 32 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 0, column: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0 },
				{ row: 0, column: 2, index: 1, data: '02', isAnchor: true },
				{ row: 1, column: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0, anchorRow: 0 },
				{ row: 1, column: 2, index: 0, data: '12', isAnchor: true },
				{ row: 2, column: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0, anchorRow: 0 },
				{ row: 2, column: 2, index: 0, data: '22', isAnchor: true },
				{ row: 3, column: 1, index: 1, data: '31', isAnchor: true },
				{ row: 3, column: 2, index: 2, data: '32', isAnchor: true }
			], { startColumn: 1, includeAllSlots: true } );
		} );
	} );

	describe( 'options.endColumn', () => {
		it( 'should not return the slots after endColumn', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +         +----+
			// |         | 22 |
			// +----+----+----+
			// | 30 | 31 | 32 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 0, column: 0, index: 0, data: '00', isAnchor: true, width: 2, height: 3 },
				{ row: 3, column: 0, index: 0, data: '30', isAnchor: true },
				{ row: 3, column: 1, index: 1, data: '31', isAnchor: true }
			], { endColumn: 1 } );
		} );

		it( 'should not return the slots after endColumn, includeAllSlots = true', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +         +----+
			// |         | 22 |
			// +----+----+----+
			// | 30 | 31 | 32 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 0, column: 0, index: 0, data: '00', width: 2, height: 3, isAnchor: true },
				{ row: 0, column: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0 },
				{ row: 1, column: 0, index: 0, data: '00', width: 2, height: 3, anchorRow: 0 },
				{ row: 1, column: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0, anchorRow: 0 },
				{ row: 2, column: 0, index: 0, data: '00', width: 2, height: 3, anchorRow: 0 },
				{ row: 2, column: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0, anchorRow: 0 },
				{ row: 3, column: 0, index: 0, data: '30', isAnchor: true },
				{ row: 3, column: 1, index: 1, data: '31', isAnchor: true }
			], { endColumn: 1, includeAllSlots: true } );
		} );
	} );

	describe( 'options.column', () => {
		it( 'should return the slots from given column', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +         +----+
			// |         | 22 |
			// +----+----+----+
			// | 30 | 31 | 32 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 3, column: 1, index: 1, data: '31', isAnchor: true }
			], { column: 1 } );
		} );

		it( 'should return the slots from given column, includeAllSlots = true', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +         +----+
			// |         | 22 |
			// +----+----+----+
			// | 30 | 31 | 32 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 0, column: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0 },
				{ row: 1, column: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0, anchorRow: 0 },
				{ row: 2, column: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0, anchorRow: 0 },
				{ row: 3, column: 1, index: 1, data: '31', isAnchor: true }
			], { column: 1, includeAllSlots: true } );
		} );
	} );

	describe( 'option.includeAllSlots', () => {
		it( 'should output spanned cells at the end of a table', () => {
			// +----+----+
			// | 00 | 01 |
			// +----+    +
			// | 10 |    |
			// +----+----+
			testWalker( [
				[ '00', { rowspan: 2, contents: '01' } ],
				[ '10' ]
			], [
				{ row: 0, column: 0, index: 0, data: '00', isAnchor: true },
				{ row: 0, column: 1, index: 1, data: '01', isAnchor: true, height: 2 },
				{ row: 1, column: 0, index: 0, data: '10', isAnchor: true },
				{ row: 1, column: 1, index: 1, data: '01', anchorRow: 0, height: 2 }
			], { includeAllSlots: true } );
		} );

		it( 'should output spanned cells', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +         +----+
			// |         | 22 |
			// +----+----+----+
			// | 30 | 31      |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', { colspan: 2, contents: '31' } ]
			], [
				{ row: 0, column: 0, index: 0, data: '00', width: 2, height: 3, isAnchor: true },
				{ row: 0, column: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0 },
				{ row: 0, column: 2, index: 1, data: '02', isAnchor: true },
				{ row: 1, column: 0, index: 0, data: '00', width: 2, height: 3, anchorRow: 0 },
				{ row: 1, column: 1, index: 0, data: '00', width: 2, height: 3, anchorRow: 0, anchorColumn: 0 },
				{ row: 1, column: 2, index: 0, data: '12', isAnchor: true },
				{ row: 2, column: 0, index: 0, data: '00', width: 2, height: 3, anchorRow: 0 },
				{ row: 2, column: 1, index: 0, data: '00', width: 2, height: 3, anchorRow: 0, anchorColumn: 0 },
				{ row: 2, column: 2, index: 0, data: '22', isAnchor: true },
				{ row: 3, column: 0, index: 0, data: '30', isAnchor: true },
				{ row: 3, column: 1, index: 1, data: '31', width: 2, isAnchor: true },
				{ row: 3, column: 2, index: 1, data: '31', width: 2, anchorColumn: 1 }
			], { includeAllSlots: true } );
		} );

		it( 'should output rowspanned cells at the end of a table row', () => {
			// +----+----+
			// | 00 | 01 |
			// +----+    +
			// | 10 |    |
			// +----+----+
			testWalker( [
				[ '00', { rowspan: 2, contents: '01' } ],
				[ '10' ]
			], [
				{ row: 0, column: 0, index: 0, data: '00', isAnchor: true },
				{ row: 0, column: 1, index: 1, data: '01', isAnchor: true, height: 2 },
				{ row: 1, column: 0, index: 0, data: '10', isAnchor: true },
				{ row: 1, column: 1, index: 1, data: '01', anchorRow: 0, height: 2 }
			], { includeAllSlots: true } );
		} );

		it( 'should work with startRow & endRow options', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +         +----+
			// |         | 22 |
			// +----+----+----+
			// | 30 | 31 | 32 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 1, column: 0, index: 0, data: '00', anchorRow: 0, width: 2, height: 3 },
				{ row: 1, column: 1, index: 0, data: '00', anchorRow: 0, width: 2, height: 3, anchorColumn: 0 },
				{ row: 1, column: 2, index: 0, data: '12', isAnchor: true },
				{ row: 2, column: 0, index: 0, data: '00', anchorRow: 0, width: 2, height: 3 },
				{ row: 2, column: 1, index: 0, data: '00', anchorRow: 0, width: 2, height: 3, anchorColumn: 0 },
				{ row: 2, column: 2, index: 0, data: '22', isAnchor: true }
			], { includeAllSlots: true, startRow: 1, endRow: 2 } );
		} );

		it( 'should output row-spanned cells at the end of a table row with startRow & endRow options', () => {
			// +----+----+
			// | 00 | 01 |
			// +----+    +
			// | 10 |    |
			// +----+----+
			// | 20 | 21 |
			// +----+----+
			testWalker( [
				[ '00', { rowspan: 2, contents: '01' } ],
				[ '10' ],
				[ '20', '21' ]
			], [
				{ row: 0, column: 0, index: 0, data: '00', isAnchor: true },
				{ row: 0, column: 1, index: 1, data: '01', isAnchor: true, height: 2 },
				{ row: 1, column: 0, index: 0, data: '10', isAnchor: true },
				{ row: 1, column: 1, index: 1, data: '01', anchorRow: 0, height: 2 }
			], { startRow: 0, endRow: 1, includeAllSlots: true } );
		} );
	} );

	describe( '#skipRow()', () => {
		it( 'should skip row', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +         +----+
			// |         | 22 |
			// +----+----+----+
			// | 30 | 31 | 32 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 0, column: 0, index: 0, data: '00', isAnchor: true, width: 2, height: 3 },
				{ row: 0, column: 2, index: 1, data: '02', isAnchor: true },
				{ row: 2, column: 2, index: 0, data: '22', isAnchor: true },
				{ row: 3, column: 0, index: 0, data: '30', isAnchor: true },
				{ row: 3, column: 1, index: 1, data: '31', isAnchor: true },
				{ row: 3, column: 2, index: 2, data: '32', isAnchor: true }
			], {}, 1 );
		} );

		it( 'should skip row, includeAllSlots = true', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +         +----+
			// |         | 22 |
			// +----+----+----+
			// | 30 | 31 | 32 |
			// +----+----+----+
			testWalker( [
				[ { colspan: 2, rowspan: 3, contents: '00' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			], [
				{ row: 0, column: 0, index: 0, data: '00', width: 2, height: 3, isAnchor: true },
				{ row: 0, column: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0 },
				{ row: 0, column: 2, index: 1, data: '02', isAnchor: true },
				{ row: 2, column: 0, index: 0, data: '00', width: 2, height: 3, anchorRow: 0 },
				{ row: 2, column: 1, index: 0, data: '00', width: 2, height: 3, anchorRow: 0, anchorColumn: 0 },
				{ row: 2, column: 2, index: 0, data: '22', isAnchor: true },
				{ row: 3, column: 0, index: 0, data: '30', isAnchor: true },
				{ row: 3, column: 1, index: 1, data: '31', isAnchor: true },
				{ row: 3, column: 2, index: 2, data: '32', isAnchor: true }
			], { includeAllSlots: true }, 1 );
		} );
	} );

	it( 'should throw error if walker value old api used', () => {
		setData( model, modelTable( [
			[ 'a' ]
		] ) );

		const walker = new TableWalker( root.getChild( 0 ) );

		const { value } = walker.next();

		expect( () => value.isSpanned ).to.throw( CKEditorError, 'improper-api-usage' );
		expect( () => value.colspan ).to.throw( CKEditorError, 'improper-api-usage' );
		expect( () => value.rowspan ).to.throw( CKEditorError, 'improper-api-usage' );
	} );
} );
