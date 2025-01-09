/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import TableEditing from '../../src/tableediting.js';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { modelTable } from '../_utils/utils.js';
import { getHorizontallyOverlappingCells, getVerticallyOverlappingCells } from '../../src/utils/structure.js';

describe( 'table utils', () => {
	let editor, model, modelRoot;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableEditing, Paragraph ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'structure', () => {
		describe( 'getVerticallyOverlappingCells()', () => {
			let table;

			beforeEach( () => {
				// +----+----+----+----+----+
				// | 00 | 01 | 02 | 03 | 04 |
				// +    +    +----+    +----+
				// |    |    | 12 |    | 14 |
				// +    +    +    +----+----+
				// |    |    |    | 23 | 24 |
				// +    +----+    +    +----+
				// |    | 31 |    |    | 34 |
				// +    +    +----+----+----+
				// |    |    | 42 | 43 | 44 |
				// +----+----+----+----+----+
				setModelData( model, modelTable( [
					[ { contents: '00', rowspan: 5 }, { contents: '01', rowspan: 3 }, '02', { contents: '03', rowspan: 2 }, '04' ],
					[ { contents: '12', rowspan: 3 }, '14' ],
					[ { contents: '23', rowspan: 2 }, '24' ],
					[ { contents: '31', rowspan: 2 }, '34' ],
					[ '42', '43', '44' ]
				] ) );

				table = modelRoot.getChild( 0 );
			} );

			it( 'should return empty array for no overlapping cells', () => {
				const cellsInfo = getVerticallyOverlappingCells( table, 0 );

				expect( cellsInfo ).to.be.empty;
			} );

			it( 'should return overlapping cells info for given overlapRow', () => {
				const cellsInfo = getVerticallyOverlappingCells( table, 2 );

				expect( cellsInfo[ 0 ].cell ).to.equal( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) ); // Cell 00
				expect( cellsInfo[ 1 ].cell ).to.equal( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) ); // Cell 01
				expect( cellsInfo[ 2 ].cell ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 0 ] ) ); // Cell 12
			} );

			it( 'should ignore rows below startRow', () => {
				const cellsInfo = getVerticallyOverlappingCells( table, 2, 1 );

				expect( cellsInfo[ 0 ].cell ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 0 ] ) ); // Cell 12
			} );
		} );

		describe( 'getHorizontallyOverlappingCells()', () => {
			let table;

			beforeEach( () => {
				// +----+----+----+----+----+
				// | 00                     |
				// +----+----+----+----+----+
				// | 10           | 13      |
				// +----+----+----+----+----+
				// | 20 | 21           | 24 |
				// +----+----+----+----+----+
				// | 30      | 32      | 34 |
				// +----+----+----+----+----+
				// | 40 | 41 | 42 | 43 | 44 |
				// +----+----+----+----+----+
				setModelData( model, modelTable( [
					[ { contents: '00', colspan: 5 } ],
					[ { contents: '10', colspan: 3 }, { contents: '13', colspan: 2 } ],
					[ '20', { contents: '21', colspan: 3 }, '24' ],
					[ { contents: '30', colspan: 2 }, { contents: '32', colspan: 2 }, '34' ],
					[ '40', '41', '42', '43', '44' ]
				] ) );

				table = modelRoot.getChild( 0 );
			} );

			it( 'should return empty array for no overlapping cells', () => {
				const cellsInfo = getHorizontallyOverlappingCells( table, 0 );

				expect( cellsInfo ).to.be.empty;
			} );

			it( 'should return overlapping cells info for given overlapColumn', () => {
				const cellsInfo = getHorizontallyOverlappingCells( table, 2 );

				expect( cellsInfo[ 0 ].cell ).to.equal( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) ); // Cell 00
				expect( cellsInfo[ 1 ].cell ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 0 ] ) ); // Cell 10
				expect( cellsInfo[ 2 ].cell ).to.equal( modelRoot.getNodeByPath( [ 0, 2, 1 ] ) ); // Cell 21
			} );
		} );
	} );
} );
