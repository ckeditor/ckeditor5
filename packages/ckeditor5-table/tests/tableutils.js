/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import TableEditing from '../src/tableediting';
import TableUtils from '../src/tableutils';
import { modelTable } from './_utils/utils';

describe( 'TableUtils', () => {
	let editor, model, root, tableUtils;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return ModelTestEditor.create( {
			plugins: [ Paragraph, TableEditing, TableUtils ]
		} ).then( newEditor => {
			editor = newEditor;
			model = editor.model;
			root = model.document.getRoot( 'main' );
			tableUtils = editor.plugins.get( TableUtils );

			model.schema.register( 'foo', {
				allowIn: 'table',
				allowContentOf: '$block',
				isLimit: true
			} );
			editor.conversion.elementToElement( {
				view: 'foo',
				model: 'foo'
			} );
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
		it( 'should be decorated', () => {
			const spy = sinon.spy();

			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.on( 'insertRows', spy );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '11[]', '12' ],
				[ '', '' ],
				[ '21', '22' ]
			] ) );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should insert row in given table at given index', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ],
				[ '', '' ],
				[ '31', '32' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should expand rowspan of a cell that overlaps inserted rows', () => {
			// +----+----+----+----+
			// | 00      | 02 | 03 |
			// +----+----+----+----+ <-- heading rows
			// | 10      | 12 | 13 |
			// +         +----+----+
			// |         | 22 | 23 |
			// +----+----+----+----+
			//                     ^-- heading columns
			setData( model, modelTable( [
				[ { contents: '00', colspan: 2 }, '02', '03' ],
				[ { contents: '10[]', colspan: 2, rowspan: 2 }, '12', '13' ],
				[ '22', '23' ]
			], { headingColumns: 3, headingRows: 1 } ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 2, rows: 3 } );

			// +----+----+----+----+
			// | 00      | 02 | 03 |
			// +----+----+----+----+ <-- heading rows
			// | 10      | 12 | 13 |
			// +         +----+----+
			// |         |    |    |
			// +         +----+----+
			// |         |    |    |
			// +         +----+----+
			// |         |    |    |
			// +         +----+----+
			// |         | 22 | 23 |
			// +----+----+----+----+
			//                     ^-- heading columns
			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ { contents: '00', colspan: 2 }, '02', '03' ],
				[ { contents: '10[]', colspan: 2, rowspan: 5 }, '12', '13' ],
				[ '', '' ],
				[ '', '' ],
				[ '', '' ],
				[ '22', '23' ]
			], { headingColumns: 3, headingRows: 1 } ) );
		} );

		it( 'should not expand rowspan of a cell that does not overlaps inserted rows', () => {
			// +----+----+----+
			// | 00 | 01 | 02 |
			// +    +----+----+
			// |    | 11 | 12 |
			// +----+----+----+ <-- heading rows
			// | 20 | 21 | 22 |
			// +----+----+----+
			setData( model, modelTable( [
				[ { contents: '00', rowspan: 2 }, '01', '02' ],
				[ '11[]', '12' ],
				[ '20', '21', '22' ]
			], { headingRows: 2 } ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 2, rows: 3 } );

			// +----+----+----+
			// | 00 | 01 | 02 |
			// +    +----+----+
			// |    | 11 | 12 |
			// +----+----+----+ <-- heading rows
			// |    |    |    |
			// +----+----+----+
			// |    |    |    |
			// +----+----+----+
			// |    |    |    |
			// +----+----+----+
			// | 20 | 21 | 22 |
			// +----+----+----+
			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ { contents: '00', rowspan: 2 }, '01', '02' ],
				[ '11[]', '12' ],
				[ '', '', '' ],
				[ '', '', '' ],
				[ '', '', '' ],
				[ '20', '21', '22' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should properly calculate columns if next row has colspans', () => {
			// +----+----+----+
			// | 00 | 01 | 02 |
			// +    +----+----+
			// |    | 11 | 12 |
			// +----+----+----+ <-- heading rows
			// | 20           |
			// +----+----+----+
			setData( model, modelTable( [
				[ { contents: '00', rowspan: 2 }, '01', '02' ],
				[ '11[]', '12' ],
				[ { contents: '20', colspan: 3 } ]
			], { headingRows: 2 } ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 2, rows: 3 } );

			// +----+----+----+
			// | 00 | 01 | 02 |
			// +    +----+----+
			// |    | 11 | 12 |
			// +----+----+----+ <-- heading rows
			// |    |    |    |
			// +----+----+----+
			// |    |    |    |
			// +----+----+----+
			// |    |    |    |
			// +----+----+----+
			// | 20           |
			// +----+----+----+
			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ { contents: '00', rowspan: 2 }, '01', '02' ],
				[ '11[]', '12' ],
				[ '', '', '' ],
				[ '', '', '' ],
				[ '', '', '' ],
				[ { contents: '20', colspan: 3 } ]
			], { headingRows: 2 } ) );
		} );

		it( 'should insert rows at the end of a table', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 2, rows: 3 } );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ],
				[ '', '' ],
				[ '', '' ],
				[ '', '' ]
			] ) );
		} );

		it( 'should throw error when options.at is larger than the amount of rows in the table', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			expect(
				() => tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 3, rows: 3 } )
			).to.throw(
				CKEditorError,
				'tableutils-insertrows-insert-out-of-range'
			);

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );
		} );

		it( 'should insert rows into a table with a non-row element', () => {
			setData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>[]10</paragraph></tableCell>' +
						'<tableCell><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
					'<foo>An extra element</foo>' +
				'</table>'
			);

			tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 2, rows: 3 } );

			expect( getData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>[]10</paragraph></tableCell>' +
						'<tableCell><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<foo>An extra element</foo>' +
				'</table>'
			);
		} );

		describe( 'with copyStructureFrom enabled', () => {
			beforeEach( () => {
				// +----+----+----+----+----+----+
				// | 00 | 01      | 03 | 04 | 05 |
				// +----+         +    +----+----+
				// | 10 |         |    | 14      |
				// +----+----+----+----+----+----+
				setData( model, modelTable( [
					[ '00', { contents: '01', colspan: 2, rowspan: 2 }, { contents: '03', rowspan: 2 }, '04', '05' ],
					[ '10', { contents: '14', colspan: 2 } ]
				] ) );
			} );

			it( 'should copy structure from the first row', () => {
				tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 0, rows: 1, copyStructureFromAbove: false } );

				// +----+----+----+----+----+----+
				// |    |         |    |    |    |
				// +----+----+----+----+----+----+
				// | 00 | 01      | 03 | 04 | 05 |
				// +----+         +    +----+----+
				// | 10 |         |    | 14      |
				// +----+----+----+----+----+----+
				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '', { contents: '', colspan: 2 }, '', '', '' ],
					[ '00', { contents: '01', colspan: 2, rowspan: 2 }, { contents: '03', rowspan: 2 }, '04', '05' ],
					[ '10', { contents: '14', colspan: 2 } ]
				] ) );
			} );

			it( 'should copy structure from the first row and properly handle row-spanned cells', () => {
				tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 1, rows: 1, copyStructureFromAbove: true } );

				// +----+----+----+----+----+----+
				// | 00 | 01      | 03 | 04 | 05 |
				// +----+         +    +----+----+
				// |    |         |    |    |    |
				// +----+         +    +----+----+
				// | 10 |         |    | 14      |
				// +----+----+----+----+----+----+
				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00', { contents: '01', colspan: 2, rowspan: 3 }, { contents: '03', rowspan: 3 }, '04', '05' ],
					[ '', '', '' ],
					[ '10', { contents: '14', colspan: 2 } ]
				] ) );
			} );

			it( 'should copy structure from the last row', () => {
				tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 2, rows: 1, copyStructureFromAbove: true } );

				// +----+----+----+----+----+----+
				// | 00 | 01      | 03 | 04 | 05 |
				// +----+         +    +----+----+
				// | 10 |         |    | 14      |
				// +----+----+----+----+----+----+
				// |    |         |    |         |
				// +----+----+----+----+----+----+
				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00', { contents: '01', colspan: 2, rowspan: 2 }, { contents: '03', rowspan: 2 }, '04', '05' ],
					[ '10', { contents: '14', colspan: 2 } ],
					[ '', { contents: '', colspan: 2 }, '', { contents: '', colspan: 2 } ]
				] ) );
			} );

			it( 'should copy structure from the last row and properly handle row-spanned cells', () => {
				tableUtils.insertRows( root.getNodeByPath( [ 0 ] ), { at: 1, rows: 1, copyStructureFromAbove: false } );

				// +----+----+----+----+----+----+
				// | 00 | 01      | 03 | 04 | 05 |
				// +----+         +    +----+----+
				// |    |         |    |         |
				// +----+         +    +----+----+
				// | 10 |         |    | 14      |
				// +----+----+----+----+----+----+
				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00', { contents: '01', colspan: 2, rowspan: 3 }, { contents: '03', rowspan: 3 }, '04', '05' ],
					[ '', { contents: '', colspan: 2 } ],
					[ '10', { contents: '14', colspan: 2 } ]
				] ) );
			} );
		} );
	} );

	describe( 'insertColumns()', () => {
		it( 'should be decorated', () => {
			const spy = sinon.spy();

			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.on( 'insertColumns', spy );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '11[]', '', '12' ],
				[ '21', '', '22' ]
			] ) );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should insert column in given table at given index', () => {
			setData( model, modelTable( [
				[ '11[]', '12' ],
				[ '21', '22' ]
			] ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00[]', '', '01' ],
				[ { colspan: 3, contents: '10' } ],
				[ '20', '', '21' ]
			], { headingColumns: 3 } ) );
		} );

		it( 'should skip wide spanned columns', () => {
			// +----+----+----+----+----+----+
			// | 00 | 01 | 02 | 03 | 04 | 05 |
			// +----+----+----+----+----+----+
			// | 10 | 11 | 12      | 14 | 15 |
			// +----+----+----+----+----+----+
			// | 20                | 24      |
			// +----+----+----+----+----+----+
			//                     ^-- heading columns
			setData( model, modelTable( [
				[ '00', '01[]', '02', '03', '04', '05' ],
				[ '10', '11', { contents: '12', colspan: 2 }, '14', '15' ],
				[ { contents: '20', colspan: 4 }, { contents: '24', colspan: 2 } ]
			], { headingColumns: 4 } ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 2, columns: 2 } );

			// +----+----+----+----+----+----+----+----+
			// | 00 | 01 |    |    | 02 | 03 | 04 | 05 |
			// +----+----+----+----+----+----+----+----+
			// | 10 | 11 |    |    | 12      | 14 | 15 |
			// +----+----+----+----+----+----+----+----+
			// | 20                          | 24      |
			// +----+----+----+----+----+----+----+----+
			//                               ^-- heading columns
			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00', '01[]', '', '', '02', '03', '04', '05' ],
				[ '10', '11', '', '', { contents: '12', colspan: 2 }, '14', '15' ],
				[ { contents: '20', colspan: 6 }, { contents: '24', colspan: 2 } ]
			], { headingColumns: 6 } ) );
		} );

		it( 'should skip row & column spanned cells', () => {
			// +----+----+----+
			// | 00      | 02 |
			// +         +----+
			// |         | 12 |
			// +----+----+----+
			// | 20 | 21 | 22 |
			// +----+----+----+
			setData( model, modelTable( [
				[ { colspan: 2, rowspan: 2, contents: '00[]' }, '02' ],
				[ '12' ],
				[ '20', '21', '22' ]
			], { headingColumns: 2 } ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1, columns: 2 } );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ { colspan: 4, rowspan: 2, contents: '00[]' }, '02' ],
				[ '12' ],
				[ '20', '', '', '21', '22' ]
			], { headingColumns: 4 } ) );
		} );

		it( 'should properly insert column while table has row-spanned cells', () => {
			setData( model, modelTable( [
				[ { rowspan: 4, contents: '00[]' }, { rowspan: 2, contents: '01' }, '02' ],
				[ '12' ],
				[ { rowspan: 2, contents: '21' }, '22' ],
				[ '32' ]
			], { headingColumns: 2 } ) );

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1, columns: 1 } );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ { rowspan: 4, contents: '00[]' }, '', { rowspan: 2, contents: '01' }, '02' ],
				[ '', '12' ],
				[ '', { rowspan: 2, contents: '21' }, '22' ],
				[ '', '32' ]
			], { headingColumns: 3 } ) );
		} );

		it( 'should ignore table element that is not a row', () => {
			setData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>11[]</paragraph></tableCell>' +
						'<tableCell><paragraph>12</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>21</paragraph></tableCell>' +
						'<tableCell><paragraph>22</paragraph></tableCell>' +
					'</tableRow>' +
					'<foo>Bar</foo>' +
				'</table>'
			);

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 0 } );

			expect( getData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>11[]</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>12</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>21</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>22</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<foo>Bar</foo>' +
				'</table>'
			);
		} );

		it( 'should insert columns into a table with a non-row element', () => {
			setData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>[]10</paragraph></tableCell>' +
						'<tableCell><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
					'<foo>An extra element</foo>' +
				'</table>'
			);

			tableUtils.insertColumns( root.getNodeByPath( [ 0 ] ), { at: 1, columns: 3 } );

			expect( getData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>[]10</paragraph></tableCell>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
					'<foo>An extra element</foo>' +
				'</table>'
			);
		} );
	} );

	describe( 'splitCellVertically()', () => {
		it( 'should split table cell to given table cells number', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '[]11', '12' ],
				[ '20', { colspan: 2, contents: '21' } ],
				[ { colspan: 2, contents: '30' }, '32' ]
			] ) );

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 1 ] ), 3 );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ { colspan: 3, contents: '00' }, '01' ],
				[ '10[]', '', '', '11' ]
			], { headingColumns: 3 } ) );
		} );

		it( 'should split cells in a table with a non-row element', () => {
			setData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>[]10</paragraph></tableCell>' +
						'<tableCell><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
					'<foo>An extra element</foo>' +
				'</table>'
			);

			tableUtils.splitCellVertically( root.getNodeByPath( [ 0, 1, 0 ] ), 3 );

			expect( getData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell colspan="3"><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>[]10</paragraph></tableCell>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
					'<foo>An extra element</foo>' +
				'</table>'
			);
		} );
	} );

	describe( 'splitCellHorizontally()', () => {
		it( 'should split table cell to default table cells number', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '[]11', '12' ],
				[ '20', '21', '22' ]
			] ) );

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 1, 1 ] ) );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00', '01', '02' ],
				[ { rowspan: 4, contents: '10' }, '[]11', { rowspan: 4, contents: '12' } ],
				[ '' ],
				[ '' ],
				[ '' ],
				[ '20', '21', '22' ]
			] ) );
		} );

		it( 'should properly update row-spanned cells overlapping selected cell', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, contents: '00' }, '01', { rowspan: 3, contents: '02' } ],
				[ '[]11' ],
				[ '20', '21' ]
			] ) );

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 1, 0 ] ), 3 );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ { rowspan: 4, contents: '00' }, '01', { rowspan: 5, contents: '02' } ],
				[ '[]11' ],
				[ '' ],
				[ '' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should split row-spanned cell', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '01[]' } ],
				[ '10' ],
				[ '20', '21' ]
			] ) );

			const tableCell = root.getNodeByPath( [ 0, 0, 1 ] );

			tableUtils.splitCellHorizontally( tableCell, 2 );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00', '01[]' ],
				[ '10', '' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should copy colspan while splitting row-spanned cell', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, colspan: 2, contents: '01[]' } ],
				[ '10' ],
				[ '20', '21', '22' ]
			] ) );

			const tableCell = root.getNodeByPath( [ 0, 0, 1 ] );

			tableUtils.splitCellHorizontally( tableCell, 2 );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

			expect( getData( model ) ).to.equalMarkup( modelTable( [
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

		it( 'should split row-spanned cell and updated other cells rowspan when splitting to bigger number of cells', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '01[]' } ],
				[ '10' ],
				[ '20', '21' ]
			] ) );

			const tableCell = root.getNodeByPath( [ 0, 0, 1 ] );

			tableUtils.splitCellHorizontally( tableCell, 3 );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ { rowspan: 2, contents: '00' }, '01[]' ],
				[ '' ],
				[ '10', '' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should split row-spanned & col-spanned cell', () => {
			setData( model, modelTable( [
				[ '00', { colspan: 2, contents: '01[]' } ],
				[ '10', '11', '12' ]
			] ) );

			const tableCell = root.getNodeByPath( [ 0, 0, 1 ] );

			tableUtils.splitCellHorizontally( tableCell, 3 );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ { rowspan: 3, contents: '00' }, { colspan: 2, contents: '01[]' } ],
				[ { colspan: 2, contents: '' } ],
				[ { colspan: 2, contents: '' } ],
				[ '10', '11', '12' ]
			] ) );
		} );

		it( 'should split table cell from a heading section', () => {
			setData( model, modelTable( [
				[ '00[]', '01', '02' ],
				[ '10', '11', '12' ],
				[ '20', '21', '22' ]
			], { headingRows: 1 } ) );

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 0, 0 ] ), 3 );

			expect( getData( model ) ).to.equalMarkup( modelTable( [
				[ '00[]', { rowspan: 3, contents: '01' }, { rowspan: 3, contents: '02' } ],
				[ '' ],
				[ '' ],
				[ '10', '11', '12' ],
				[ '20', '21', '22' ]
			], { headingRows: 3 } ) );
		} );

		it( 'should split cells in a table with a non-row element', () => {
			setData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<foo>An extra element</foo>' +
				'</table>'
			);

			tableUtils.splitCellHorizontally( root.getNodeByPath( [ 0, 0, 0 ] ), 3 );

			expect( getData( model ) ).to.equalMarkup(
				'[<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>00</paragraph>' +
						'</tableCell>' +
						'<tableCell rowspan="3">' +
							'<paragraph>01</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<foo>An extra element</foo>' +
				'</table>]'
			);
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

	describe( 'getRows()', () => {
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

		it( 'should return proper number of rows for a table with a non-row element', () => {
			setData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>[]10</paragraph></tableCell>' +
						'<tableCell><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
					'<foo>An extra element</foo>' +
				'</table>'
			);

			expect( tableUtils.getRows( root.getNodeByPath( [ 0 ] ) ) ).to.equal( 2 );
		} );
	} );

	describe( 'removeRows()', () => {
		describe( 'single row', () => {
			it( 'should remove a given row from a table start', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 0 } );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00', '01' ],
					[ '20', '21' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should change heading rows if removing a heading row (and cell below is row-spanned)', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', { contents: '11', rowspan: 2 } ],
					[ '20' ]
				], { headingRows: 1 } ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 0 } );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '10', { contents: '11', rowspan: 2 } ],
					[ '20' ]
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
				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00', '01', { contents: '02', rowspan: 2 }, { contents: '03', rowspan: 3 }, { contents: '04', rowspan: 4 } ],
					[ '20', '21' ],
					[ '30', '31', '32' ],
					[ '40', '41', '42', '43' ],
					[ '50', '51', '52', '53', '54' ]
				] ) );
			} );

			it( 'should decrease rowspan of table cells from previous rows (row-spanned cells on different rows)', () => {
				setData( model, modelTable( [
					[ { rowspan: 4, contents: '00' }, { rowspan: 3, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
					[ { rowspan: 2, contents: '13' }, '14' ],
					[ '22', '24' ],
					[ '31', '32', '33', '34' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 2 } );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 3, contents: '00' }, { rowspan: 2, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
					[ '13', '14' ],
					[ '31', '32', '33', '34' ]
				] ) );
			} );

			it( 'should move row-spanned cells to a row below removing it\'s row', () => {
				setData( model, modelTable( [
					[ { rowspan: 3, contents: '00' }, { rowspan: 2, contents: '01' }, '02' ],
					[ '12' ],
					[ '21', '22' ],
					[ '30', '31', '32' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 0 } );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 2, contents: '00' }, '01', '12' ],
					[ '21', '22' ],
					[ '30', '31', '32' ]
				] ) );
			} );

			it( 'should move row-spanned cells to a row below removing it\'s row (other cell is overlapping removed row)', () => {
				setData( model, modelTable( [
					[ '00', { rowspan: 3, contents: '01' }, '02', '03', '04' ],
					[ '10', { rowspan: 2, contents: '12' }, '13', '14' ],
					[ '20', '23', '24' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 1 } );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00', { rowspan: 2, contents: '01' }, '02', '03', '04' ],
					[ '20', '12', '23', '24' ]
				] ) );
			} );

			it( 'should remove row in a table with a non-row element', () => {
				setData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>00</paragraph></tableCell>' +
							'<tableCell><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]10</paragraph></tableCell>' +
							'<tableCell><paragraph>11</paragraph></tableCell>' +
						'</tableRow>' +
						'<foo>An extra element</foo>' +
					'</table>'
				);

				tableUtils.removeRows( root.getChild( 0 ), { at: 1 } );

				expect( getData( model ) ).to.equalMarkup(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>00</paragraph></tableCell>' +
							'<tableCell><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
						'<foo>[]An extra element</foo>' +
					'</table>'
				);
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '20', '21' ]
				] ) );
			} );

			it( 'should move row-spanned cells to a row after removed rows section', () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ { rowspan: 4, contents: '10' }, { rowspan: 3, contents: '11' }, { rowspan: 2, contents: '12' }, '13' ],
					[ { rowspan: 3, contents: '23' } ],
					[ '32' ],
					[ '41', '42' ]
				] ) );

				tableUtils.removeRows( root.getChild( 0 ), { at: 1, rows: 2 } );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				tableUtils.removeRows( root.getChild( 0 ), { at: 2, rows: 2 } );

				// +----+----+----+----+----+
				// | 00 | 01 | 02 | 03 | 04 |
				// +----+    +    +    +    +
				// | 10 |    |    |    |    |
				// +----+----+----+----+    +
				// | 40 | 41 | 42 | 43 |    |
				// +----+----+----+----+----+
				// | 50 | 51 | 52 | 53 | 54 |
				// +----+----+----+----+----+
				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00', { contents: '01', rowspan: 2 }, { contents: '02', rowspan: 2 }, { contents: '03', rowspan: 2 },
						{ contents: '04', rowspan: 3 } ],
					[ '10' ],
					[ '40', '41', '42', '43' ],
					[ '50', '51', '52', '53', '54' ]
				] ) );
			} );

			it( 'should re-use batch to create one undo step', () => {
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

				const batch = model.createBatch();

				tableUtils.removeRows( root.getChild( 0 ), { at: 0, rows: 2, batch } );

				expect( createdBatches.size ).to.equal( 1 );
			} );

			it( 'should throw the error when provided options point to a non-existent rows', () => {
				setData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>00</paragraph></tableCell>' +
							'<tableCell><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]10</paragraph></tableCell>' +
							'<tableCell><paragraph>11</paragraph></tableCell>' +
						'</tableRow>' +
					'<foo>An extra element</foo>' +
					'</table>'
				);

				expect(
					() => tableUtils.removeRows( root.getChild( 0 ), { at: 1, rows: 2 } )
				).to.throw(
					CKEditorError,
					'tableutils-removerows-row-index-out-of-range'
				);
			} );
		} );
	} );

	describe( 'removeColumns()', () => {
		describe( 'single row', () => {
			it( 'should remove a given column', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00' ],
					[ '10' ]
				] ) );
			} );

			it( 'should remove column if other column is row-spanned (last column)', () => {
				setData( model, modelTable( [
					[ '00', { rowspan: 2, contents: '01' } ],
					[ '10' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 0 } );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '01' ]
				] ) );
			} );

			it( 'should remove column if other column is row-spanned (first column)', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, '01' ],
					[ '11' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 1 } );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '01', '02' ],
					[ '21', '22' ]
				] ) );
			} );

			it( 'should remove the column properly when multiple rows should be removed (because of to row-spans)', () => {
				setData( model, modelTable( [
					[ '00', { contents: '01', rowspan: 3 }, { contents: '02', rowspan: 3 } ],
					[ '10' ],
					[ '20' ]
				] ) );

				tableUtils.removeColumns( root.getNodeByPath( [ 0 ] ), { at: 0 } );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '01', '02' ]
				] ) );
			} );

			it( 'should remove column in a table with a non-row element', () => {
				setData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>00</paragraph></tableCell>' +
							'<tableCell><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]10</paragraph></tableCell>' +
							'<tableCell><paragraph>11</paragraph></tableCell>' +
						'</tableRow>' +
					'<foo>An extra element</foo>' +
					'</table>'
				);

				tableUtils.removeColumns( root.getChild( 0 ), { at: 0 } );

				expect( getData( model ) ).to.equalMarkup(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]11</paragraph></tableCell>' +
						'</tableRow>' +
						'<foo>An extra element</foo>' +
					'</table>'
				);
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
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

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00' ],
					[ '12' ],
					[ '22' ]
				] ) );
			} );

			it( 'should remove column in a table with a non-row element', () => {
				setData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>00</paragraph></tableCell>' +
							'<tableCell><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]10</paragraph></tableCell>' +
							'<tableCell><paragraph>11</paragraph></tableCell>' +
						'</tableRow>' +
					'<foo>An extra element</foo>' +
					'</table>'
				);

				tableUtils.removeColumns( root.getChild( 0 ), { at: 1, columns: 1 } );

				expect( getData( model ) ).to.equalMarkup(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>00</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]10</paragraph></tableCell>' +
						'</tableRow>' +
						'<foo>An extra element</foo>' +
					'</table>'
				);
			} );
		} );
	} );

	describe( 'createTable()', () => {
		it( 'should create table', () => {
			setData( model, '[]' );

			model.change( writer => {
				const table = tableUtils.createTable( writer, { rows: 3, columns: 2 } );

				model.insertContent( table, model.document.selection.focus );
			} );

			expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
				[ '', '' ],
				[ '', '' ],
				[ '', '' ]
			] ) );
		} );

		it( 'should create table with heading rows', () => {
			setData( model, '[]' );

			model.change( writer => {
				const table = tableUtils.createTable( writer, { rows: 3, columns: 2, headingRows: 1 } );

				model.insertContent( table, model.document.selection.focus );
			} );

			expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
				[ '', '' ],
				[ '', '' ],
				[ '', '' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should create table with heading columns', () => {
			setData( model, '[]' );

			model.change( writer => {
				const table = tableUtils.createTable( writer, { rows: 3, columns: 2, headingColumns: 1 } );

				model.insertContent( table, model.document.selection.focus );
			} );

			expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
				[ '', '' ],
				[ '', '' ],
				[ '', '' ]
			], { headingColumns: 1 } ) );
		} );

		it( 'should create table with heading rows and columns', () => {
			setData( model, '[]' );

			model.change( writer => {
				const table = tableUtils.createTable( writer, { rows: 3, columns: 2, headingRows: 2, headingColumns: 1 } );

				model.insertContent( table, model.document.selection.focus );
			} );

			expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
				[ '', '' ],
				[ '', '' ],
				[ '', '' ]
			], { headingRows: 2, headingColumns: 1 } ) );
		} );

		it( 'should clamp table heading rows and columns to the rows and columns number', () => {
			setData( model, '[]' );

			model.change( writer => {
				const table = tableUtils.createTable( writer, { rows: 2, columns: 2, headingRows: 3, headingColumns: 3 } );

				model.insertContent( table, model.document.selection.focus );
			} );

			expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
				[ '', '' ],
				[ '', '' ]
			], { headingRows: 2, headingColumns: 2 } ) );
		} );
	} );
} );
