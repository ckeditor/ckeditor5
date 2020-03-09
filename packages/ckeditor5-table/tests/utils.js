/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import TableSelection from '../src/tableselection';
import TableEditing from '../src/tableediting';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { modelTable } from './_utils/utils';
import { getSelectedTableCells } from '../src/utils';

describe( 'table utils', () => {
	let editor, model, tableSelection, modelRoot;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableEditing, TableSelection, Paragraph ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		tableSelection = editor.plugins.get( TableSelection );

		setModelData( model, modelTable( [
			[ '11[]', '12', '13' ],
			[ '21', '22', '23' ],
			[ '31', '32', '33' ]
		] ) );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'getSelectedTableCells()', () => {
		let selection;

		beforeEach( () => {
			selection = model.document.selection;
		} );

		it( 'should return an empty array when a collapsed selection is anchored in a cell', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );

			model.change( writer => {
				writer.setSelection( writer.createRange( writer.createPositionAt( firstCell, 0 ) ) );
			} );

			expect( getSelectedTableCells( selection ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty array when a non-collapsed selection is anchored in a cell', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );

			model.change( writer => {
				writer.setSelection( writer.createRangeIn( firstCell ) );
			} );

			expect( getSelectedTableCells( selection ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty array when a non-cell node is selected', () => {
			const paragraph = modelRoot.getNodeByPath( [ 0, 0, 0, 0 ] );

			expect( paragraph.is( 'paragraph' ) ).to.be.true;

			model.change( writer => {
				writer.setSelection( writer.createRangeOn( paragraph ) );
			} );

			expect( getSelectedTableCells( selection ) ).to.deep.equal( [] );
		} );

		it( 'should return an empty array when an entire table is selected', () => {
			const table = modelRoot.getNodeByPath( [ 0 ] );

			model.change( writer => {
				writer.setSelection( writer.createRangeOn( table ) );
			} );

			expect( getSelectedTableCells( selection ) ).to.deep.equal( [] );
		} );

		it( 'should return two table cells', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );

			tableSelection._setCellSelection( firstCell, lastCell );

			expect( Array.from( getSelectedTableCells( selection ) ) ).to.deep.equal( [
				firstCell, lastCell
			] );
		} );

		it( 'should return four table cells for diagonal selection', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

			tableSelection._setCellSelection( firstCell, lastCell );

			expect( Array.from( getSelectedTableCells( selection ) ) ).to.deep.equal( [
				firstCell,
				modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
				lastCell
			] );
		} );

		it( 'should return row table cells', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 0, 2 ] );

			tableSelection._setCellSelection( firstCell, lastCell );

			expect( Array.from( getSelectedTableCells( selection ) ) ).to.deep.equal( [
				firstCell,
				modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
				lastCell
			] );
		} );

		it( 'should return column table cells', () => {
			const firstCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );
			const lastCell = modelRoot.getNodeByPath( [ 0, 2, 1 ] );

			tableSelection._setCellSelection( firstCell, lastCell );

			expect( Array.from( getSelectedTableCells( selection ) ) ).to.deep.equal( [
				firstCell,
				modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
				lastCell
			] );
		} );
	} );
} );
