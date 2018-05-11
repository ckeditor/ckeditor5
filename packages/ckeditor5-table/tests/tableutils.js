/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import { downcastInsertTable } from '../src/converters/downcast';
import upcastTable from '../src/converters/upcasttable';
import { formatTable, formattedModelTable, modelTable } from './_utils/utils';
import TableUtils from '../src/tableutils';

describe( 'TableUtils', () => {
	let editor, model, root, tableUtils;

	beforeEach( () => {
		return ModelTestEditor.create( {
			plugins: [ TableUtils ]
		} ).then( newEditor => {
			editor = newEditor;
			model = editor.model;
			root = model.document.getRoot( 'main' );
			tableUtils = editor.plugins.get( TableUtils );

			const conversion = editor.conversion;
			const schema = model.schema;

			schema.register( 'table', {
				allowWhere: '$block',
				allowAttributes: [ 'headingRows' ],
				isBlock: true,
				isObject: true
			} );

			schema.register( 'tableRow', {
				allowIn: 'table',
				allowAttributes: [],
				isBlock: true,
				isLimit: true
			} );

			schema.register( 'tableCell', {
				allowIn: 'tableRow',
				allowContentOf: '$block',
				allowAttributes: [ 'colspan', 'rowspan' ],
				isBlock: true,
				isLimit: true
			} );

			model.schema.register( 'p', { inheritAllFrom: '$block' } );

			// Table conversion.
			conversion.for( 'upcast' ).add( upcastTable() );
			conversion.for( 'downcast' ).add( downcastInsertTable() );

			// Table row upcast only since downcast conversion is done in `downcastTable()`.
			conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableRow', view: 'tr' } ) );

			// Table cell conversion.
			conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'td' } ) );
			conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'th' } ) );

			conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
			conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( '#pluginName', () => {
		it( 'should provide plugin name', () => {
			expect( TableUtils.pluginName ).to.equal( 'TableUtils' );
		} );
	} );

	describe( 'getCellLocation()', () => {
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
		it( 'should insert row in given table at given index', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ],
				[ '', '' ],
				[ '', '' ],
				[ '', '' ]
			] ) );
		} );
	} );

	describe( 'insertColumns()', () => {
		it( 'should insert column in given table at given index', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '', '', '00[]', '01' ],
				[ '', '', { colspan: 2, contents: '10' } ],
				[ '', '', '20', { rowspan: 2, contents: '21' } ],
				[ '', '', { rowspan: 2, contents: '30' } ],
				[ '', '', '41' ]
			] ) );
		} );

		it( 'should update table heading columns attribute when inserting column in headings section', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingColumns: 2 } ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '11[]', '12', '', '13' ],
				[ '21', '22', '', '23' ],
				[ '31', '32', '', '33' ]
			], { headingColumns: 2 } ) );
		} );

		it( 'should expand spanned columns', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ { colspan: 2, contents: '21' } ],
				[ '31', '32' ]
			], { headingColumns: 2 } ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '11[]', '', '12' ],
				[ { colspan: 3, contents: '21' } ],
				[ '31', '', '32' ]
			], { headingColumns: 3 } ) );
		} );

		it( 'should skip wide spanned columns', () => {
			setData( model, modelTable( [
				[ '11[]', '12', '13', '14', '15' ],
				[ '21', '22', { colspan: 2, contents: '23' }, '25' ],
				[ { colspan: 4, contents: '31' }, { colspan: 2, contents: '34' } ]
			], { headingColumns: 4 } ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 2, columns: 2 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ { rowspan: 4, contents: '00[]' }, '', { rowspan: 2, contents: '01' }, '02' ],
				[ '', '12' ],
				[ '', { rowspan: 2, contents: '21' }, '22' ],
				[ '', '32' ]
			], { headingColumns: 3 } ) );
		} );
	} );

	describe( 'splitCellHorizontally()', () => {
		it( 'should split table cell to given table cells number', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '[]11', '12' ],
				[ '20', { colspan: 2, contents: '21' } ],
				[ { colspan: 2, contents: '30' }, '32' ]
			] ) );

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 1, 1 ] ), 3 );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 1, 1 ] ) );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', { colspan: 2, contents: '01' }, '02' ],
				[ '10', '[]11', '', '12' ],
				[ '20', { colspan: 3, contents: '21' } ],
				[ { colspan: 3, contents: '30' }, '32' ]
			] ) );
		} );

		it( 'should unsplit table cell if split is equal to colspan', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ],
				[ '20', { colspan: 2, contents: '21[]' } ],
				[ { colspan: 2, contents: '30' }, '32' ]
			] ) );

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 2, 1 ] ), 2 );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ],
				[ '20', '21[]', '' ],
				[ { colspan: 2, contents: '30' }, '32' ]
			] ) );
		} );

		it( 'should properly unsplit table cell if split is uneven', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 3, contents: '10[]' } ]
			] ) );

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 1, 0 ] ), 2 );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, contents: '10[]' }, '' ]
			] ) );
		} );

		it( 'should properly set colspan of inserted cells', () => {
			setData( model, modelTable( [
				[ '00', '01', '02', '03' ],
				[ { colspan: 4, contents: '10[]' } ]
			] ) );

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 1, 0 ] ), 2 );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 1, 0 ] ), 2 );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01', '02', '03', '04', '05' ],
				[ { colspan: 3, rowspan: 2, contents: '10[]' }, { colspan: 2, rowspan: 2, contents: '' }, '15' ],
				[ '25' ]
			] ) );
		} );
	} );

	describe( 'splitCellVertically()', () => {
		it( 'should split table cell to default table cells number', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '[]11', '12' ],
				[ '20', '21', '22' ]
			] ) );

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 1 ] ) );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 1 ] ), 4 );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 0 ] ), 3 );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ { rowspan: 4, contents: '00' }, '01', { rowspan: 5, contents: '02' } ],
				[ '[]11' ],
				[ '' ],
				[ '' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should unsplit rowspanned cell', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '01[]' } ],
				[ '10' ],
				[ '20', '21' ]
			] ) );

			const tableCell = root.getNodeByPath( [ 0, 0, 1 ] );

			tableUtils.splitCellVertically( tableCell, 2 );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			tableUtils.splitCellVertically( tableCell, 2 );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			tableUtils.splitCellVertically( tableCell, 3 );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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
	} );

	describe( 'getColumns()', () => {
		it( 'should return proper number of columns', () => {
			setData( model, modelTable( [
				[ '00', { colspan: 3, contents: '01' }, '04' ]
			] ) );

			expect( tableUtils.getColumns( root.getNodeByPath( [ 0 ] ) ) ).to.equal( 5 );
		} );
	} );
} );
