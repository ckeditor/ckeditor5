/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, parse, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../../src/tableediting';
import { modelTable } from './../_utils/utils';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import TableCellPropertiesEditing from '../../src/tablecellproperties/tablecellpropertiesediting';

describe( 'Table cell default properties post-fixer', () => {
	let editor, model, root;

	const defaultProperties = {
		borderStyle: 'solid',
		borderWidth: '2px',
		borderColor: '#f00',
		horizontalAlignment: 'right',
		verticalAlignment: 'bottom'
	};

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, Paragraph, UndoEditing, TableCellPropertiesEditing ],
				table: {
					tableCellProperties: {
						defaultProperties
					}
				}
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

	describe( 'on collaboration', () => {
		it( 'should add missing cells to columns (remove column vs insert row)', () => {
			_testExternal(
				modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				], { cellProperties: defaultProperties } ),
				writer => _removeColumn( writer, 1, [ 0, 1 ] ),
				writer => _insertRow( writer, 1, [ 'a', 'b' ] ),
				// Table should have added empty cells.
				modelTable( [
					[ '00', '' ],
					[ 'a', 'b' ],
					[ '10', '' ]
				], { cellProperties: defaultProperties } ),
				// Table will have empty column after undo.
				modelTable( [
					[ '00', '01', '' ],
					[ 'a', 'b', '' ],
					[ '10', '11', '' ]
				], { cellProperties: defaultProperties } ) );
		} );

		it( 'should add missing cells to columns (insert row vs remove column)', () => {
			_testExternal(
				modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				], { cellProperties: defaultProperties } ),
				writer => _insertRow( writer, 1, [ 'a', 'b' ] ),
				writer => _removeColumn( writer, 1, [ 0, 2 ] ),
				// There should be empty cells added.
				modelTable( [
					[ '00', '' ],
					[ 'a', 'b' ],
					[ '10', '' ]
				], { cellProperties: defaultProperties } ),
				// Table will have empty column after undo.
				modelTable( [
					[ '00', '' ],
					[ '10', '' ]
				], { cellProperties: defaultProperties } ) );
		} );

		it( 'should add empty cell to an added row (insert row vs insert column)', () => {
			_testExternal(
				modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				], { cellProperties: defaultProperties } ),
				writer => _insertRow( writer, 1, [ 'a', 'b' ] ),
				writer => _insertColumn( writer, 1, [ 0, 2 ] ),
				// There should be empty cells added.
				modelTable( [
					[ '00', '', '01' ],
					[ 'a', 'b', '' ],
					[ '10', '', '11' ]
				], { cellProperties: defaultProperties } ),
				// Table will have empty column after undo.
				modelTable( [
					[ '00', '', '01' ],
					[ '10', '', '11' ]
				], { cellProperties: defaultProperties } ) );
		} );

		it( 'should add empty cell to an added row (insert column vs insert row)', () => {
			_testExternal(
				modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				], { cellProperties: defaultProperties } ),
				writer => _insertColumn( writer, 1, [ 0, 1 ] ),
				writer => _insertRow( writer, 1, [ 'a', 'b' ] ),
				// There should be empty cells added.
				modelTable( [
					[ '00', '', '01' ],
					[ 'a', 'b', '' ],
					[ '10', '', '11' ]
				], { cellProperties: defaultProperties } ),
				// Table will have empty column after undo.
				modelTable( [
					[ '00', '01', '' ],
					[ 'a', 'b', '' ],
					[ '10', '11', '' ]
				], { cellProperties: defaultProperties } ) );
		} );

		it( 'should add empty cell when inserting column over a colspanned cell (insert column vs insert column)', () => {
			_testExternal(
				modelTable( [
					[ { colspan: 3, contents: '00' } ],
					[ '10', '11', '12' ]
				], { cellProperties: defaultProperties } ),
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
				], { cellProperties: defaultProperties } ),
				// Table will have empty column after undo.
				modelTable( [
					[ { colspan: 3, contents: '00' }, '' ],
					[ '10', '', '11', '12' ]
				], { cellProperties: defaultProperties } ) );
		} );

		it( 'should add empty cell when inserting column over a colspanned cell (insert column vs insert column) - inverted', () => {
			_testExternal(
				modelTable( [
					[ { colspan: 3, contents: '00' } ],
					[ '10', '11', '12' ]
				], { cellProperties: defaultProperties } ),
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
				], { cellProperties: defaultProperties } ),
				// Table will have empty column after undo.
				modelTable( [
					[ { colspan: 3, contents: '00' }, '' ],
					[ '10', '11', '', '12' ]
				], { cellProperties: defaultProperties } ) );
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

		function _insertRow( writer, rowIndex, rowData ) {
			const table = root.getChild( 0 );

			const parsedTable = parse(
				modelTable( [ rowData ] ),
				model.schema
			);

			writer.insert( parsedTable.getChild( 0 ), table, rowIndex );
		}

		function _setAttribute( writer, attributeKey, attributeValue, path ) {
			const node = root.getNodeByPath( path );

			writer.setAttribute( attributeKey, attributeValue, node );
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
