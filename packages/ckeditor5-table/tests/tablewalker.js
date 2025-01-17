/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';
import { setData, parse } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TableWalker from '../src/tablewalker.js';
import TableEditing from '../src/tableediting.js';
import { modelTable } from './_utils/utils.js';

describe( 'TableWalker', () => {
	let editor, model, doc, root;

	beforeEach( () => {
		return ModelTestEditor.create( { plugins: [ Paragraph, TableEditing ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				root = doc.getRoot( 'main' );
			} );
	} );

	function testWalker( tableData, expected, options, skip ) {
		// Accept either a table of cells or a HTML-like string describing model.
		const modelData = Array.isArray( tableData ) ? modelTable( tableData ) : tableData;

		setData( model, modelData );

		const walker = new TableWalker( root.getChild( 0 ), options );

		if ( skip !== undefined ) {
			walker.skipRow( skip );
		}

		const result = [ ...walker ];

		const formattedResult = result.map( tableSlot => {
			const { cell, row, column, rowIndex, isAnchor, cellWidth, cellHeight, cellAnchorRow, cellAnchorColumn } = tableSlot;

			return {
				row,
				column,
				rowIndex,
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
			{ row: 0, column: 0, rowIndex: 0, index: 0, data: '00', isAnchor: true },
			{ row: 0, column: 1, rowIndex: 0, index: 1, data: '01', isAnchor: true },
			{ row: 1, column: 0, rowIndex: 1, index: 0, data: '10', isAnchor: true },
			{ row: 1, column: 1, rowIndex: 1, index: 1, data: '11', isAnchor: true }
		] );
	} );

	it( 'should properly output column indexes of a table that has col-spans', () => {
		// +----+----+----+
		// | 00      | 13 |
		// +----+----+----+
		testWalker( [
			[ { colspan: 2, contents: '00' }, '13' ]
		], [
			{ row: 0, column: 0, rowIndex: 0, index: 0, data: '00', isAnchor: true, width: 2 },
			{ row: 0, column: 2, rowIndex: 0, index: 1, data: '13', isAnchor: true }
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
			{ row: 0, column: 0, rowIndex: 0, index: 0, data: '00', isAnchor: true, width: 2, height: 3 },
			{ row: 0, column: 2, rowIndex: 0, index: 1, data: '02', isAnchor: true },
			{ row: 1, column: 2, rowIndex: 1, index: 0, data: '12', isAnchor: true },
			{ row: 2, column: 2, rowIndex: 2, index: 0, data: '22', isAnchor: true },
			{ row: 3, column: 0, rowIndex: 3, index: 0, data: '30', isAnchor: true },
			{ row: 3, column: 1, rowIndex: 3, index: 1, data: '31', isAnchor: true },
			{ row: 3, column: 2, rowIndex: 3, index: 2, data: '32', isAnchor: true }
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
			{ row: 0, column: 0, rowIndex: 0, index: 0, data: '11', isAnchor: true, height: 3 },
			{ row: 0, column: 1, rowIndex: 0, index: 1, data: '12', isAnchor: true },
			{ row: 0, column: 2, rowIndex: 0, index: 2, data: '13', isAnchor: true },
			{ row: 1, column: 1, rowIndex: 1, index: 0, data: '22', isAnchor: true, height: 2 },
			{ row: 1, column: 2, rowIndex: 1, index: 1, data: '23', isAnchor: true },
			{ row: 2, column: 2, rowIndex: 2, index: 0, data: '33', isAnchor: true },
			{ row: 3, column: 0, rowIndex: 3, index: 0, data: '41', isAnchor: true },
			{ row: 3, column: 1, rowIndex: 3, index: 1, data: '42', isAnchor: true },
			{ row: 3, column: 2, rowIndex: 3, index: 2, data: '43', isAnchor: true }
		] );
	} );

	it( 'should iterate over a table, but ignore non-row elements', () => {
		model.schema.register( 'foo', {
			allowIn: 'table',
			allowContentOf: '$block',
			isLimit: true
		} );

		// +----+----+
		// | 00 | 01 |
		// +----+----+
		// |  <foo>  |
		// +----+----+
		// | 10 | 11 |
		// +---------+
		const modelTable =
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph>00</paragraph></tableCell>' +
					'<tableCell><paragraph>01</paragraph></tableCell>' +
				'</tableRow>' +
				'<foo>An extra element</foo>' +
				'<tableRow>' +
					'<tableCell><paragraph>[]10</paragraph></tableCell>' +
					'<tableCell><paragraph>11</paragraph></tableCell>' +
				'</tableRow>' +
			'</table>';

		const parsed = parse( modelTable, model.schema );

		// We don't want post-fixers to be applied here, as the TableWalker can be used inside them,
		// when the structure of the table is not yet corrected.
		const tableWalker = Array.from( new TableWalker( parsed.model ) );

		expect( tableWalker.length ).to.equal( 4 );

		expect( tableWalker[ 0 ].row ).to.equal( 0 );
		expect( tableWalker[ 0 ].column ).to.equal( 0 );
		expect( tableWalker[ 0 ].rowIndex ).to.equal( 0 );

		expect( tableWalker[ 1 ].row ).to.equal( 0 );
		expect( tableWalker[ 1 ].column ).to.equal( 1 );
		expect( tableWalker[ 1 ].rowIndex ).to.equal( 0 );

		expect( tableWalker[ 2 ].row ).to.equal( 1 );
		expect( tableWalker[ 2 ].column ).to.equal( 0 );
		expect( tableWalker[ 2 ].rowIndex ).to.equal( 2 );

		expect( tableWalker[ 3 ].row ).to.equal( 1 );
		expect( tableWalker[ 3 ].column ).to.equal( 1 );
		expect( tableWalker[ 3 ].rowIndex ).to.equal( 2 );
	} );

	it( 'does not cause the "RangeError: Maximum call stack size exceeded" error when handling big tables. ', () => {
		const data = Array( 3000 ).fill( [ '1', 'Example content', '3' ] );
		const table = parse(
			modelTable( data ),
			model.schema
		);

		function getAllItems() {
			return Array.from(
				new TableWalker( table, { row: 2999 } )
			);
		}

		expect( getAllItems ).to.not.throw( RangeError, 'Maximum call stack size exceeded' );
	} ).timeout( 5000 );

	it( 'does not cause the "RangeError: Maximum call stack size exceeded" error when handling big tables with rowspan. ', () => {
		const data = [
			...Array( 2000 ).fill( [ '1', 'Example content', '3' ] ),
			[ '1', { contents: 'Cell with rowspan', rowspan: 1000 }, '3' ],
			...Array( 999 ).fill( [ '1', '3' ] )
		];

		const table = parse(
			modelTable( data ),
			model.schema
		);

		function getAllItems() {
			return Array.from(
				new TableWalker( table, { row: 2999 } )
			);
		}

		expect( getAllItems ).to.not.throw( RangeError, 'Maximum call stack size exceeded' );
	} ).timeout( 5000 );

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
				{ row: 2, column: 2, rowIndex: 2, index: 0, data: '33', isAnchor: true },
				{ row: 3, column: 0, rowIndex: 3, index: 0, data: '41', isAnchor: true },
				{ row: 3, column: 1, rowIndex: 3, index: 1, data: '42', isAnchor: true },
				{ row: 3, column: 2, rowIndex: 3, index: 2, data: '43', isAnchor: true }
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
				{ row: 2, column: 0, rowIndex: 2, index: 0, data: '11', width: 2, height: 3, anchorRow: 0 },
				{ row: 2, column: 1, rowIndex: 2, index: 0, data: '11', width: 2, height: 3, anchorRow: 0, anchorColumn: 0 },
				{ row: 2, column: 2, rowIndex: 2, index: 0, data: '33', isAnchor: true },
				{ row: 3, column: 0, rowIndex: 3, index: 0, data: '41', isAnchor: true },
				{ row: 3, column: 1, rowIndex: 3, index: 1, data: '42', isAnchor: true },
				{ row: 3, column: 2, rowIndex: 3, index: 2, data: '43', isAnchor: true }
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
				{ row: 0, column: 0, rowIndex: 0, index: 0, data: '11', isAnchor: true, width: 2, height: 3 },
				{ row: 0, column: 2, rowIndex: 0, index: 1, data: '13', isAnchor: true },
				{ row: 1, column: 2, rowIndex: 1, index: 0, data: '23', isAnchor: true },
				{ row: 2, column: 2, rowIndex: 2, index: 0, data: '33', isAnchor: true }
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
				{ row: 0, column: 0, rowIndex: 0, index: 0, data: '11', isAnchor: true, width: 2, height: 3 },
				{ row: 0, column: 2, rowIndex: 0, index: 1, data: '13', isAnchor: true }
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
				{ row: 0, column: 0, rowIndex: 0, index: 0, data: '11', width: 2, height: 3, isAnchor: true },
				{ row: 0, column: 1, rowIndex: 0, index: 0, data: '11', width: 2, height: 3, anchorColumn: 0 },
				{ row: 0, column: 2, rowIndex: 0, index: 1, data: '13', isAnchor: true },
				{ row: 1, column: 0, rowIndex: 1, index: 0, data: '11', width: 2, height: 3, anchorRow: 0 },
				{ row: 1, column: 1, rowIndex: 1, index: 0, data: '11', width: 2, height: 3, anchorRow: 0, anchorColumn: 0 },
				{ row: 1, column: 2, rowIndex: 1, index: 0, data: '23', isAnchor: true }
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
				{ row: 1, column: 2, rowIndex: 1, index: 0, data: '12', isAnchor: true }
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
				{ row: 1, column: 0, rowIndex: 1, index: 0, data: '00', width: 2, height: 3, anchorRow: 0 },
				{ row: 1, column: 1, rowIndex: 1, index: 0, data: '00', width: 2, height: 3, anchorRow: 0, anchorColumn: 0 },
				{ row: 1, column: 2, rowIndex: 1, index: 0, data: '12', isAnchor: true }
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
				{ row: 0, column: 2, rowIndex: 0, index: 1, data: '02', isAnchor: true },
				{ row: 1, column: 2, rowIndex: 1, index: 0, data: '12', isAnchor: true },
				{ row: 2, column: 2, rowIndex: 2, index: 0, data: '22', isAnchor: true },
				{ row: 3, column: 1, rowIndex: 3, index: 1, data: '31', isAnchor: true },
				{ row: 3, column: 2, rowIndex: 3, index: 2, data: '32', isAnchor: true }
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
				{ row: 0, column: 1, rowIndex: 0, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0 },
				{ row: 0, column: 2, rowIndex: 0, index: 1, data: '02', isAnchor: true },
				{ row: 1, column: 1, rowIndex: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0, anchorRow: 0 },
				{ row: 1, column: 2, rowIndex: 1, index: 0, data: '12', isAnchor: true },
				{ row: 2, column: 1, rowIndex: 2, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0, anchorRow: 0 },
				{ row: 2, column: 2, rowIndex: 2, index: 0, data: '22', isAnchor: true },
				{ row: 3, column: 1, rowIndex: 3, index: 1, data: '31', isAnchor: true },
				{ row: 3, column: 2, rowIndex: 3, index: 2, data: '32', isAnchor: true }
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
				{ row: 0, column: 0, rowIndex: 0, index: 0, data: '00', isAnchor: true, width: 2, height: 3 },
				{ row: 3, column: 0, rowIndex: 3, index: 0, data: '30', isAnchor: true },
				{ row: 3, column: 1, rowIndex: 3, index: 1, data: '31', isAnchor: true }
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
				{ row: 0, column: 0, rowIndex: 0, index: 0, data: '00', width: 2, height: 3, isAnchor: true },
				{ row: 0, column: 1, rowIndex: 0, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0 },
				{ row: 1, column: 0, rowIndex: 1, index: 0, data: '00', width: 2, height: 3, anchorRow: 0 },
				{ row: 1, column: 1, rowIndex: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0, anchorRow: 0 },
				{ row: 2, column: 0, rowIndex: 2, index: 0, data: '00', width: 2, height: 3, anchorRow: 0 },
				{ row: 2, column: 1, rowIndex: 2, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0, anchorRow: 0 },
				{ row: 3, column: 0, rowIndex: 3, index: 0, data: '30', isAnchor: true },
				{ row: 3, column: 1, rowIndex: 3, index: 1, data: '31', isAnchor: true }
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
				{ row: 3, column: 1, rowIndex: 3, index: 1, data: '31', isAnchor: true }
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
				{ row: 0, column: 1, rowIndex: 0, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0 },
				{ row: 1, column: 1, rowIndex: 1, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0, anchorRow: 0 },
				{ row: 2, column: 1, rowIndex: 2, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0, anchorRow: 0 },
				{ row: 3, column: 1, rowIndex: 3, index: 1, data: '31', isAnchor: true }
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
				{ row: 0, column: 0, rowIndex: 0, index: 0, data: '00', isAnchor: true },
				{ row: 0, column: 1, rowIndex: 0, index: 1, data: '01', isAnchor: true, height: 2 },
				{ row: 1, column: 0, rowIndex: 1, index: 0, data: '10', isAnchor: true },
				{ row: 1, column: 1, rowIndex: 1, index: 1, data: '01', anchorRow: 0, height: 2 }
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
				{ row: 0, column: 0, rowIndex: 0, index: 0, data: '00', width: 2, height: 3, isAnchor: true },
				{ row: 0, column: 1, rowIndex: 0, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0 },
				{ row: 0, column: 2, rowIndex: 0, index: 1, data: '02', isAnchor: true },
				{ row: 1, column: 0, rowIndex: 1, index: 0, data: '00', width: 2, height: 3, anchorRow: 0 },
				{ row: 1, column: 1, rowIndex: 1, index: 0, data: '00', width: 2, height: 3, anchorRow: 0, anchorColumn: 0 },
				{ row: 1, column: 2, rowIndex: 1, index: 0, data: '12', isAnchor: true },
				{ row: 2, column: 0, rowIndex: 2, index: 0, data: '00', width: 2, height: 3, anchorRow: 0 },
				{ row: 2, column: 1, rowIndex: 2, index: 0, data: '00', width: 2, height: 3, anchorRow: 0, anchorColumn: 0 },
				{ row: 2, column: 2, rowIndex: 2, index: 0, data: '22', isAnchor: true },
				{ row: 3, column: 0, rowIndex: 3, index: 0, data: '30', isAnchor: true },
				{ row: 3, column: 1, rowIndex: 3, index: 1, data: '31', width: 2, isAnchor: true },
				{ row: 3, column: 2, rowIndex: 3, index: 1, data: '31', width: 2, anchorColumn: 1 }
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
				{ row: 0, column: 0, rowIndex: 0, index: 0, data: '00', isAnchor: true },
				{ row: 0, column: 1, rowIndex: 0, index: 1, data: '01', isAnchor: true, height: 2 },
				{ row: 1, column: 0, rowIndex: 1, index: 0, data: '10', isAnchor: true },
				{ row: 1, column: 1, rowIndex: 1, index: 1, data: '01', anchorRow: 0, height: 2 }
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
				{ row: 1, column: 0, rowIndex: 1, index: 0, data: '00', anchorRow: 0, width: 2, height: 3 },
				{ row: 1, column: 1, rowIndex: 1, index: 0, data: '00', anchorRow: 0, width: 2, height: 3, anchorColumn: 0 },
				{ row: 1, column: 2, rowIndex: 1, index: 0, data: '12', isAnchor: true },
				{ row: 2, column: 0, rowIndex: 2, index: 0, data: '00', anchorRow: 0, width: 2, height: 3 },
				{ row: 2, column: 1, rowIndex: 2, index: 0, data: '00', anchorRow: 0, width: 2, height: 3, anchorColumn: 0 },
				{ row: 2, column: 2, rowIndex: 2, index: 0, data: '22', isAnchor: true }
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
				{ row: 0, column: 0, rowIndex: 0, index: 0, data: '00', isAnchor: true },
				{ row: 0, column: 1, rowIndex: 0, index: 1, data: '01', isAnchor: true, height: 2 },
				{ row: 1, column: 0, rowIndex: 1, index: 0, data: '10', isAnchor: true },
				{ row: 1, column: 1, rowIndex: 1, index: 1, data: '01', anchorRow: 0, height: 2 }
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
				{ row: 0, column: 0, rowIndex: 0, index: 0, data: '00', isAnchor: true, width: 2, height: 3 },
				{ row: 0, column: 2, rowIndex: 0, index: 1, data: '02', isAnchor: true },
				{ row: 2, column: 2, rowIndex: 2, index: 0, data: '22', isAnchor: true },
				{ row: 3, column: 0, rowIndex: 3, index: 0, data: '30', isAnchor: true },
				{ row: 3, column: 1, rowIndex: 3, index: 1, data: '31', isAnchor: true },
				{ row: 3, column: 2, rowIndex: 3, index: 2, data: '32', isAnchor: true }
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
				{ row: 0, column: 0, rowIndex: 0, index: 0, data: '00', width: 2, height: 3, isAnchor: true },
				{ row: 0, column: 1, rowIndex: 0, index: 0, data: '00', width: 2, height: 3, anchorColumn: 0 },
				{ row: 0, column: 2, rowIndex: 0, index: 1, data: '02', isAnchor: true },
				{ row: 2, column: 0, rowIndex: 2, index: 0, data: '00', width: 2, height: 3, anchorRow: 0 },
				{ row: 2, column: 1, rowIndex: 2, index: 0, data: '00', width: 2, height: 3, anchorRow: 0, anchorColumn: 0 },
				{ row: 2, column: 2, rowIndex: 2, index: 0, data: '22', isAnchor: true },
				{ row: 3, column: 0, rowIndex: 3, index: 0, data: '30', isAnchor: true },
				{ row: 3, column: 1, rowIndex: 3, index: 1, data: '31', isAnchor: true },
				{ row: 3, column: 2, rowIndex: 3, index: 2, data: '32', isAnchor: true }
			], { includeAllSlots: true }, 1 );
		} );
	} );

	it.skip( 'should throw error if walker value old api used', () => {
		setData( model, modelTable( [
			[ 'a' ]
		] ) );

		const walker = new TableWalker( root.getChild( 0 ) );

		const { value } = walker.next();

		expect( () => value.isSpanned ).to.throw( CKEditorError, 'tableslot-getter-removed' );
		expect( () => value.colspan ).to.throw( CKEditorError, 'tableslot-getter-removed' );
		expect( () => value.rowspan ).to.throw( CKEditorError, 'tableslot-getter-removed' );
		expect( () => value.cellIndex ).to.throw( CKEditorError, 'tableslot-getter-removed' );
	} );
} );
