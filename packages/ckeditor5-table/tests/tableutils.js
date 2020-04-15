/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { defaultConversion, defaultSchema, modelTable } from './_utils/utils';

import TableEditing from '../src/tableediting';
import TableUtils from '../src/tableutils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'TableUtils', () => {
	let editor, model, root, tableUtils;

	afterEach( () => {
		return editor.destroy();
	} );

	describe( '#pluginName', () => {
		beforeEach( () => {
			return ModelTestEditor.create( {
				plugins: [ TableUtils ]
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot( 'main' );
				tableUtils = editor.plugins.get( TableUtils );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
		} );

		it( 'should provide plugin name', () => {
			expect( TableUtils.pluginName ).to.equal( 'TableUtils' );
		} );
	} );

	describe( 'getCellLocation()', () => {
		beforeEach( () => {
			return ModelTestEditor.create( {
				plugins: [ TableUtils ]
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot( 'main' );
				tableUtils = editor.plugins.get( TableUtils );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
		} );

		it( 'should return proper table cell location', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, colspan: 2, contents: '00[]' }, '02' ],
				[ '12' ]
			] ) );

			expect( tableUtils.getCellLocation( root.getNodeByPath( [ 0, 0, 0 ] ) ) ).to.deep.equal( { row: 0, column: 0 } );
			expect( tableUtils.getCellLocation( root.getNodeByPath( [ 0, 0, 1 ] ) ) ).to.deep.equal( { row: 0, column: 2 } );
			expect( tableUtils.getCellLocation( root.getNodeByPath( [ 0, 1, 0 ] ) ) ).to.deep.equal( { row: 1, column: 2 } );
		} );
	} );

	describe( 'insertRows()', () => {
		beforeEach( () => {
			return ModelTestEditor.create( {
				plugins: [ TableUtils ]
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot( 'main' );
				tableUtils = editor.plugins.get( TableUtils );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
		} );

		it( 'should insert row in given table at given index', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '11[]', '12' ],
				[ '', '' ],
				[ '21', '22' ]
			] ) );
		} );

		it( 'should insert row in given table at default index', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ) );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '', '' ],
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );
		} );

		it( 'should update table heading rows attribute when inserting row in headings section', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingRows: 2 } ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '11[]', '12' ],
				[ '', '' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingRows: 3 } ) );
		} );

		it( 'should not update table heading rows attribute when inserting row after headings section', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingRows: 2 } ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 2 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ],
				[ '', '' ],
				[ '31', '32' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should expand rowspan of a cell that overlaps inserted rows', () => {
			setData( model, modelTable( [
				[ { colspan: 2, contents: '11[]' }, '13', '14' ],
				[ { colspan: 2, rowspan: 4, contents: '21' }, '23', '24' ],
				[ '33', '34' ]
			], { headingColumns: 3, headingRows: 1 } ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 2, rows: 3 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '11[]' }, '13', '14' ],
				[ { colspan: 2, rowspan: 7, contents: '21' }, '23', '24' ],
				[ '', '' ],
				[ '', '' ],
				[ '', '' ],
				[ '33', '34' ]
			], { headingColumns: 3, headingRows: 1 } ) );
		} );

		it( 'should not expand rowspan of a cell that does not overlaps inserted rows', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, contents: '11[]' }, '12', '13' ],
				[ '22', '23' ],
				[ '31', '32', '33' ]
			], { headingColumns: 3, headingRows: 1 } ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 2, rows: 3 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ { rowspan: 2, contents: '11[]' }, '12', '13' ],
				[ '22', '23' ],
				[ '', '', '' ],
				[ '', '', '' ],
				[ '', '', '' ],
				[ '31', '32', '33' ]
			], { headingColumns: 3, headingRows: 1 } ) );
		} );

		it( 'should properly calculate columns if next row has colspans', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, contents: '11[]' }, '12', '13' ],
				[ '22', '23' ],
				[ { colspan: 3, contents: '31' } ]
			], { headingColumns: 3, headingRows: 1 } ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 2, rows: 3 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ { rowspan: 2, contents: '11[]' }, '12', '13' ],
				[ '22', '23' ],
				[ '', '', '' ],
				[ '', '', '' ],
				[ '', '', '' ],
				[ { colspan: 3, contents: '31' } ]
			], { headingColumns: 3, headingRows: 1 } ) );
		} );

		it( 'should insert rows at the end of a table', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 2, rows: 3 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ],
				[ '', '' ],
				[ '', '' ],
				[ '', '' ]
			] ) );
		} );
	} );

	describe( 'insertColumns()', () => {
		beforeEach( () => {
			return ModelTestEditor.create( {
				plugins: [ TableUtils ]
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot( 'main' );
				tableUtils = editor.plugins.get( TableUtils );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
		} );

		it( 'should insert column in given table at given index', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '11[]', '', '12' ],
				[ '21', '', '22' ]
			] ) );
		} );

		it( 'should insert column in given table with default values', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ) );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '', '11[]', '12' ],
				[ '', '21', '22' ]
			] ) );
		} );

		it( 'should insert column in given table at default index', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ) );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '', '11[]', '12' ],
				[ '', '21', '22' ]
			] ) );
		} );

		it( 'should insert columns at the end of a row', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ { colspan: 2, contents: '10' } ],
				[ '20', { rowspan: 2, contents: '21' } ],
				[ '30' ]
			] ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 2, columns: 2 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00[]', '01', '', '' ],
				[ { colspan: 2, contents: '10' }, '', '' ],
				[ '20', { rowspan: 2, contents: '21' }, '', '' ],
				[ '30', '', '' ]
			] ) );
		} );

		it( 'should insert columns at the beginning of a row', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ { colspan: 2, contents: '10' } ],
				[ '20', { rowspan: 2, contents: '21' } ],
				[ { rowspan: 2, contents: '30' } ],
				[ '41' ]
			] ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 0, columns: 2 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '', '', '00[]', '01' ],
				[ '', '', { colspan: 2, contents: '10' } ],
				[ '', '', '20', { rowspan: 2, contents: '21' } ],
				[ '', '', { rowspan: 2, contents: '30' } ],
				[ '', '', '41' ]
			] ) );
		} );

		it( 'should properly insert column at beginning of row-col-spanned cell', () => {
			setData( model, modelTable( [
				[ '11', '12', '13' ],
				[ '21', { colspan: 2, rowspan: 2, contents: '22[]' } ],
				[ '31' ],
				[ '41', '42', '43' ]
			] ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1, columns: 1 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '11', '', '12', '13' ],
				[ '21', '', { colspan: 2, rowspan: 2, contents: '22[]' } ],
				[ '31', '' ],
				[ '41', '', '42', '43' ]
			] ) );
		} );

		it( 'should update table heading columns attribute when inserting column in headings section', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingColumns: 2 } ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '11[]', '', '12' ],
				[ '21', '', '22' ],
				[ '31', '', '32' ]
			], { headingColumns: 3 } ) );
		} );

		it( 'should not update table heading columns attribute when inserting column after headings section', () => {
			setData( model, modelTable( [
				[ '11[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			], { headingColumns: 2 } ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 2 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '11[]', '12', '', '13' ],
				[ '21', '22', '', '23' ],
				[ '31', '32', '', '33' ]
			], { headingColumns: 2 } ) );
		} );

		it( 'should expand spanned columns', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ { colspan: 2, contents: '10' } ],
				[ '20', '21' ]
			], { headingColumns: 2 } ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00[]', '', '01' ],
				[ { colspan: 3, contents: '10' } ],
				[ '20', '', '21' ]
			], { headingColumns: 3 } ) );
		} );

		it( 'should skip wide spanned columns', () => {
			setData( model, modelTable( [
				[ '11[]', '12', '13', '14', '15' ],
				[ '21', '22', { colspan: 2, contents: '23' }, '25' ],
				[ { colspan: 4, contents: '31' }, { colspan: 2, contents: '34' } ]
			], { headingColumns: 4 } ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 2, columns: 2 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '11[]', '12', '', '', '13', '14', '15' ],
				[ '21', '22', '', '', { colspan: 2, contents: '23' }, '25' ],
				[ { colspan: 6, contents: '31' }, { colspan: 2, contents: '34' } ]
			], { headingColumns: 6 } ) );
		} );

		it( 'should skip row & column spanned cells', () => {
			setData( model, modelTable( [
				[ { colspan: 2, rowspan: 2, contents: '00[]' }, '02' ],
				[ '12' ],
				[ '20', '21', '22' ]
			], { headingColumns: 2 } ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1, columns: 2 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 4, rowspan: 2, contents: '00[]' }, '02' ],
				[ '12' ],
				[ '20', '', '', '21', '22' ]
			], { headingColumns: 4 } ) );
		} );

		it( 'should properly insert column while table has rowspanned cells', () => {
			setData( model, modelTable( [
				[ { rowspan: 4, contents: '00[]' }, { rowspan: 2, contents: '01' }, '02' ],
				[ '12' ],
				[ { rowspan: 2, contents: '21' }, '22' ],
				[ '32' ]
			], { headingColumns: 2 } ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1, columns: 1 } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ { rowspan: 4, contents: '00[]' }, '', { rowspan: 2, contents: '01' }, '02' ],
				[ '', '12' ],
				[ '', { rowspan: 2, contents: '21' }, '22' ],
				[ '', '32' ]
			], { headingColumns: 3 } ) );
		} );
	} );

	describe( 'splitCellVertically()', () => {
		beforeEach( () => {
			return ModelTestEditor.create( {
				plugins: [ TableUtils ]
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot( 'main' );
				tableUtils = editor.plugins.get( TableUtils );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
		} );

		it( 'should split table cell to given table cells number', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '[]11', '12' ],
				[ '20', { colspan: 2, contents: '21' } ],
				[ { colspan: 2, contents: '30' }, '32' ]
			] ) );

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 1 ] ), 3 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', { colspan: 3, contents: '01' }, '02' ],
				[ '10', '[]11', '', '', '12' ],
				[ '20', { colspan: 4, contents: '21' } ],
				[ { colspan: 4, contents: '30' }, '32' ]
			] ) );
		} );

		it( 'should split table cell for two table cells as a default', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '[]11', '12' ],
				[ '20', { colspan: 2, contents: '21' } ],
				[ { colspan: 2, contents: '30' }, '32' ]
			] ) );

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 1 ] ) );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', { colspan: 2, contents: '01' }, '02' ],
				[ '10', '[]11', '', '12' ],
				[ '20', { colspan: 3, contents: '21' } ],
				[ { colspan: 3, contents: '30' }, '32' ]
			] ) );
		} );

		it( 'should split table cell if split is equal to colspan', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ],
				[ '20', { colspan: 2, contents: '21[]' } ],
				[ { colspan: 2, contents: '30' }, '32' ]
			] ) );

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 2, 1 ] ), 2 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ],
				[ '20', '21[]', '' ],
				[ { colspan: 2, contents: '30' }, '32' ]
			] ) );
		} );

		it( 'should properly split table cell if split is uneven', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 3, contents: '10[]' } ]
			] ) );

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 0 ] ), 2 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, contents: '10[]' }, '' ]
			] ) );
		} );

		it( 'should properly set colspan of inserted cells', () => {
			setData( model, modelTable( [
				[ '00', '01', '02', '03' ],
				[ { colspan: 4, contents: '10[]' } ]
			] ) );

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 0 ] ), 2 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01', '02', '03' ],
				[ { colspan: 2, contents: '10[]' }, { colspan: 2, contents: '' } ]
			] ) );
		} );

		it( 'should keep rowspan attribute for newly inserted cells', () => {
			setData( model, modelTable( [
				[ '00', '01', '02', '03', '04', '05' ],
				[ { colspan: 5, rowspan: 2, contents: '10[]' }, '15' ],
				[ '25' ]
			] ) );

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 0 ] ), 2 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01', '02', '03', '04', '05' ],
				[ { colspan: 3, rowspan: 2, contents: '10[]' }, { colspan: 2, rowspan: 2, contents: '' }, '15' ],
				[ '25' ]
			] ) );
		} );

		it( 'should keep rowspan attribute of for newly inserted cells if number of cells is bigger then curren colspan', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10[]' }, '12' ],
				[ '22' ]
			] ) );

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 0 ] ), 3 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '00' }, '01', '02' ],
				[ { rowspan: 2, contents: '10[]' }, { rowspan: 2, contents: '' }, { rowspan: 2, contents: '' }, '12' ],
				[ '22' ]
			] ) );
		} );

		it( 'should properly break a cell if it has colspan and number of created cells is bigger then colspan', () => {
			setData( model, modelTable( [
				[ '00', '01', '02', '03' ],
				[ { colspan: 4, contents: '10[]' } ]
			] ) );

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 0 ] ), 6 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 3, contents: '00' }, '01', '02', '03' ],
				[ '10[]', '', '', '', '', '' ]
			] ) );
		} );

		it( 'should update heading columns is split cell is in heading section', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '10[]', '11' ]
			], { headingColumns: 1 } ) );

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 0 ] ), 3 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 3, contents: '00' }, '01' ],
				[ '10[]', '', '', '11' ]
			], { headingColumns: 3 } ) );
		} );
	} );

	describe( 'splitCellHorizontally()', () => {
		beforeEach( () => {
			return ModelTestEditor.create( {
				plugins: [ TableUtils ]
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot( 'main' );
				tableUtils = editor.plugins.get( TableUtils );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
		} );

		it( 'should split table cell to default table cells number', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '[]11', '12' ],
				[ '20', '21', '22' ]
			] ) );

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 1, 1 ] ) );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01', '02' ],
				[ { rowspan: 2, contents: '10' }, '[]11', { rowspan: 2, contents: '12' } ],
				[ '' ],
				[ '20', '21', '22' ]
			] ) );
		} );

		it( 'should split table cell to given table cells number', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '[]11', '12' ],
				[ '20', '21', '22' ]
			] ) );

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 1, 1 ] ), 4 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01', '02' ],
				[ { rowspan: 4, contents: '10' }, '[]11', { rowspan: 4, contents: '12' } ],
				[ '' ],
				[ '' ],
				[ '' ],
				[ '20', '21', '22' ]
			] ) );
		} );

		it( 'should properly update rowspanned cells overlapping selected cell', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, contents: '00' }, '01', { rowspan: 3, contents: '02' } ],
				[ '[]11' ],
				[ '20', '21' ]
			] ) );

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 1, 0 ] ), 3 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ { rowspan: 4, contents: '00' }, '01', { rowspan: 5, contents: '02' } ],
				[ '[]11' ],
				[ '' ],
				[ '' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should split rowspanned cell', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '01[]' } ],
				[ '10' ],
				[ '20', '21' ]
			] ) );

			const tableCell = root.getNodeByPath( [ 0, 0, 1 ] );

			tableUtils.splitCellHorizontally( tableCell, 2 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01[]' ],
				[ '10', '' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should copy colspan while splitting rowspanned cell', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, colspan: 2, contents: '01[]' } ],
				[ '10' ],
				[ '20', '21', '22' ]
			] ) );

			const tableCell = root.getNodeByPath( [ 0, 0, 1 ] );

			tableUtils.splitCellHorizontally( tableCell, 2 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', { colspan: 2, contents: '01[]' } ],
				[ '10', { colspan: 2, contents: '' } ],
				[ '20', '21', '22' ]
			] ) );
		} );

		it( 'should evenly distribute rowspan attribute', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 7, contents: '01[]' } ],
				[ '10' ],
				[ '20' ],
				[ '30' ],
				[ '40' ],
				[ '50' ],
				[ '60' ],
				[ '70', '71' ]
			] ) );

			const tableCell = root.getNodeByPath( [ 0, 0, 1 ] );

			tableUtils.splitCellHorizontally( tableCell, 3 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', { rowspan: 3, contents: '01[]' } ],
				[ '10' ],
				[ '20' ],
				[ '30', { rowspan: 2, contents: '' } ],
				[ '40' ],
				[ '50', { rowspan: 2, contents: '' } ],
				[ '60' ],
				[ '70', '71' ]
			] ) );
		} );

		it( 'should split rowspanned cell and updated other cells rowspan when splitting to bigger number of cells', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '01[]' } ],
				[ '10' ],
				[ '20', '21' ]
			] ) );

			const tableCell = root.getNodeByPath( [ 0, 0, 1 ] );

			tableUtils.splitCellHorizontally( tableCell, 3 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ { rowspan: 2, contents: '00' }, '01[]' ],
				[ '' ],
				[ '10', '' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should split rowspanned & colspaned cell', () => {
			setData( model, modelTable( [
				[ '00', { colspan: 2, contents: '01[]' } ],
				[ '10', '11' ]
			] ) );

			const tableCell = root.getNodeByPath( [ 0, 0, 1 ] );

			tableUtils.splitCellHorizontally( tableCell, 3 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ { rowspan: 3, contents: '00' }, { colspan: 2, contents: '01[]' } ],
				[ { colspan: 2, contents: '' } ],
				[ { colspan: 2, contents: '' } ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should split table cell from a heading section', () => {
			setData( model, modelTable( [
				[ '00[]', '01', '02' ],
				[ '10', '11', '12' ],
				[ '20', '21', '22' ]
			], { headingRows: 1 } ) );

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 0, 0 ] ), 3 );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00[]', { rowspan: 3, contents: '01' }, { rowspan: 3, contents: '02' } ],
				[ '' ],
				[ '' ],
				[ '10', '11', '12' ],
				[ '20', '21', '22' ]
			], { headingRows: 3 } ) );
		} );
	} );

	describe( 'getColumns()', () => {
		beforeEach( () => {
			return ModelTestEditor.create( {
				plugins: [ TableUtils ]
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot( 'main' );
				tableUtils = editor.plugins.get( TableUtils );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
		} );

		it( 'should return proper number of columns', () => {
			setData( model, modelTable( [
				[ '00', { colspan: 3, contents: '01' }, '04' ]
			] ) );

			expect( tableUtils.getColumns( root.getNodeByPath( [ 0 ] ) ) ).to.equal( 5 );
		} );
	} );

	describe( 'getRows()', () => {
		beforeEach( () => {
			return ModelTestEditor.create( {
				plugins: [ TableUtils ]
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot( 'main' );
				tableUtils = editor.plugins.get( TableUtils );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
		} );

		it( 'should return proper number of columns for simple table', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			] ) );

			expect( tableUtils.getRows( root.getNodeByPath( [ 0 ] ) ) ).to.equal( 2 );
		} );

		it( 'should return proper number of columns for a table with header', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			], { headingRows: 1 } ) );

			expect( tableUtils.getRows( root.getNodeByPath( [ 0 ] ) ) ).to.equal( 2 );
		} );

		it( 'should return proper number of columns for rowspan table', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ { rowspan: 2, contents: '10' }, '11' ],
				[ '21' ]
			] ) );

			expect( tableUtils.getRows( root.getNodeByPath( [ 0 ] ) ) ).to.equal( 3 );
		} );
	} );

	describe( 'removeRows()', () => {
		beforeEach( () => {
			return ModelTestEditor.create( {
				plugins: [ Paragraph, TableEditing, TableUtils ]
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot( 'main' );
				tableUtils = editor.plugins.get( TableUtils );
			} );
		} );

		describe( 'single row', () => {
			it( 'should remove a given row from a table start', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 0 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '10', '11' ],
					[ '20', '21' ]
				] ) );
			} );

			it( 'should remove last row', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 1 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '01' ]
				] ) );
			} );

			it( 'should change heading rows if removing a heading row', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 2 } ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 1 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '01' ],
					[ '20', '21' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should decrease rowspan of table cells from previous rows', () => {
				// +----+----+----+----+----+
				// | 00 | 01 | 02 | 03 | 04 |
				// +----+    +    +    +    +
				// | 10 |    |    |    |    |
				// +----+----+    +    +    +
				// | 20 | 21 |    |    |    |
				// +----+----+----+    +    +
				// | 30 | 31 | 32 |    |    |
				// +----+----+----+----+    +
				// | 40 | 41 | 42 | 43 |    |
				// +----+----+----+----+----+
				// | 50 | 51 | 52 | 53 | 54 |
				// +----+----+----+----+----+
				setData( model, modelTable( [
					[ '00', { contents: '01', rowspan: 2 }, { contents: '02', rowspan: 3 }, { contents: '03', rowspan: 4 },
						{ contents: '04', rowspan: 5 } ],
					[ '10' ],
					[ '20', '21' ],
					[ '30', '31', '32' ],
					[ '40', '41', '42', '43' ],
					[ '50', '51', '52', '53', '54' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 1, rows: 1 } );

				// +----+----+----+----+----+
				// | 00 | 01 | 02 | 03 | 04 |
				// +----+----+    +    +    +
				// | 20 | 21 |    |    |    |
				// +----+----+----+    +    +
				// | 30 | 31 | 32 |    |    |
				// +----+----+----+----+    +
				// | 40 | 41 | 42 | 43 |    |
				// +----+----+----+----+----+
				// | 50 | 51 | 52 | 53 | 54 |
				// +----+----+----+----+----+
				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '01', { contents: '02', rowspan: 2 }, { contents: '03', rowspan: 3 }, { contents: '04', rowspan: 4 } ],
					[ '20', '21' ],
					[ '30', '31', '32' ],
					[ '40', '41', '42', '43' ],
					[ '50', '51', '52', '53', '54' ]
				] ) );
			} );

			it( 'should decrease rowspan of table cells from previous rows (rowspaned cells on different rows)', () => {
				setData( model, modelTable( [
					[ { rowspan: 4, contents: '00' }, { rowspan: 3, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
					[ { rowspan: 2, contents: '13' }, '14' ],
					[ '22', '24' ],
					[ '31', '32', '33', '34' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ { rowspan: 3, contents: '00' }, { rowspan: 2, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
					[ '13', '14' ],
					[ '31', '32', '33', '34' ]
				] ) );
			} );

			it( 'should move rowspaned cells to a row below removing it\'s row', () => {
				setData( model, modelTable( [
					[ { rowspan: 3, contents: '00' }, { rowspan: 2, contents: '01' }, '02' ],
					[ '12' ],
					[ '21', '22' ],
					[ '30', '31', '32' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 0 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ { rowspan: 2, contents: '00' }, '01', '12' ],
					[ '21', '22' ],
					[ '30', '31', '32' ]
				] ) );
			} );

			it( 'should move rowspaned cells to a row below removing it\'s row (other cell is overlapping removed row)', () => {
				setData( model, modelTable( [
					[ '00', { rowspan: 3, contents: '01' }, '02', '03', '04' ],
					[ '10', { rowspan: 2, contents: '12' }, '13', '14' ],
					[ '20', '23', '24' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 1 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00', { rowspan: 2, contents: '01' }, '02', '03', '04' ],
					[ '20', '12', '23', '24' ]
				] ) );
			} );
		} );

		describe( 'many rows', () => {
			it( 'should properly remove middle rows', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 1, rows: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '01' ],
					[ '30', '31' ]
				] ) );
			} );

			it( 'should properly remove tailing rows', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 2, rows: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should properly remove beginning rows', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 0, rows: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '20', '21' ],
					[ '30', '31' ]
				] ) );
			} );

			it( 'should support removing multiple headings (removed rows in heading section)', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				], { headingRows: 3 } ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 0, rows: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '20', '21' ],
					[ '30', '31' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should support removing multiple headings (removed rows in heading and body section)', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ],
					[ '40', '41' ]
				], { headingRows: 3 } ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 1, rows: 3 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '01' ],
					[ '40', '41' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should support removing mixed heading and cell rows', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 1 } ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 0, rows: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '20', '21' ]
				] ) );
			} );

			it( 'should move row-spaned cells to a row after removed rows section', () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ { rowspan: 4, contents: '10' }, { rowspan: 3, contents: '11' }, { rowspan: 2, contents: '12' }, '13' ],
					[ { rowspan: 3, contents: '23' } ],
					[ '32' ],
					[ '41', '42' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 1, rows: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '01', '02', '03' ],
					[ { rowspan: 2, contents: '10' }, '11', '32', { rowspan: 2, contents: '23' } ],
					[ '41', '42' ]
				] ) );
			} );

			it( 'should decrease rowspan of table cells from rows before removed rows section', () => {
				setData( model, modelTable( [
					[ { rowspan: 4, contents: '00' }, { rowspan: 3, contents: '01' }, { rowspan: 2, contents: '02' }, '03' ],
					[ '13' ],
					[ '22', '23' ],
					[ '31', '32', '33' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 1, rows: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ { rowspan: 2, contents: '00' }, '01', '02', '03' ],
					[ '31', '32', '33' ]
				] ) );
			} );

			it( 'should decrease rowspan of table cells from previous rows', () => {
				// +----+----+----+----+----+
				// | 00 | 01 | 02 | 03 | 04 |
				// +----+    +    +    +    +
				// | 10 |    |    |    |    |
				// +----+----+    +    +    +
				// | 20 | 21 |    |    |    |
				// +----+----+----+    +    +
				// | 30 | 31 | 32 |    |    |
				// +----+----+----+----+    +
				// | 40 | 41 | 42 | 43 |    |
				// +----+----+----+----+----+
				// | 50 | 51 | 52 | 53 | 44 |
				// +----+----+----+----+----+
				setData( model, modelTable( [
					[ '00', { contents: '01', rowspan: 2 }, { contents: '02', rowspan: 3 }, { contents: '03', rowspan: 4 },
						{ contents: '04', rowspan: 5 } ],
					[ '10' ],
					[ '20', '21' ],
					[ '30', '31', '32' ],
					[ '40', '41', '42', '43' ],
					[ '50', '51', '52', '53', '54' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 2, rows: 2 } );

				// +----+----+----+----+----+
				// | 00 | 01 | 02 | 03 | 04 |
				// +----+    +    +    +    +
				// | 10 |    |    |    |    |
				// +----+----+----+----+    +
				// | 40 | 41 | 42 | 43 |    |
				// +----+----+----+----+----+
				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00', { contents: '01', rowspan: 2 }, { contents: '02', rowspan: 2 }, { contents: '03', rowspan: 2 },
						{ contents: '04', rowspan: 3 } ],
					[ '10' ],
					[ '40', '41', '42', '43' ],
					[ '50', '51', '52', '53', '54' ]
				] ) );
			} );

			it( 'should create one undo step (1 batch)', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				], { headingRows: 3 } ) );

				const createdBatches = new Set();

				model.on( 'applyOperation', ( evt, args ) => {
					const operation = args[ 0 ];

					createdBatches.add( operation.batch );
				} );

				tableUtils.removeRows( root.getChild( 0 ), { at: 0, rows: 2 } );

				expect( createdBatches.size ).to.equal( 1 );
			} );
		} );
	} );

	describe( 'removeColumns()', () => {
		beforeEach( () => {
			return ModelTestEditor.create( {
				plugins: [ TableUtils ]
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot( 'main' );
				tableUtils = editor.plugins.get( TableUtils );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
		} );

		describe( 'single row', () => {
			it( 'should remove a given column', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '02' ],
					[ '10', '12' ],
					[ '20', '22' ]
				] ) );
			} );

			it( 'should remove a given column from a table start', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 0 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '01' ],
					[ '11' ],
					[ '21' ]
				] ) );
			} );

			it( 'should change heading columns if removing a heading column', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingColumns: 2 } ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 0 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '01' ],
					[ '11' ],
					[ '21' ]
				], { headingColumns: 1 } ) );
			} );

			it( 'should decrease colspan of table cells from previous column', () => {
				setData( model, modelTable( [
					[ { colspan: 4, contents: '00' }, '04' ],
					[ { colspan: 3, contents: '10' }, '13', '14' ],
					[ { colspan: 2, contents: '20' }, '22', '23', '24' ],
					[ '30', { colspan: 2, contents: '31' }, '33', '34' ],
					[ '40', '41', '42', '43', '44' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ { colspan: 3, contents: '00' }, '04' ],
					[ { colspan: 2, contents: '10' }, '13', '14' ],
					[ { colspan: 2, contents: '20' }, '23', '24' ],
					[ '30', '31', '33', '34' ],
					[ '40', '41', '43', '44' ]

				] ) );
			} );

			it( 'should decrease colspan of cells that are on removed column', () => {
				setData( model, modelTable( [
					[ { colspan: 3, contents: '00' }, '03' ],
					[ { colspan: 2, contents: '10' }, '12', '13' ],
					[ '20', '21', '22', '23' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 0 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ { colspan: 2, contents: '00' }, '03' ],
					[ '10', '12', '13' ],
					[ '21', '22', '23' ]
				] ) );
			} );

			it( 'should remove column with rowspan (first column)', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, '01' ],
					[ '11' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 0 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '01' ],
					[ '11' ]
				] ) );
			} );

			it( 'should remove column with rowspan (last column)', () => {
				setData( model, modelTable( [
					[ '00', { rowspan: 2, contents: '01' } ],
					[ '10' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00' ],
					[ '10' ]
				] ) );
			} );

			it( 'should remove column if other column is rowspanned (last column)', () => {
				setData( model, modelTable( [
					[ '00', { rowspan: 2, contents: '01' } ],
					[ '10' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 0 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '01' ]
				] ) );
			} );

			it( 'should remove column if other column is rowspanned (first column)', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, '01' ],
					[ '11' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00' ]
				] ) );
			} );

			it( 'should remove column if removing row with one column - other columns are spanned', () => {
				setData( model, modelTable( [
					[ '00', { rowspan: 2, contents: '01' }, { rowspan: 2, contents: '02' } ],
					[ '10' ],
					[ '20', '21', '22' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 0 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '01', '02' ],
					[ '21', '22' ]
				] ) );
			} );
		} );

		describe( 'multiple columns', () => {
			it( 'should properly remove two first columns', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ],
					[ '30', '31', '32' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 0, columns: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '02' ],
					[ '12' ],
					[ '22' ],
					[ '32' ]
				] ) );
			} );

			it( 'should properly remove two middle columns', () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ],
					[ '20', '21', '22', '23' ],
					[ '30', '31', '32', '33' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 1, columns: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '03' ],
					[ '10', '13' ],
					[ '20', '23' ],
					[ '30', '33' ]
				] ) );
			} );

			it( 'should properly remove two last columns', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ],
					[ '30', '31', '32' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 1, columns: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00' ],
					[ '10' ],
					[ '20' ],
					[ '30' ]
				] ) );
			} );

			it( 'should properly remove multiple heading columns', () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03', '04' ],
					[ '10', '11', '12', '13', '14' ]
				], { headingColumns: 3 } ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 1, columns: 3 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '04' ],
					[ '10', '14' ]
				], { headingColumns: 1 } ) );
			} );

			it( 'should properly calculate truncated colspans', () => {
				setData( model, modelTable( [
					[ { contents: '00', colspan: 3 } ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 0, columns: 2 } );

				assertEqualMarkup( getData( model, { withoutSelection: true } ), modelTable( [
					[ '00' ],
					[ '12' ],
					[ '22' ]
				] ) );
			} );
		} );
	} );
} );
