/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData, _getModelData, ModelSelection } from '@ckeditor/ckeditor5-engine';
import { BoldEditing, ItalicEditing } from '@ckeditor/ckeditor5-basic-styles';
import { AlignmentEditing } from '@ckeditor/ckeditor5-alignment';
import { LinkEditing } from '@ckeditor/ckeditor5-link';

import { TableEditing } from '../../src/tableediting.js';
import { TableCellPropertiesEditing } from '../../src/tablecellproperties/tablecellpropertiesediting.js';
import { modelTable } from '../_utils/utils.js';

import {
	getSelectionAffectedTable,
	isHeadingColumnCell,
	getEmptyTableCellBlocks,
	createEmptyTableCell,
	getInheritedTableCellAttributes
} from '../../src/utils/common.js';

describe( 'table utils', () => {
	let editor, model, modelRoot, tableUtils;
	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ Paragraph, TableEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				modelRoot = model.document.getRoot();
				tableUtils = editor.plugins.get( 'TableUtils' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'common', () => {
		describe( 'isHeadingColumnCell()', () => {
			it( 'should return "true" for a heading column cell', () => {
				_setModelData( model, modelTable( [
					[ '00', '01', '02', '03' ]
				], { headingColumns: 2 } ) );

				const tableCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );

				expect( isHeadingColumnCell( tableUtils, tableCell ) ).toBe( true );
			} );

			it( 'should return "true" for a heading column cell with colspan', () => {
				_setModelData( model, modelTable( [
					[ { colspan: 2, contents: '00' }, '01', '02', '03' ]
				], { headingColumns: 2 } ) );

				const tableCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );

				expect( isHeadingColumnCell( tableUtils, tableCell ) ).toBe( true );
			} );

			it( 'should return "false" for a regular column cell', () => {
				_setModelData( model, modelTable( [
					[ '00', '01', '02', '03' ]
				], { headingColumns: 2 } ) );

				const tableCell = modelRoot.getNodeByPath( [ 0, 0, 2 ] );

				expect( isHeadingColumnCell( tableUtils, tableCell ) ).toBe( false );
			} );

			it( 'should return "false" for a regular column cell with colspan', () => {
				_setModelData( model, modelTable( [
					[ '00', { colspan: 2, contents: '01' }, '02', '03' ]
				], { headingColumns: 1 } ) );

				const tableCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );

				expect( isHeadingColumnCell( tableUtils, tableCell ) ).toBe( false );
			} );
		} );

		describe( 'getSelectionAffectedTable', () => {
			it( 'should return null if table is not present', () => {
				_setModelData( model, '<paragraph>Foo[]</paragraph>' );
				const selection = new ModelSelection( model.createPositionFromPath( modelRoot, [ 0 ] ) );

				const tableElement = getSelectionAffectedTable( selection );

				expect( tableElement ).toBeNull();
			} );

			it( 'should return table if present higher in the model tree', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				const selection = new ModelSelection( model.createPositionFromPath( modelRoot, [ 0, 0, 0 ] ) );
				const tableElement = getSelectionAffectedTable( selection );

				expect( tableElement ).toBe( modelRoot.getNodeByPath( [ 0 ] ) );
			} );

			it( 'should return table if selected', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				const selection = new ModelSelection( model.createRangeOn( modelRoot.getChild( 0 ) ) );
				const tableElement = getSelectionAffectedTable( selection );

				expect( tableElement ).toBe( modelRoot.getNodeByPath( [ 0 ] ) );
			} );

			it( 'should return selected table if selected inside other table', () => {
				const innerTable = modelTable( [
					[ 'a', 'b' ],
					[ 'c', 'd' ]
				] );
				_setModelData( model, modelTable( [
					[ innerTable, '01' ],
					[ '10', '11' ]
				] ) );

				const selection = new ModelSelection( model.createRangeOn( modelRoot.getNodeByPath( [ 0, 0, 0, 0 ] ) ) );
				const tableElement = getSelectionAffectedTable( selection );

				expect( tableElement ).toBe( modelRoot.getNodeByPath( [ 0, 0, 0, 0 ] ) );
			} );
		} );

		describe( 'getEmptyTableCellBlocks()', () => {
			beforeEach( () => {
				model.schema.register( 'tableCaption', {
					allowIn: 'table',
					isLimit: true
				} );

				model.schema.register( 'tableColumnGroup', {
					allowIn: 'tableRow',
					isLimit: true
				} );
			} );

			it( 'skips a table child that is not a tableRow', () => {
				_setModelData( model, modelTable( [ [ '' ] ] ) );

				const table = modelRoot.getChild( 0 );
				const emptyParagraph = table.getNodeByPath( [ 0, 0, 0 ] );

				let result;

				model.change( writer => {
					writer.insertElement( 'tableCaption', writer.createPositionAt( table, 'end' ) );

					result = Array.from( getEmptyTableCellBlocks( table ) );
				} );

				expect( result ).toEqual( [ emptyParagraph ] );
			} );

			it( 'skips a row child that is not a tableCell', () => {
				_setModelData( model, modelTable( [ [ '' ] ] ) );

				const table = modelRoot.getChild( 0 );
				const row = table.getChild( 0 );
				const emptyParagraph = table.getNodeByPath( [ 0, 0, 0 ] );

				let result;

				model.change( writer => {
					writer.insertElement( 'tableColumnGroup', writer.createPositionAt( row, 'end' ) );

					result = Array.from( getEmptyTableCellBlocks( table ) );
				} );

				expect( result ).toEqual( [ emptyParagraph ] );
			} );

			it( 'skips a cell block that is not empty', () => {
				_setModelData( model, modelTable( [ [ '', 'already has text' ] ] ) );

				const table = modelRoot.getChild( 0 );
				const emptyParagraph = table.getNodeByPath( [ 0, 0, 0 ] );

				expect( Array.from( getEmptyTableCellBlocks( table ) ) ).toEqual( [ emptyParagraph ] );
			} );

			it( 'yields every empty cell block when the table is otherwise unremarkable', () => {
				_setModelData( model, modelTable( [ [ '', '' ], [ '', '' ] ] ) );

				const table = modelRoot.getChild( 0 );
				const blocks = Array.from( getEmptyTableCellBlocks( table ) );

				expect( blocks ).to.have.length( 4 );
			} );
		} );
	} );
} );

describe( 'table utils - inheriting table cell attributes', () => {
	let editor, model, modelRoot;

	beforeEach( async () => {
		editor = await ModelTestEditor.create( {
			plugins: [ Paragraph, TableEditing, TableCellPropertiesEditing, BoldEditing, ItalicEditing, AlignmentEditing, LinkEditing ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'createEmptyTableCell()', () => {
		it( 'should create a table cell with the given attributes and a paragraph with the given attributes', () => {
			_setModelData( model, modelTable( [ [ '00' ] ] ) );

			let tableCell;

			model.change( writer => {
				tableCell = createEmptyTableCell(
					writer,
					writer.createPositionAt( modelRoot.getNodeByPath( [ 0, 0 ] ), 'end' ),
					{ tableCellBackgroundColor: 'red' },
					{ alignment: 'right', 'selection:bold': true }
				);
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup( modelTable( [ [
				'00',
				{ contents: '<paragraph alignment="right" selection:bold="true"></paragraph>', tableCellBackgroundColor: 'red' }
			] ] ) );
			expect( tableCell ).toBe( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );
		} );
	} );

	describe( 'getInheritedTableCellAttributes()', () => {
		function getInherited( options ) {
			return getInheritedTableCellAttributes( model.schema, modelRoot.getNodeByPath( [ 0, 0, 0 ] ), options );
		}

		it( 'should return the formatting attributes of the table cell', () => {
			_setModelData( model, modelTable( [ [
				{ contents: '00', tableCellBackgroundColor: 'red', tableCellPadding: '3px' }
			] ] ) );

			expect( getInherited() ).toEqual( {
				cellAttributes: { tableCellBackgroundColor: 'red', tableCellPadding: '3px' },
				paragraphAttributes: {}
			} );
		} );

		it( 'should not return the table cell attributes that are not formatting attributes (for example, spans)', () => {
			_setModelData( model, modelTable( [
				[ { contents: '00', colspan: 2, rowspan: 2, tableCellBackgroundColor: 'red' } ],
				[]
			] ) );

			expect( getInherited().cellAttributes ).toEqual( { tableCellBackgroundColor: 'red' } );
		} );

		it( 'should not return the table cell width and height', () => {
			_setModelData( model, modelTable( [ [
				{ contents: '00', tableCellWidth: '100px', tableCellHeight: '50px', tableCellBackgroundColor: 'red' }
			] ] ) );

			expect( getInherited().cellAttributes ).toEqual( { tableCellBackgroundColor: 'red' } );
		} );

		it( 'should return the table cell type only when the `inheritCellType` option is set', () => {
			_setModelData( model, modelTable( [ [
				{ contents: '00', tableCellType: 'header', tableCellBackgroundColor: 'red' }
			] ], { headingRows: 1 } ) );

			expect( getInherited().cellAttributes ).toEqual( { tableCellBackgroundColor: 'red' } );
			expect( getInherited( { inheritCellType: true } ).cellAttributes ).toEqual( {
				tableCellType: 'header',
				tableCellBackgroundColor: 'red'
			} );
		} );

		it( 'should return the block formatting attributes of the first block and the text formatting of its first text node', () => {
			_setModelData( model, modelTable( [ [
				'<paragraph alignment="center"><$text bold="true" italic="true">foo</$text>bar</paragraph>' +
				'<paragraph alignment="right"><$text italic="true">baz</$text></paragraph>'
			] ] ) );

			expect( getInherited().paragraphAttributes ).toEqual( {
				alignment: 'center',
				'selection:bold': true,
				'selection:italic': true
			} );
		} );

		it( 'should not return the text attributes that do not continue on enter (for example, links)', () => {
			_setModelData( model, modelTable( [ [
				'<paragraph><$text bold="true" linkHref="https://example.com">foo</$text></paragraph>'
			] ] ) );

			expect( getInherited().paragraphAttributes ).toEqual( { 'selection:bold': true } );
		} );

		it( 'should not return the block attributes that are not formatting attributes', () => {
			model.schema.extend( 'paragraph', { allowAttributes: [ 'customData' ] } );

			_setModelData( model, modelTable( [ [ '<paragraph alignment="center" customData="foo">00</paragraph>' ] ] ) );

			expect( getInherited().paragraphAttributes ).toEqual( { alignment: 'center' } );
		} );

		it( 'should not return the block formatting attributes that are not allowed on a paragraph', () => {
			model.schema.register( 'customBlock', { inheritAllFrom: '$block', allowAttributes: [ 'customFormat' ] } );
			model.schema.setAttributeProperties( 'customFormat', { isFormatting: true } );

			_setModelData( model, modelTable( [ [ '<customBlock customFormat="foo">00</customBlock>' ] ] ) );

			expect( getInherited().paragraphAttributes ).toEqual( {} );
		} );

		it( 'should return the text formatting of the first text node when the first block starts with an inline object', () => {
			model.schema.register( 'inlineObject', { inheritAllFrom: '$inlineObject' } );

			_setModelData( model, modelTable( [ [
				'<paragraph><inlineObject></inlineObject><$text bold="true">foo</$text></paragraph>'
			] ] ) );

			expect( getInherited().paragraphAttributes ).toEqual( { 'selection:bold': true } );
		} );

		it( 'should return the text formatting stored in an empty first block', () => {
			_setModelData( model, modelTable( [ [ '' ] ] ) );

			model.change( writer => {
				writer.setAttribute( 'selection:bold', true, modelRoot.getNodeByPath( [ 0, 0, 0, 0 ] ) );
				writer.setAttribute( 'selection:linkHref', 'https://example.com', modelRoot.getNodeByPath( [ 0, 0, 0, 0 ] ) );
			} );

			expect( getInherited().paragraphAttributes ).toEqual( { 'selection:bold': true } );
		} );

		it( 'should ignore the text formatting stored in a non-empty first block', () => {
			_setModelData( model, modelTable( [ [ '<paragraph><$text italic="true">foo</$text></paragraph>' ] ] ) );

			model.change( writer => {
				writer.setAttribute( 'selection:bold', true, modelRoot.getNodeByPath( [ 0, 0, 0, 0 ] ) );
			} );

			expect( getInherited().paragraphAttributes ).toEqual( { 'selection:italic': true } );
		} );

		it( 'should return only the table cell attributes when the first block does not allow text', () => {
			model.schema.register( 'blockObject', { inheritAllFrom: '$blockObject', allowAttributes: [ 'alignment' ] } );

			_setModelData( model, modelTable( [ [
				{ contents: '<blockObject alignment="center"></blockObject>', tableCellBackgroundColor: 'red' }
			] ] ) );

			expect( getInherited() ).toEqual( {
				cellAttributes: { tableCellBackgroundColor: 'red' },
				paragraphAttributes: {}
			} );
		} );
	} );
} );
