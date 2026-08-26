/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData, ModelSelection } from '@ckeditor/ckeditor5-engine';

import { TableEditing } from '../../src/tableediting.js';
import { modelTable } from '../_utils/utils.js';

import { getSelectionAffectedTable, isHeadingColumnCell, getEmptyTableCellBlocks } from '../../src/utils/common.js';

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
