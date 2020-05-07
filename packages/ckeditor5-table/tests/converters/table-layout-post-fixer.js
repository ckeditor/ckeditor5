/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, parse, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../../src/tableediting';
import { modelTable } from './../_utils/utils';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'Table layout post-fixer', () => {
	let editor, model, root;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, Paragraph, UndoEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot();
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	describe( 'on insert table', () => {
		it( 'should add missing columns to tableRows that are shorter then the longest table row', () => {
			const parsed = parse( modelTable( [
				[ '00' ],
				[ '10', '11', '12' ],
				[ '20', '21' ],
				[]
			] ), model.schema );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
				writer.insert( parsed, root );
			} );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ '00', '', '' ],
				[ '10', '11', '12' ],
				[ '20', '21', '' ],
				[ '', '', '' ]
			] ) );
		} );

		it( 'should add missing columns to tableRows that are shorter then the longest table row (complex 1)', () => {
			const parsed = parse( modelTable( [
				[ '00', { rowspan: 2, contents: '10' } ],
				[ '10', { colspan: 2, contents: '12' } ],
				[ '20', '21' ]
			] ), model.schema );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
				writer.insert( parsed, root );
			} );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ '00', { rowspan: 2, contents: '10' }, '', '' ],
				[ '10', { colspan: 2, contents: '12' } ],
				[ '20', '21', '', '' ]
			] ) );
		} );

		it( 'should add missing columns to tableRows that are shorter then the longest table row (complex 2)', () => {
			const parsed = parse( modelTable( [
				[ { colspan: 6, contents: '00' } ],
				[ { rowspan: 2, contents: '10' }, '11', { colspan: 3, contents: '12' } ],
				[ '21', '22' ]
			] ), model.schema );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
				writer.insert( parsed, root );
			} );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ { colspan: 6, contents: '00' } ],
				[ { rowspan: 2, contents: '10' }, '11', { colspan: 3, contents: '12' }, '' ],
				[ '21', '22', '', '', '' ]
			] ) );
		} );

		it( 'should fix the wrong rowspan attribute of a table cell inside the header', () => {
			const parsed = parse( modelTable( [
				[ { rowspan: 2, contents: '00' }, { rowspan: 3, contents: '01' }, '02' ],
				[ { rowspan: 8, contents: '12' } ],
				[ '20', '21', '22' ]
			], { headingRows: 2 } ), model.schema );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
				writer.insert( parsed, root );
			} );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ { rowspan: 2, contents: '00' }, { rowspan: 2, contents: '01' }, '02' ],
				[ '12' ],
				[ '20', '21', '22' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should fix the wrong rowspan attribute of a table cell inside the body', () => {
			const parsed = parse( modelTable( [
				[ '00', '01', '02' ],
				[ { rowspan: 2, contents: '10' }, { rowspan: 3, contents: '11' }, '12' ],
				[ { rowspan: 8, contents: '22' } ]
			], { headingRows: 1 } ), model.schema );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
				writer.insert( parsed, root );
			} );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ '00', '01', '02' ],
				[ { rowspan: 2, contents: '10' }, { rowspan: 2, contents: '11' }, '12' ],
				[ '22' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should fix multiple tables', () => {
			const tableA = modelTable( [
				[ '11' ],
				[ '21', '22' ]
			] );
			const tableB = modelTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] );
			const tableC = modelTable( [
				[ 'xx' ],
				[ 'yy', 'yy' ]
			] );

			const parsed = parse( tableA + tableB + tableC, model.schema );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
				writer.insert( parsed, root );
			} );

			const expectedTableA = modelTable( [
				[ '11', '' ],
				[ '21', '22' ]
			] );
			const expectedTableB = modelTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] );
			const expectedTableC = modelTable( [
				[ 'xx', '' ],
				[ 'yy', 'yy' ]
			] );

			const expectedTables = expectedTableA + expectedTableB + expectedTableC;

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), expectedTables );
		} );

		it( 'should not crash on table remove', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ]
			] ) );

			expect( () => {
				model.change( writer => {
					writer.remove( writer.createRangeIn( root ) );
				} );
			} ).to.not.throw();

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph></paragraph>' );
		} );
	} );

	describe( 'on collaboration', () => {
		it( 'should add missing cells to columns (remove column vs insert row)', () => {
			_testExternal(
				modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ),
				writer => _removeColumn( writer, 1, [ 0, 1 ] ),
				writer => _insertRow( writer, 1, [ 'a', 'b' ] ),
				// Table should have added empty cells.
				modelTable( [
					[ '00', '' ],
					[ 'a', 'b' ],
					[ '10', '' ]
				] ),
				// Table will have empty column after undo.
				modelTable( [
					[ '00', '01', '' ],
					[ 'a', 'b', '' ],
					[ '10', '11', '' ]
				] ) );
		} );

		it( 'should add missing cells to columns (insert row vs remove column)', () => {
			_testExternal(
				modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ),
				writer => _insertRow( writer, 1, [ 'a', 'b' ] ),
				writer => _removeColumn( writer, 1, [ 0, 2 ] ),
				// There should be empty cells added.
				modelTable( [
					[ '00', '' ],
					[ 'a', 'b' ],
					[ '10', '' ]
				] ),
				// Table will have empty column after undo.
				modelTable( [
					[ '00', '' ],
					[ '10', '' ]
				] ) );
		} );

		it( 'should add empty cell to an added row (insert row vs insert column)', () => {
			_testExternal(
				modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ),
				writer => _insertRow( writer, 1, [ 'a', 'b' ] ),
				writer => _insertColumn( writer, 1, [ 0, 2 ] ),
				// There should be empty cells added.
				modelTable( [
					[ '00', '', '01' ],
					[ 'a', 'b', '' ],
					[ '10', '', '11' ]
				] ),
				// Table will have empty column after undo.
				modelTable( [
					[ '00', '', '01' ],
					[ '10', '', '11' ]
				] ) );
		} );

		it( 'should add empty cell to an added row (insert column vs insert row)', () => {
			_testExternal(
				modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ),
				writer => _insertColumn( writer, 1, [ 0, 1 ] ),
				writer => _insertRow( writer, 1, [ 'a', 'b' ] ),
				// There should be empty cells added.
				modelTable( [
					[ '00', '', '01' ],
					[ 'a', 'b', '' ],
					[ '10', '', '11' ]
				] ),
				// Table will have empty column after undo.
				modelTable( [
					[ '00', '01', '' ],
					[ 'a', 'b', '' ],
					[ '10', '11', '' ]
				] ) );
		} );

		it( 'should add empty cell when inserting column over a colspanned cell (insert column vs insert column)', () => {
			_testExternal(
				modelTable( [
					[ { colspan: 3, contents: '00' } ],
					[ '10', '11', '12' ]
				] ),
				writer => {
					_setAttribute( writer, 'colspan', 4, [ 0, 0, 0 ] );
					_insertColumn( writer, 2, [ 1 ] );
				},
				writer => {
					_setAttribute( writer, 'colspan', 4, [ 0, 0, 0 ] );
					_insertColumn( writer, 1, [ 1 ] );
				},
				// There should be empty cells added.
				modelTable( [
					[ { colspan: 4, contents: '00' }, '' ],
					[ '10', '', '11', '', '12' ]
				] ),
				// Table will have empty column after undo.
				modelTable( [
					[ { colspan: 3, contents: '00' }, '' ],
					[ '10', '', '11', '12' ]
				] ) );
		} );

		it( 'should add empty cell when inserting column over a colspanned cell (insert column vs insert column) - inverted', () => {
			_testExternal(
				modelTable( [
					[ { colspan: 3, contents: '00' } ],
					[ '10', '11', '12' ]
				] ),
				writer => {
					_setAttribute( writer, 'colspan', 4, [ 0, 0, 0 ] );
					_insertColumn( writer, 1, [ 1 ] );
				},
				writer => {
					_setAttribute( writer, 'colspan', 4, [ 0, 0, 0 ] );
					_insertColumn( writer, 3, [ 1 ] );
				},
				// There should be empty cells added.
				modelTable( [
					[ { colspan: 4, contents: '00' }, '' ],
					[ '10', '', '11', '', '12' ]
				] ),
				// Table will have empty column after undo.
				modelTable( [
					[ { colspan: 3, contents: '00' }, '' ],
					[ '10', '11', '', '12' ]
				] ) );
		} );

		it( 'should insert table cell on undo (change table headers on row with rowspanned cell vs remove row)', () => {
			_testExternal(
				modelTable( [
					[ '11', { rowspan: 2, contents: '12' }, '13' ],
					[ '21', '23' ],
					[ '31', '32', '33' ]
				] ),
				writer => {
					_setAttribute( writer, 'headingRows', 1, [ 0 ] );
					_removeAttribute( writer, 'rowspan', [ 0, 0, 1 ] );
					_insertCell( writer, 1, 1 );
				},
				writer => {
					_removeRow( writer, 1 );
				},
				modelTable( [
					[ '11', '12', '13' ],
					[ '31', '32', '33' ]
				], { headingRows: 1 } ),
				modelTable( [
					[ '11', { rowspan: 2, contents: '12' }, '13', '' ],
					[ '31', '32', '33' ]
				] ) );
		} );

		it( 'should insert empty table cell (remove row vs change table headers on row with rowspanned cell)', () => {
			_testExternal(
				modelTable( [
					[ '11', { rowspan: 2, contents: '12' }, '13' ],
					[ '21', '23' ],
					[ '31', '32', '33' ]
				] ),
				writer => {
					_removeRow( writer, 1 );
				},
				writer => {
					_setAttribute( writer, 'headingRows', 1, [ 0 ] );
					_removeAttribute( writer, 'rowspan', [ 0, 0, 1 ] );
				},
				modelTable( [
					[ '11', '12', '13', '' ],
					[ '31', '32', '33', '' ]
				], { headingRows: 1 } ),
				modelTable( [
					[ '11', '12', '13', '' ],
					[ '21', '23', '', '' ],
					[ '31', '32', '33', '' ]
				], { headingRows: 1 } ) );
		} );

		function _testExternal( initialData, localCallback, externalCallback, modelAfter, modelAfterUndo ) {
			setModelData( model, initialData );

			model.change( localCallback );

			model.enqueueChange( 'transparent', externalCallback );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelAfter );

			editor.execute( 'undo' );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelAfterUndo );

			editor.execute( 'redo' );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelAfter );
		}

		function _removeColumn( writer, columnIndex, rows ) {
			const table = root.getChild( 0 );

			for ( const index of rows ) {
				const tableRow = table.getChild( index );
				const tableCell = tableRow.getChild( columnIndex );

				writer.remove( tableCell );
			}
		}

		function _removeRow( writer, rowIndex ) {
			const table = root.getChild( 0 );
			const tableRow = table.getChild( rowIndex );

			writer.remove( tableRow );
		}

		function _insertRow( writer, rowIndex, rowData ) {
			const table = root.getChild( 0 );

			const parsedTable = parse(
				modelTable( [ rowData ] ),
				model.schema
			);

			writer.insert( parsedTable.getChild( 0 ), table, rowIndex );
		}

		function _insertCell( writer, rowIndex, index ) {
			const table = root.getChild( 0 );
			const tableRow = table.getChild( rowIndex );

			const tableCell = writer.createElement( 'tableCell' );
			writer.insert( tableCell, tableRow, index );
			writer.insertElement( 'paragraph', tableCell );
		}

		function _setAttribute( writer, attributeKey, attributeValue, path ) {
			const node = root.getNodeByPath( path );

			writer.setAttribute( attributeKey, attributeValue, node );
		}

		function _removeAttribute( writer, attributeKey, path ) {
			const node = root.getNodeByPath( path );

			writer.removeAttribute( attributeKey, node );
		}

		function _insertColumn( writer, columnIndex, rows ) {
			const table = root.getChild( 0 );

			for ( const index of rows ) {
				const tableRow = table.getChild( index );

				const tableCell = writer.createElement( 'tableCell' );
				writer.insert( tableCell, tableRow, columnIndex );
				writer.insertElement( 'paragraph', tableCell );
			}
		}
	} );
} );
